package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.DotacaoOrcamentaria;

import java.util.List;

@ApplicationScoped
public class DotacaoOrcamentariaRepository implements PanacheRepository<DotacaoOrcamentaria> {

    /** Search by codigoReduzido (exact starts-with) OR dotacao containing the term (any position). */
    public List<DotacaoOrcamentaria> search(String codigoReduzido, String dotacao, int limit) {
        if (codigoReduzido != null && !codigoReduzido.isBlank()) {
            return list("ativo = true and lower(codigoReduzido) like lower(?1) order by codigoReduzido",
                    codigoReduzido.trim() + "%")
                    .stream().limit(limit).toList();
        }
        if (dotacao != null && !dotacao.isBlank()) {
            return list("ativo = true and lower(dotacao) like lower(?1) order by codigoReduzido",
                    "%" + dotacao.trim() + "%")
                    .stream().limit(limit).toList();
        }
        return list("ativo = true order by codigoReduzido")
                .stream().limit(limit).toList();
    }
}

