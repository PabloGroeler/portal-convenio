package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.EmendaHistorico;

import java.util.List;

@ApplicationScoped
public class EmendaHistoricoRepository implements PanacheRepository<EmendaHistorico> {

    public List<EmendaHistorico> findByEmendaId(Long emendaId) {
        return list("emenda.id = ?1 order by dataHora desc", emendaId);
    }
}

