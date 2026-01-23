package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Councilor;
import org.acme.repository.CouncilorRepository;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class CouncilorService {

    @Inject
    CouncilorRepository councilorRepository;

    public List<Councilor> listAll() {
        return councilorRepository.listAll();
    }

    public Councilor findById(Long id) {
        if (id == null) return null;
        return councilorRepository.findById(id);
    }

    public Councilor findByCouncilorId(String councilorId) {
        return councilorRepository.findByCouncilorId(councilorId);
    }

    @Transactional
    public Councilor create(Councilor councilor) {
        councilor.createTime = OffsetDateTime.now();
        councilor.updateTime = OffsetDateTime.now();
        councilorRepository.persist(councilor);
        return councilor;
    }

    @Transactional
    public Councilor update(Long id, Councilor updated) {
        Councilor existing = councilorRepository.findById(id);
        if (existing == null) return null;

        existing.councilorId = updated.councilorId;
        existing.fullName = updated.fullName;
        existing.politicalParty = updated.politicalParty;
        existing.updateTime = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public Councilor updateStringId(String councilorId, Councilor updated) {
        if (councilorId == null) return null;
        Councilor existing = councilorRepository.findByCouncilorId(councilorId);
        if (existing == null) return null;

        existing.fullName = updated.fullName;
        existing.politicalParty = updated.politicalParty;
        existing.updateTime = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public boolean delete(Long id) {
        Councilor existing = councilorRepository.findById(id);
        if (existing == null) return false;
        councilorRepository.delete(existing);
        return true;
    }
}
