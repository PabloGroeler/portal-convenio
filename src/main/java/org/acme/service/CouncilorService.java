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

    public Councilor findById(String id) {
        if (id == null || id.isBlank()) return null;
        return councilorRepository.findByCouncilorId(id);
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
    public Councilor update(String id, Councilor updated) {
        Councilor existing = councilorRepository.findByCouncilorId(id);
        if (existing == null) return null;

        // Do not overwrite primary key
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
    public boolean delete(String id) {
        Councilor existing = councilorRepository.findByCouncilorId(id);
        if (existing == null) return false;
        councilorRepository.delete(existing);
        return true;
    }
}
