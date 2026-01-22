package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Emenda;

@ApplicationScoped
public class EmendaRepository implements PanacheRepositoryBase<Emenda, String> {
}

