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

    public List<Emenda> listAll() {
        return emendaRepository.listAll();
    }

    public Emenda findById(String id) {
        if (id == null) return null;
        return emendaRepository.findById(id);
    }

    /**
     * Get all emendas with enriched institution and councilor data
     */
    public List<EmendaDetailDTO> listAllWithDetails() {
        List<Emenda> emendas = emendaRepository.listAll();
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
        emenda.createTime = OffsetDateTime.now();
        emenda.updateTime = OffsetDateTime.now();

        boolean hasDetail = (emenda.objectDetail != null && !emenda.objectDetail.isBlank());

        // On creation we always start as "Pendente"
        if (emenda.status == null || emenda.status.isBlank()) {
            emenda.status = "Pendente";
        }
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
            "Emenda criada como pendente",
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
        existing.category = updated.category;
        existing.status = updated.status;
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

        String statusAnterior = emenda.status;
        String novoStatus;
        String acaoRegistrada;

        switch (acao.acao.toUpperCase()) {
            case "APROVAR":
                novoStatus = "Aprovada";
                acaoRegistrada = "APROVADA";
                break;
            case "DEVOLVER":
                novoStatus = "Retificar";
                acaoRegistrada = "DEVOLVIDA";
                break;
            case "REPROVAR":
                novoStatus = "Rejeitada";
                acaoRegistrada = "REPROVADA";
                break;
            case "SOLICITAR_APROVACAO":
                novoStatus = "Pendente";
                acaoRegistrada = "SOLICITADA_APROVACAO";
                break;
            case "AGUARDAR_DETALHAMENTO":
                novoStatus = "Aguardando Detalhamento";
                acaoRegistrada = "AGUARDANDO_DETALHAMENTO";
                break;
            default:
                return null;
        }

        emenda.status = novoStatus;
        emenda.updateTime = OffsetDateTime.now();

        // Register action in history
        EmendaHistorico historico = new EmendaHistorico(
            emenda,
            acaoRegistrada,
            statusAnterior,
            novoStatus,
            acao.observacao,
            acao.usuario
        );
        historicoRepository.persist(historico);

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
