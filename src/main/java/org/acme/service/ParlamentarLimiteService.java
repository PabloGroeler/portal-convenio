package org.acme.service;

import org.acme.dto.ParlamentarLimiteDTO;
import org.acme.entity.ParlamentarLimite;
import org.acme.repository.ParlamentarLimiteRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@ApplicationScoped
public class ParlamentarLimiteService {

    @Inject
    ParlamentarLimiteRepository repo;

    public List<ParlamentarLimiteDTO> listAll() {
        return repo.listAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ParlamentarLimiteDTO> listByParlamentar(String parlamentarId) {
        return repo.findByParlamentar(parlamentarId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public ParlamentarLimiteDTO findById(Long id) {
        ParlamentarLimite p = repo.findById(id);
        return p == null ? null : toDto(p);
    }

    @Transactional
    public ParlamentarLimiteDTO create(String parlamentarId, Integer ano, BigDecimal valorAnual) {
        // ensure uniqueness
        if (repo.findByParlamentarAndAno(parlamentarId, ano).isPresent()) {
            throw new IllegalArgumentException("Limite já existe para esse parlamentar e ano");
        }
        ParlamentarLimite p = new ParlamentarLimite();
        p.parlamentarId = parlamentarId;
        p.ano = ano;
        p.valorAnual = valorAnual;
        p.createdAt = LocalDateTime.now();
        p.updatedAt = LocalDateTime.now();
        p.persist();
        return toDto(p);
    }

    @Transactional
    public ParlamentarLimiteDTO update(Long id, BigDecimal valorAnual) {
        ParlamentarLimite p = repo.findById(id);
        if (p == null) return null;
        p.valorAnual = valorAnual;
        p.updatedAt = LocalDateTime.now();
        return toDto(p);
    }

    @Transactional
    public boolean delete(Long id) {
        ParlamentarLimite p = repo.findById(id);
        if (p == null) return false;
        p.delete();
        return true;
    }

    private ParlamentarLimiteDTO toDto(ParlamentarLimite p) {
        return new ParlamentarLimiteDTO(p.id, p.parlamentarId, p.ano, p.valorAnual, p.createdAt, p.updatedAt);
    }
}
