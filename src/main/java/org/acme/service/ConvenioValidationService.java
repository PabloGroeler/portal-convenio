package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Emenda;

import java.time.Year;

/**
 * JIRA 7 — Validation for convênio fields.
 */
@ApplicationScoped
public class ConvenioValidationService {

    public void validateOrThrow(boolean existeConvenio, String numeroConvenio, Integer anoConvenio) {
        if (!existeConvenio) {
            // If "Não", we don't require/validate the other fields.
            return;
        }

        if (numeroConvenio == null || numeroConvenio.isBlank()) {
            throw new IllegalArgumentException("Número do convênio é obrigatório quando 'Existe convênio' for Sim");
        }
        String num = numeroConvenio.trim();
        if (num.length() > 16) {
            throw new IllegalArgumentException("Número do convênio deve ter no máximo 16 caracteres");
        }

        if (anoConvenio == null) {
            throw new IllegalArgumentException("Ano do convênio é obrigatório quando 'Existe convênio' for Sim");
        }

        int year = anoConvenio;
        if (year < 1900 || year > Year.now().getValue() + 5) {
            throw new IllegalArgumentException("Ano do convênio inválido: " + anoConvenio);
        }
    }

    /**
     * Normalizes fields when existeConvenio = false.
     */
    public void normalize(Emenda emenda) {
        if (emenda == null) return;

        if (!emenda.existeConvenio) {
            emenda.numeroConvenio = null;
            emenda.anoConvenio = null;
            return;
        }

        if (emenda.numeroConvenio != null) {
            emenda.numeroConvenio = emenda.numeroConvenio.trim();
        }
    }
}

