package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.EsferaEmenda;

/**
 * JIRA 6 — Validation and normalization for Emenda.esfera.
 */
@ApplicationScoped
public class EsferaEmendaService {

    public void validateOrThrow(String esfera) {
        if (esfera == null || esfera.isBlank()) {
            throw new IllegalArgumentException("Esfera é obrigatória");
        }

        EsferaEmenda parsed = EsferaEmenda.fromStringOrNull(esfera);
        if (parsed == null) {
            throw new IllegalArgumentException("Esfera inválida: " + esfera + ". Valores aceitos: Municipal, Estadual, Federal");
        }
    }

    public String normalize(String esfera) {
        EsferaEmenda parsed = EsferaEmenda.fromStringOrNull(esfera);
        return parsed == null ? null : parsed.toLabel();
    }
}

