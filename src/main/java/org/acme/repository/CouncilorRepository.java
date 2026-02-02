package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Parlamentar;

@ApplicationScoped
public class CouncilorRepository implements PanacheRepositoryBase<Parlamentar, String> {

    public Parlamentar findByCouncilorId(String councilorId) {
        return find("councilorId", councilorId).firstResult();
    }
}
