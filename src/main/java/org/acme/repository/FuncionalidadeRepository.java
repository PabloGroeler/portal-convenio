package org.acme.repository;

import org.acme.entity.Funcionalidade;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class FuncionalidadeRepository implements PanacheRepository<Funcionalidade> {

    public List<Funcionalidade> listActive() {
        return list("ativo", true);
    }
}

