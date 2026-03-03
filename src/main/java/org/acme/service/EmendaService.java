package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Emenda;
import org.acme.entity.EmendaHistorico;
import org.acme.entity.Institution;
import org.acme.entity.Councilor;
import org.acme.repository.EmendaRepository;
import org.acme.repository.EmendaHistoricoRepository;
import org.acme.dto.EmendaAcaoDTO;
import org.acme.dto.EmendaHistoricoDTO;
import org.acme.dto.EmendaDetailDTO;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

@ApplicationScoped
public class EmendaService {

    private static final Logger log = Logger.getLogger(EmendaService.class);

    @Inject
    EmendaRepository emendaRepository;

    @Inject
    EmendaHistoricoRepository historicoRepository;

    @Inject
    InstitutionService institutionService;

    @Inject
    CouncilorService councilorService;

    @Inject
    EmendaRulesEngine emendaRulesEngine;

    @Inject
    StatusCicloVidaEmendaService statusCicloVidaEmendaService;

    @Inject
    EmendaValidationService emendaValidationService;

    public List<Emenda> listAll() {
        // Note: Emenda.attachments is an @ElementCollection and can be lazily loaded.
        // If we return entities outside a transaction, Jackson serialization may trigger
        // LazyInitializationException. Keep listing transactional and initialize attachments.
        return listAllInitialized();
    }

    @Transactional
    public List<Emenda> listAllInitialized() {
        List<Emenda> emendas = emendaRepository.listAllOrderedByDate();
        for (Emenda e : emendas) {
            if (e.attachments != null) {
                int ignored = e.attachments.size();
            }
        }
        return emendas;
    }

    public Emenda findById(String id) {
        if (id == null) return null;
        Emenda e = emendaRepository.findById(id);
        if (e != null && e.attachments != null) {
            // Ensure attachments are initialized for serialization
            int ignored = e.attachments.size();
        }
        return e;
    }

    /**
     * Get all emendas with enriched institution and councilor data
     */
    public List<EmendaDetailDTO> listAllWithDetails() {
        log.info("📋 EmendaService.listAllWithDetails() - Starting");
        List<Emenda> emendas = listAllInitialized();
        log.info("📋 Found " + (emendas != null ? emendas.size() : 0) + " emendas in database");

        if (emendas == null || emendas.isEmpty()) {
            log.warn("⚠️ No emendas found in database - returning empty list");
            return new ArrayList<>();
        }

        List<EmendaDetailDTO> result = emendas.stream()
                .map(this::enrichEmendaWithDetails)
                .collect(Collectors.toList());

        log.info("✅ Returning " + result.size() + " enriched emendas");
        return result;
    }

    /**
     * Story 4 — Role-based visibility filter.
     *
     * Rules applied on top of listAllWithDetails():
     *   • SECRETARIA: can see "Análise de demanda aprovada" only for Direta.
     *     Indireta at that status belongs to Convênios.
     *     Additionally filtered to only the secretaria the user is linked to.
     *   • CONVENIOS: can see "Análise de demanda aprovada" only for Indireta.
     *     Direta at that status goes back to the Secretaria.
     *   • ADMIN / ORCAMENTO / others: see everything (no filter applied here).
     */
    @Transactional
    public List<EmendaDetailDTO> listWithDetailsForUser(String username) {
        org.acme.entity.User caller = org.acme.entity.User.findByUsername(username);
        List<EmendaDetailDTO> all = listAllWithDetails();
        if (caller == null) return all;

        org.acme.entity.User.UserRole role = caller.role;

        // ADMIN, ORCAMENTO and unrecognised roles: no additional filter
        if (role == org.acme.entity.User.UserRole.ADMIN ||
            role == org.acme.entity.User.UserRole.ORCAMENTO) {
            return all;
        }

        final String DEMANDA_APROVADA = "Análise de demanda aprovada";

        if (role == org.acme.entity.User.UserRole.SECRETARIA) {
            // Secretaria sees:
            //   • Everything that is NOT "Análise de demanda aprovada + Indireta"
            //     (that belongs to Convênios)
            //   • For statuses that require secretaria routing, filter to own secretaria
            final String userSecretaria = caller.secretaria;
            return all.stream().filter(e -> {
                boolean isDemandaAprovada = DEMANDA_APROVADA.equalsIgnoreCase(e.status);
                boolean isIndireta = "Indireta".equalsIgnoreCase(e.tipoTransferencia);
                // Hide: Demanda Aprovada + Indireta (that's for Convênios)
                if (isDemandaAprovada && isIndireta) return false;
                // For emendas with secretariaDestino, only show those that match the user's secretaria
                if (e.secretariaDestino != null && !e.secretariaDestino.isBlank() &&
                    userSecretaria != null && !userSecretaria.isBlank()) {
                    return e.secretariaDestino.equalsIgnoreCase(userSecretaria);
                }
                return true;
            }).collect(Collectors.toList());
        }

        if (role == org.acme.entity.User.UserRole.CONVENIOS) {
            // Convênios sees:
            //   • Everything that is NOT "Análise de demanda aprovada + Direta"
            //     (that goes back to the Secretaria)
            return all.stream().filter(e -> {
                boolean isDemandaAprovada = DEMANDA_APROVADA.equalsIgnoreCase(e.status);
                boolean isDireta = "Direta".equalsIgnoreCase(e.tipoTransferencia) ||
                                   e.tipoTransferencia == null; // null defaults to Direta
                // Hide: Demanda Aprovada + Direta (not for Convênios)
                if (isDemandaAprovada && isDireta) return false;
                return true;
            }).collect(Collectors.toList());
        }

        // All other roles (OPERADOR, GESTOR, ANALISTA, JURIDICO): no filter
        return all;
    }

    /**
     * Get a single emenda with enriched institution and councilor data
     */
    public EmendaDetailDTO findByIdWithDetails(String id) {
        Emenda emenda = findById(id);
        if (emenda == null) return null;
        return enrichEmendaWithDetails(emenda);
    }

    /**
     * Enrich an emenda with institution and councilor data
     */
    private EmendaDetailDTO enrichEmendaWithDetails(Emenda emenda) {
        Institution institution = null;
        Councilor councilor = null;

        if (emenda.institutionId != null && !emenda.institutionId.isBlank()) {
            institution = institutionService.findByInstitutionId(emenda.institutionId);
        }

        if (emenda.councilorId != null && !emenda.councilorId.isBlank()) {
            councilor = councilorService.findByCouncilorId(emenda.councilorId);
        }

        return new EmendaDetailDTO(emenda, institution, councilor);
    }

    @Transactional
    public Emenda create(Emenda emenda, String usuario) {
        if (emenda.status == null) {
            emenda.status = null;
        } else {
            switch (emenda.status.trim()) {
                case "Aprovada pelo Gestor":
                    emenda.status = "Concluído";
                    break;
                case "Em andamento":
                    emenda.status = "Recebido";
                    break;
                case "Devolvida para Retificação":
                    emenda.status = "Devolvido";
                    break;
                default:
                    emenda.status = "Recebido";
            }
        }

        emendaValidationService.validateOrThrow(emenda, false);

        // JIRA 5: apply business rules per tipo de emenda
        emendaRulesEngine.validateOrThrow(emenda);

        emenda.createTime = OffsetDateTime.now();
        emenda.updateTime = OffsetDateTime.now();

        if (emenda.status == null || emenda.status.isBlank()) {
            emenda.status = "Recebido";
        }

        statusCicloVidaEmendaService.validateOrThrow(emenda.status);
        emenda.status = statusCicloVidaEmendaService.normalize(emenda.status);

        boolean hasDetail = (emenda.objectDetail != null && !emenda.objectDetail.isBlank());

        if (emenda.date == null) {
            emenda.date = java.time.LocalDate.now();
        }

        emendaRepository.persist(emenda);
        emendaRepository.flush();

        // History #1: Pendente
        historicoRepository.persist(new EmendaHistorico(
            emenda,
            "PENDENTE",
            null,
            "Pendente",
            "Emenda criada",
            usuario != null ? usuario : "sistema"
        ));

        // History #2 (optional): if objectDetail is already filled, mark detailing as pending (not sent yet)
        if (hasDetail) {
            historicoRepository.persist(new EmendaHistorico(
                emenda,
                "DETALHAMENTO_PENDENTE",
                "Pendente",
                "Pendente",
                "Formulário de detalhamento pendente",
                usuario != null ? usuario : "sistema"
            ));
        }

        return emenda;
    }

    @Transactional
    public Emenda update(String id, Emenda updated, String usuario) {
        // Task-10: Validate all required fields and constraints
        emendaValidationService.validateOrThrow(updated, true);

        // JIRA 5: apply business rules per tipo de emenda
        emendaRulesEngine.validateOrThrow(updated);

        Emenda existing = emendaRepository.findById(id);
        if (existing == null) return null;

        String statusAnterior = existing.status;

        boolean wasEmpty = (existing.objectDetail == null || existing.objectDetail.isBlank());
        boolean nowHasValue = (updated.objectDetail != null && !updated.objectDetail.isBlank());
        boolean detailAdded = wasEmpty && nowHasValue;

        existing.councilorId = updated.councilorId;
        existing.officialCode = updated.officialCode;
        existing.date = updated.date;
        existing.value = updated.value;
        existing.classification = updated.classification;
        existing.esfera = updated.esfera;
        existing.existeConvenio = updated.existeConvenio;
        existing.numeroConvenio = updated.numeroConvenio;
        existing.anoConvenio = updated.anoConvenio;
        existing.category = updated.category;
        existing.status = updated.status;
        existing.statusCicloVida = updated.statusCicloVida;
        existing.federalStatus = updated.federalStatus;
        existing.institutionId = updated.institutionId;
        existing.signedLink = updated.signedLink;
        // Replace attachments list (null-safe)
        existing.attachments.clear();
        if (updated.attachments != null) {
            existing.attachments.addAll(updated.attachments.stream()
                    .filter(a -> a != null && !a.isBlank())
                    .toList());
        }
        existing.description = updated.description;
        existing.objectDetail = updated.objectDetail;
        existing.tipoTransferencia = updated.tipoTransferencia;
        existing.dotacaoOrcamentariaId = updated.dotacaoOrcamentariaId;
        existing.dotacaoOrcamentariaTexto = updated.dotacaoOrcamentariaTexto;
        existing.funcaoCodigo = updated.funcaoCodigo;
        existing.updateTime = OffsetDateTime.now();

        // Register generic update in history
        historicoRepository.persist(new EmendaHistorico(
            existing,
            "ATUALIZADA",
            statusAnterior,
            existing.status,
            "Dados da emenda atualizados",
            usuario
        ));

        // If objectDetail was just filled, update the pending detailing entry to "enviado"
        if (detailAdded) {
            EmendaHistorico pendente = historicoRepository.findLatestDetalhamentoPendente(id).orElse(null);
            if (pendente != null) {
                pendente.acao = "DETALHAMENTO_ENVIADO";
                pendente.statusAnterior = statusAnterior;
                pendente.statusNovo = existing.status;
                pendente.observacao = "Formulário de detalhamento enviado";
                pendente.usuario = (usuario != null ? usuario : "sistema");
                pendente.dataHora = OffsetDateTime.now();
            } else {
                // Fallback: if there was no pending record, create the "enviado" one
                historicoRepository.persist(new EmendaHistorico(
                    existing,
                    "DETALHAMENTO_ENVIADO",
                    statusAnterior,
                    existing.status,
                    "Formulário de detalhamento enviado",
                    usuario != null ? usuario : "sistema"
                ));
            }
        }

        return existing;
    }

    @Transactional
    public Emenda executarAcao(String id, EmendaAcaoDTO acao) {
        Emenda emenda = emendaRepository.findById(id);
        if (emenda == null) return null;

        // Attachments is an @ElementCollection and may be lazily loaded.
        // Ensure it's initialized inside the transaction so DTO mapping/JSON serialization won't fail.
        if (emenda.attachments != null) {
            int ignored = emenda.attachments.size();
        }

        if (acao == null || acao.acao == null || acao.acao.isBlank()) {
            throw new IllegalArgumentException("Ação é obrigatória");
        }

        String statusAnterior = emenda.status;
        String novoStatus;
        String acaoRegistrada;

        switch (acao.acao.toUpperCase()) {
            case "APROVAR":
                novoStatus = "Concluído";
                acaoRegistrada = "APROVADA";
                break;
            case "DEVOLVER":
                novoStatus = "Devolvido";
                acaoRegistrada = "DEVOLVIDA";
                break;
            case "REPROVAR":
                novoStatus = "Devolvido";
                acaoRegistrada = "REPROVADA";
                break;
            case "SOLICITAR_APROVACAO":
                novoStatus = "Recebido";
                acaoRegistrada = "SOLICITADA_APROVACAO";
                break;
            case "AGUARDAR_DETALHAMENTO":
                novoStatus = "Iniciado";
                acaoRegistrada = "AGUARDANDO_DETALHAMENTO";
                break;
            case "INICIAR_ANALISE":
                novoStatus = "Em análise de admissibilidade";
                acaoRegistrada = "EM_ANALISE_ADMISSIBILIDADE";
                break;
            case "APROVAR_ADMISSIBILIDADE":
                novoStatus = "Admissibilidade aprovada";
                acaoRegistrada = "ADMISSIBILIDADE_APROVADA";
                // Salvar secretaria de destino na emenda
                if (acao.secretariaDestino != null && !acao.secretariaDestino.isBlank()) {
                    emenda.secretariaDestino = acao.secretariaDestino;
                }
                // Texto da linha do tempo com nome da secretaria
                String secNome = (acao.secretariaDestino != null && !acao.secretariaDestino.isBlank())
                    ? acao.secretariaDestino : "secretaria não informada";
                acao.observacao = "Admissibilidade aprovada, encaminhada a secretaria " + secNome +
                    (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                break;
            case "REPROVAR_ADMISSIBILIDADE":
                novoStatus = "Devolvida ao legislativo";
                acaoRegistrada = "DEVOLVIDA_LEGISLATIVO";
                acao.observacao = "Inviabilidade de Admissibilidade, encaminhada ao legislativo" +
                    (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                break;
            case "INICIAR_ANALISE_DEMANDA":
                novoStatus = "Em análise de demanda";
                acaoRegistrada = "EM_ANALISE_DEMANDA";
                break;
            case "APROVAR_DEMANDA":
                // Story 3: only route to Convênios when tipoTransferencia = "Indireta"
                boolean isIndireta = "Indireta".equalsIgnoreCase(emenda.tipoTransferencia);
                if (isIndireta) {
                    novoStatus = "Análise de demanda aprovada";
                    acaoRegistrada = "ANALISE_DEMANDA_APROVADA";
                    acao.observacao = "Viabilidade da demanda aprovada, encaminhado ao Setor de Convênios" +
                        (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                } else {
                    // Direta: demand approved, no Convênios step needed
                    novoStatus = "Análise de demanda aprovada";
                    acaoRegistrada = "ANALISE_DEMANDA_APROVADA";
                    acao.observacao = "Viabilidade da demanda aprovada, encaminhado para execução direta" +
                        (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                }
                break;
            case "REPROVAR_DEMANDA":
                novoStatus = "Devolvida por incompatibilidade de demanda";
                acaoRegistrada = "DEVOLVIDA_INCOMPATIBILIDADE_DEMANDA";
                acao.observacao = "Inviabilidade da demanda, encaminhada ao setor de Orçamento" +
                    (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                break;
            case "INICIAR_ANALISE_DOCUMENTAL":
                // Story 5: Direta executions are finalised after demand approval — no documental step
                if (!"Indireta".equalsIgnoreCase(emenda.tipoTransferencia)) {
                    throw new IllegalArgumentException(
                        "Análise documental não se aplica a emendas com execução Direta. " +
                        "O processo é considerado encerrado após a aprovação da demanda.");
                }
                novoStatus = "Em análise documental";
                acaoRegistrada = "EM_ANALISE_DOCUMENTAL";
                break;
            case "APROVAR_DOCUMENTAL":
                // Story 5: guard — should never reach here for Direta
                if (!"Indireta".equalsIgnoreCase(emenda.tipoTransferencia)) {
                    throw new IllegalArgumentException(
                        "Aprovação documental não se aplica a emendas com execução Direta.");
                }
                novoStatus = "Análise documental aprovada";
                acaoRegistrada = "ANALISE_DOCUMENTAL_APROVADA";
                acao.observacao = "Viabilidade documental aprovada, encaminhado para elaboração do termo de fomento e empenho" +
                    (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                break;
            case "REPROVAR_DOCUMENTAL":
                // Story 5: guard — should never reach here for Direta
                if (!"Indireta".equalsIgnoreCase(emenda.tipoTransferencia)) {
                    throw new IllegalArgumentException(
                        "Reprovação documental não se aplica a emendas com execução Direta.");
                }
                novoStatus = "Devolvida por inviabilidade documental";
                acaoRegistrada = "DEVOLVIDA_INVIABILIDADE_DOCUMENTAL";
                acao.observacao = "Inviabilidade documental, encaminhada ao setor de Orçamento" +
                    (acao.observacao != null && !acao.observacao.isBlank() ? ". " + acao.observacao : "");
                break;
            default:
                throw new IllegalArgumentException("Ação inválida: " + acao.acao);
        }

        emenda.status = novoStatus;
        // Keep lifecycle field aligned if present
        emenda.updateTime = OffsetDateTime.now();

        // Register action in history
        EmendaHistorico historico = new EmendaHistorico(
            emenda,
            acaoRegistrada,
            statusAnterior,
            novoStatus,
            acao.observacao,
            (acao.usuario == null || acao.usuario.isBlank()) ? "sistema" : acao.usuario
        );
        historicoRepository.persist(historico);

        // Keep attachments initialized after the change as well.
        if (emenda.attachments != null) {
            int ignored = emenda.attachments.size();
        }

        return emenda;
    }

    @Transactional
    public List<EmendaHistoricoDTO> getHistorico(String emendaId) {
        return historicoRepository.findByEmendaId(emendaId)
            .stream()
            .map(EmendaHistoricoDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public boolean delete(String id) {
        Emenda existing = emendaRepository.findById(id);
        if (existing == null) return false;
        // Delete history first
        historicoRepository.delete("emenda.id", id);
        emendaRepository.delete(existing);
        return true;
    }
}
