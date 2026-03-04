package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.DotacaoOrcamentaria;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class DotacaoOrcamentariaRepository implements PanacheRepository<DotacaoOrcamentaria> {

    /** Search by codigoReduzido (exact starts-with) OR dotacao/descricao containing the term (any position).
     *  Deduplicates by codigoReduzido, keeping the first occurrence. */
    public List<DotacaoOrcamentaria> search(String codigoReduzido, String dotacao, int limit) {
        List<DotacaoOrcamentaria> raw;
        if (codigoReduzido != null && !codigoReduzido.isBlank()) {
            raw = list("ativo = true and lower(codigoReduzido) like lower(?1) order by codigoReduzido",
                    codigoReduzido.trim() + "%");
        } else if (dotacao != null && !dotacao.isBlank()) {
            String term = "%" + dotacao.trim() + "%";
            raw = list("ativo = true and (lower(dotacao) like lower(?1) or lower(descricao) like lower(?1)) order by codigoReduzido",
                    term);
        } else {
            raw = list("ativo = true order by codigoReduzido");
        }

        // Deduplicate by codigoReduzido, keep first occurrence
        Map<String, DotacaoOrcamentaria> seen = new LinkedHashMap<>();
        for (DotacaoOrcamentaria d : raw) {
            seen.putIfAbsent(d.codigoReduzido, d);
        }
        return seen.values().stream().limit(limit).collect(Collectors.toList());
    }
}

