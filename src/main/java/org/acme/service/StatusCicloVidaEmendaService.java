package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.StatusCicloVidaEmenda;

/**
 * JIRA 9 — Validation and normalization for Emenda.statusCicloVida.
 */
@ApplicationScoped
public class StatusCicloVidaEmendaService {

    public void validateOrThrow(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status do ciclo de vida é obrigatório");
        }

        StatusCicloVidaEmenda parsed = StatusCicloVidaEmenda.fromStringOrNull(status);
        if (parsed == null) {
            throw new IllegalArgumentException(
                    "Status do ciclo de vida inválido: " + status + ". Valores aceitos: Recebido, Iniciado, Em execução, Concluído, Devolvido"
            );
        }
    }

    public String normalize(String status) {
        StatusCicloVidaEmenda parsed = StatusCicloVidaEmenda.fromStringOrNull(status);
        return parsed == null ? null : parsed.toLabel();
    }
}

