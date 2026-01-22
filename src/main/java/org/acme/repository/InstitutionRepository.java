package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Institution;

@ApplicationScoped
public class InstitutionRepository implements PanacheRepositoryBase<Institution, String> {

    public Institution findByInstitutionId(String institutionId) {
        return find("institutionId", institutionId).firstResult();
    }
}

