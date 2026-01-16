package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Emenda;
import org.acme.repository.EmendaRepository;

import java.util.List;

@ApplicationScoped
public class EmendaService {

    @Inject
    EmendaRepository emendaRepository;

    public List<Emenda> listAll() {
        return emendaRepository.listAll();
    }

    public Emenda findById(Long id) {
        if (id == null) return null;
        return emendaRepository.findById(id);
    }

    @Transactional
    public Emenda create(Emenda emenda) {
        emendaRepository.persist(emenda);
        return emenda;
    }

    @Transactional
    public Emenda update(Long id, Emenda updated) {
        Emenda existing = emendaRepository.findById(id);
        if (existing == null) return null;
        existing.name = updated.name;
        existing.legalName = updated.legalName;
        existing.cnpj = updated.cnpj;
        existing.category = updated.category;
        existing.link = updated.link;
        existing.contactEmail = updated.contactEmail;
        existing.contactPhone = updated.contactPhone;
        existing.createTime = updated.createTime;
        existing.updateTime = updated.updateTime;
        return existing;
    }

    @Transactional
    public boolean delete(Long id) {
        Emenda existing = emendaRepository.findById(id);
        if (existing == null) return false;
        emendaRepository.delete(existing);
        return true;
    }
}

