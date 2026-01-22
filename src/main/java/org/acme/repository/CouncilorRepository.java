package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Councilor;

@ApplicationScoped
public class CouncilorRepository implements PanacheRepository<Councilor> {

    public Councilor findByCouncilorId(String councilorId) {
        return find("councilorId", councilorId).firstResult();
    }
}

