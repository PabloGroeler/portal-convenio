package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Institution;

import java.util.List;

@ApplicationScoped
public class InstitutionRepository implements PanacheRepositoryBase<Institution, String> {

    public Institution findByInstitutionId(String institutionId) {
        return find("institutionId", institutionId).firstResult();
    }

    public List<Institution> listAllOrdered() {
        return listAll(Sort.by("razaoSocial").and("institutionId"));
    }
}
