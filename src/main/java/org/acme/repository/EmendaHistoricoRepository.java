package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.EmendaHistorico;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class EmendaHistoricoRepository implements PanacheRepository<EmendaHistorico> {

    public List<EmendaHistorico> findByEmendaId(String emendaId) {
        // Join fetch to avoid LazyInitialization when mapping DTOs
        return find("from EmendaHistorico h join fetch h.emenda where h.emenda.id = ?1 order by h.dataHora desc", emendaId)
                .list();
    }

    public Optional<EmendaHistorico> findLatestDetalhamentoPendente(String emendaId) {
        return find("from EmendaHistorico h where h.emenda.id = ?1 and h.acao = ?2 order by h.dataHora desc",
                emendaId,
                "DETALHAMENTO_PENDENTE")
            .firstResultOptional();
    }
}
