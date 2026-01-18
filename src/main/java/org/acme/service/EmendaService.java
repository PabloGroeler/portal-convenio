package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Emenda;
import org.acme.entity.EmendaHistorico;
import org.acme.repository.EmendaRepository;
import org.acme.repository.EmendaHistoricoRepository;
import org.acme.dto.EmendaAcaoDTO;
import org.acme.dto.EmendaHistoricoDTO;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class EmendaService {

    @Inject
    EmendaRepository emendaRepository;

    @Inject
    EmendaHistoricoRepository historicoRepository;

    public List<Emenda> listAll() {
        return emendaRepository.listAll();
    }

    public Emenda findById(Long id) {
        if (id == null) return null;
        return emendaRepository.findById(id);
    }

    @Transactional
    public Emenda create(Emenda emenda, String usuario) {
        emenda.createTime = OffsetDateTime.now();
        emenda.updateTime = OffsetDateTime.now();
        if (emenda.status == null) {
            emenda.status = "Pendente";
        }
        emendaRepository.persist(emenda);

        // Register creation in history
        EmendaHistorico historico = new EmendaHistorico(
            emenda,
            "CRIADA",
            null,
            emenda.status,
            "Emenda criada no sistema",
            usuario
        );
        historicoRepository.persist(historico);

        return emenda;
    }

    @Transactional
    public Emenda update(Long id, Emenda updated, String usuario) {
        Emenda existing = emendaRepository.findById(id);
        if (existing == null) return null;

        String statusAnterior = existing.status;

        existing.name = updated.name;
        existing.legalName = updated.legalName;
        existing.cnpj = updated.cnpj;
        existing.category = updated.category;
        existing.link = updated.link;
        existing.contactEmail = updated.contactEmail;
        existing.contactPhone = updated.contactPhone;
        existing.updateTime = OffsetDateTime.now();
        // New fields
        existing.code = updated.code;
        existing.year = updated.year;
        existing.value = updated.value;
        existing.status = updated.status;
        existing.description = updated.description;
        existing.institution = updated.institution;
        existing.parlamentar = updated.parlamentar;
        existing.hasDetail = updated.hasDetail;

        // Register update in history
        EmendaHistorico historico = new EmendaHistorico(
            existing,
            "ATUALIZADA",
            statusAnterior,
            existing.status,
            "Dados da emenda atualizados",
            usuario
        );
        historicoRepository.persist(historico);

        return existing;
    }

    @Transactional
    public Emenda executarAcao(Long id, EmendaAcaoDTO acao) {
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

    public List<EmendaHistoricoDTO> getHistorico(Long emendaId) {
        return historicoRepository.findByEmendaId(emendaId)
            .stream()
            .map(EmendaHistoricoDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public boolean delete(Long id) {
        Emenda existing = emendaRepository.findById(id);
        if (existing == null) return false;
        // Delete history first
        historicoRepository.delete("emenda.id", id);
        emendaRepository.delete(existing);
        return true;
    }
}

