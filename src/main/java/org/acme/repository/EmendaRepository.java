package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Emenda;

@ApplicationScoped
public class EmendaRepository implements PanacheRepository<Emenda> {
}

