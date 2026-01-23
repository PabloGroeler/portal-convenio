package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Institution;
import org.acme.repository.InstitutionRepository;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class InstitutionService {

    @Inject
    InstitutionRepository institutionRepository;

    public List<Institution> listAll() {
        return institutionRepository.listAll();
    }

    public Institution findById(String id) {
        if (id == null || id.isBlank()) return null;
        return institutionRepository.findById(id);
    }

    public Institution findByInstitutionId(String institutionId) {
        return institutionRepository.findByInstitutionId(institutionId);
    }

    @Transactional
    public Institution create(Institution institution) {
        institution.createTime = OffsetDateTime.now();
        institution.updateTime = OffsetDateTime.now();
        institutionRepository.persist(institution);
        institutionRepository.flush();
        return institution;
    }

    @Transactional
    public Institution update(String id, Institution updated) {
        Institution existing = institutionRepository.findById(id);
        if (existing == null) return null;

        existing.institutionId = updated.institutionId;
        existing.name = updated.name;
        existing.updateTime = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public Institution updateStringId(String institutionId, Institution updated) {
        if (institutionId == null || institutionId.isBlank()) return null;
        Institution existing = institutionRepository.findByInstitutionId(institutionId);
        if (existing == null) return null;

        existing.name = updated.name;
        existing.updateTime = OffsetDateTime.now();
        return existing;
    }

    @Transactional
    public boolean delete(String id) {
        Institution existing = institutionRepository.findById(id);
        if (existing == null) return false;
        institutionRepository.delete(existing);
        return true;
    }
}
