package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Emenda;

@ApplicationScoped
public class EmendaRepository implements PanacheRepositoryBase<Emenda, String> {
    public Emenda findByOfficialCodeAndInstitutionId(String officialCode, String institutionId) {
        if (officialCode == null || institutionId == null) return null;
        return find("officialCode = ?1 and institutionId = ?2", officialCode, institutionId).firstResult();
    }
}
