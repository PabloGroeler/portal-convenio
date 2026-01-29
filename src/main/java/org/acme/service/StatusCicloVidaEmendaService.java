package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.StatusCicloVidaEmenda;

/**
 * JIRA 9 — Validation and normalization for Emenda.statusCicloVida.
 */
@ApplicationScoped
public class StatusCicloVidaEmendaService {

    public void validateOrThrow(String statusCicloVida) {
        if (statusCicloVida == null || statusCicloVida.isBlank()) {
            throw new IllegalArgumentException("Status do ciclo de vida é obrigatório");
        }

        StatusCicloVidaEmenda parsed = StatusCicloVidaEmenda.fromStringOrNull(statusCicloVida);
        if (parsed == null) {
            throw new IllegalArgumentException(
                    "Status do ciclo de vida inválido: " + statusCicloVida + ". Valores aceitos: Recebido, Iniciado, Em execução, Concluído, Devolvido"
            );
        }
    }

    public String normalize(String statusCicloVida) {
        StatusCicloVidaEmenda parsed = StatusCicloVidaEmenda.fromStringOrNull(statusCicloVida);
        return parsed == null ? null : parsed.toLabel();
    }
}

