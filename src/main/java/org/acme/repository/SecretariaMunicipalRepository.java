package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.SecretariaMunicipal;

import java.util.List;

@ApplicationScoped
public class SecretariaMunicipalRepository implements PanacheRepositoryBase<SecretariaMunicipal, Long> {

    public List<SecretariaMunicipal> listAllOrdered() {
        return listAll(Sort.by("codigo"));
    }
}
