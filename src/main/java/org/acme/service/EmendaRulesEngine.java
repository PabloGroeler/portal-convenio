package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Emenda;

import java.util.ArrayList;
import java.util.List;

/**
 * JIRA 5 — Regra de negócio por Tipo de Emenda.
 *
 * For now rules are code-based (no DB/config) and keyed by Emenda.classification
 * which currently stores the TipoEmenda.codigo.
 */
@ApplicationScoped
public class EmendaRulesEngine {

    /**
     * Validates business rules for a create/update request.
     *
     * @throws IllegalArgumentException when any rule is violated
     */
    public void validateOrThrow(Emenda emenda) {
        if (emenda == null) {
            throw new IllegalArgumentException("Emenda inválida");
        }

        final String tipo = (emenda.classification == null) ? "" : emenda.classification.trim();
        List<String> errors = new ArrayList<>();

        // Example rule #1: EMENDA_PIX must have signedLink
        if ("EMENDA_PIX".equalsIgnoreCase(tipo)) {
            if (emenda.signedLink == null || emenda.signedLink.isBlank()) {
                errors.add("Para Emenda Pix, o campo 'Link assinado' é obrigatório");
            }
        }

        // Example rule #2: Emenda Individual – Transferências Especiais must have objectDetail
        if ("INDIVIDUAL_TRANSFERENCIA_ESPECIAL".equalsIgnoreCase(tipo)) {
            if (emenda.objectDetail == null || emenda.objectDetail.isBlank()) {
                errors.add("Para Transferências Especiais, o campo 'Objeto detalhado' é obrigatório");
            }
        }

        if (!errors.isEmpty()) {
            // single message (simple), but still clear
            throw new IllegalArgumentException(String.join("; ", errors));
        }
    }
}

