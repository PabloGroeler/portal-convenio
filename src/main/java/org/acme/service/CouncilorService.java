package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Parlamentar;
import org.acme.repository.CouncilorRepository;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class CouncilorService {

    @Inject
    CouncilorRepository councilorRepository;

    public List<Parlamentar> listAll() {
        return councilorRepository.listAll();
    }

    public Parlamentar findById(String id) {
        if (id == null || id.isBlank()) return null;
        return councilorRepository.findByCouncilorId(id);
    }

    public Parlamentar findByCouncilorId(String councilorId) {
        return councilorRepository.findByCouncilorId(councilorId);
    }

    @Transactional
    public Parlamentar create(Parlamentar parlamentar) {
        parlamentar.dataCriacao = OffsetDateTime.now();
        parlamentar.dataAtualizacao = OffsetDateTime.now();
        councilorRepository.persist(parlamentar);
        return parlamentar;
    }

    @Transactional
    public Parlamentar update(String id, Parlamentar updated) {
        Parlamentar existing = councilorRepository.findByCouncilorId(id);
        if (existing == null) return null;

        // Do not overwrite primary key
        existing.nomeCompleto = updated.nomeCompleto;
        existing.partidoPolitico = updated.partidoPolitico;
        existing.dataAtualizacao = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public Parlamentar updateStringId(String councilorId, Parlamentar updated) {
        if (councilorId == null) return null;
        Parlamentar existing = councilorRepository.findByCouncilorId(councilorId);
        if (existing == null) return null;

        existing.nomeCompleto = updated.nomeCompleto;
        existing.partidoPolitico = updated.partidoPolitico;
        existing.dataAtualizacao = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public boolean delete(String id) {
        Parlamentar existing = councilorRepository.findByCouncilorId(id);
        if (existing == null) return false;
        councilorRepository.delete(existing);
        return true;
    }
}
