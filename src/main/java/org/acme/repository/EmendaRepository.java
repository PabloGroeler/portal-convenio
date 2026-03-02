package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Emenda;

import java.util.List;

@ApplicationScoped
public class EmendaRepository implements PanacheRepositoryBase<Emenda, String> {

    public Emenda findByOfficialCodeAndInstitutionId(String officialCode, String institutionId) {
        if (officialCode == null || institutionId == null) return null;
        return find("officialCode = ?1 and institutionId = ?2", officialCode, institutionId).firstResult();
    }

    /** Retorna todas as emendas ordenadas por data de criação decrescente (mais recentes primeiro). */
    public List<Emenda> listAllOrderedByDate() {
        return listAll(Sort.by("createTime", Sort.Direction.Descending)
                           .and("exercicio",  Sort.Direction.Descending));
    }
}
