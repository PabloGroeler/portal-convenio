package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Emenda;
import org.acme.entity.EmendaHistorico;
import org.acme.entity.Instituicao;
import org.acme.entity.Parlamentar;
import org.acme.repository.EmendaRepository;
import org.acme.repository.EmendaHistoricoRepository;
import org.acme.dto.EmendaAcaoDTO;
import org.acme.dto.EmendaHistoricoDTO;
import org.acme.dto.EmendaDetailDTO;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class EmendaService {

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
        List<Emenda> emendas = emendaRepository.listAll();
        // Force initialization of anexos while the session is open
        for (Emenda e : emendas) {
            if (e.anexos != null) {
                int ignored = e.anexos.size();
            }
        }
        return emendas;
    }

    public Emenda findById(String id) {
        if (id == null) return null;
        Emenda e = emendaRepository.findById(id);
        if (e != null && e.anexos != null) {
            // Ensure anexos are initialized for serialization
            int ignored = e.anexos.size();
        }
        return e;
    }

    /**
     * Get all emendas with enriched institution and councilor data
     */
    public List<EmendaDetailDTO> listAllWithDetails() {
        List<Emenda> emendas = listAllInitialized();
        return emendas.stream()
                .map(this::enrichEmendaWithDetails)
                .collect(Collectors.toList());
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

        if (emenda.idInstituicao != null && !emenda.idInstituicao.isBlank()) {
            institution = institutionService.findByInstitutionId(emenda.idInstituicao);
        }

        if (emenda.idParlamentar != null && !emenda.idParlamentar.isBlank()) {
            councilor = councilorService.findByCouncilorId(emenda.idParlamentar);
        }

        return new EmendaDetailDTO(emenda, institution, councilor);
    }

    @Transactional
    public Emenda create(Emenda emenda, String usuario) {
        if (emenda.situacao == null) {
            emenda.situacao = null;
        } else {
            switch (emenda.situacao.trim()) {
                case "Aprovada pelo Gestor":
                    emenda.situacao = "Concluído";
                    break;
                case "Em andamento":
                    emenda.situacao = "Recebido";
                    break;
                case "Devolvida para Retificação":
                    emenda.situacao = "Devolvido";
                    break;
                default:
                    emenda.situacao = "Recebido";
            }
        }

        emendaValidationService.validateOrThrow(emenda, false);

        // JIRA 5: apply business rules per tipo de emenda
        emendaRulesEngine.validateOrThrow(emenda);

        emenda.dataCriacao = OffsetDateTime.now();
        emenda.dataAtualizacao = OffsetDateTime.now();

        if (emenda.situacao == null || emenda.situacao.isBlank()) {
            emenda.situacao = "Recebido";
        }

        statusCicloVidaEmendaService.validateOrThrow(emenda.situacao);
        emenda.situacao = statusCicloVidaEmendaService.normalize(emenda.situacao);

        boolean hasDetail = (emenda.objetoDetalhado != null && !emenda.objetoDetalhado.isBlank());

        if (emenda.data == null) {
            emenda.data = java.time.LocalDate.now();
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

        String statusAnterior = existing.situacao;

        boolean wasEmpty = (existing.objetoDetalhado == null || existing.objetoDetalhado.isBlank());
        boolean nowHasValue = (updated.objetoDetalhado != null && !updated.objetoDetalhado.isBlank());
        boolean detailAdded = wasEmpty && nowHasValue;

        // Task-10 fields
        existing.numeroEmenda = updated.numeroEmenda;
        existing.exercicio = updated.exercicio;
        existing.idParlamentar = updated.idParlamentar;
        existing.codigoOficial = updated.codigoOficial;
        existing.data = updated.data;
        existing.valor = updated.valor;
        existing.classificacao = updated.classificacao;
        existing.esfera = updated.esfera;
        existing.existeConvenio = updated.existeConvenio;
        existing.numeroConvenio = updated.numeroConvenio;
        existing.anoConvenio = updated.anoConvenio;
        existing.categoria = updated.categoria;
        existing.situacao = updated.situacao;
        existing.statusCicloVida = updated.statusCicloVida;
        existing.statusFederal = updated.statusFederal;
        existing.idInstituicao = updated.idInstituicao;
        existing.linkAssinado = updated.linkAssinado;
        // Replace anexos list (null-safe)
        existing.anexos.clear();
        if (updated.anexos != null) {
            existing.anexos.addAll(updated.anexos.stream()
                    .filter(a -> a != null && !a.isBlank())
                    .toList());
        }
        existing.descricao = updated.descricao;
        existing.objetoDetalhado = updated.objetoDetalhado;
        existing.previsaoConclusao = updated.previsaoConclusao;
        existing.justificativa = updated.justificativa;
        existing.dataAtualizacao = OffsetDateTime.now();

        // Register generic update in history
        historicoRepository.persist(new EmendaHistorico(
            existing,
            "ATUALIZADA",
            statusAnterior,
            existing.situacao,
            "Dados da emenda atualizados",
            usuario
        ));

        // If objetoDetalhado was just filled, update the pending detailing entry to "enviado"
        if (detailAdded) {
            EmendaHistorico pendente = historicoRepository.findLatestDetalhamentoPendente(id).orElse(null);
            if (pendente != null) {
                pendente.acao = "DETALHAMENTO_ENVIADO";
                pendente.statusAnterior = statusAnterior;
                pendente.statusNovo = existing.situacao;
                pendente.observacao = "Formulário de detalhamento enviado";
                pendente.usuario = (usuario != null ? usuario : "sistema");
                pendente.dataHora = OffsetDateTime.now();
            } else {
                // Fallback: if there was no pending record, create the "enviado" one
                historicoRepository.persist(new EmendaHistorico(
                    existing,
                    "DETALHAMENTO_ENVIADO",
                    statusAnterior,
                    existing.situacao,
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

        // Anexos is an @ElementCollection and may be lazily loaded.
        // Ensure it's initialized inside the transaction so DTO mapping/JSON serialization won't fail.
        if (emenda.anexos != null) {
            int ignored = emenda.anexos.size();
        }

        if (acao == null || acao.acao == null || acao.acao.isBlank()) {
            throw new IllegalArgumentException("Ação é obrigatória");
        }

        String statusAnterior = emenda.situacao;
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
            default:
                // Unknown action should be treated as a client error, not a server error.
                throw new IllegalArgumentException("Ação inválida: " + acao.acao);
        }

        emenda.situacao = novoStatus;
        // Keep lifecycle field aligned if present
        emenda.dataAtualizacao = OffsetDateTime.now();

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

        // Keep anexos initialized after the change as well.
        if (emenda.anexos != null) {
            int ignored = emenda.anexos.size();
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
