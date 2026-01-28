package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Councilor;

@ApplicationScoped
public class CouncilorRepository implements PanacheRepositoryBase<Councilor, String> {

    public Councilor findByCouncilorId(String councilorId) {
        return find("councilorId", councilorId).firstResult();
    }
}
