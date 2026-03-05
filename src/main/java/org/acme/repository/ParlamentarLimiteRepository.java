package org.acme.repository;

import org.acme.entity.ParlamentarLimite;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ParlamentarLimiteRepository implements PanacheRepository<ParlamentarLimite> {

    public List<ParlamentarLimite> findByParlamentar(String parlamentarId) {
        return list("parlamentarId", parlamentarId);
    }

    public Optional<ParlamentarLimite> findByParlamentarAndAno(String parlamentarId, Integer ano) {
        return find("parlamentarId = ?1 and ano = ?2", parlamentarId, ano).firstResultOptional();
    }
}
