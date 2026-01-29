package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.acme.repository.TipoEmendaRepository;

/**
 * Centralizes business rules/validation for Tipo de Emenda.
 */
@ApplicationScoped
public class TipoEmendaService {

    @Inject
    TipoEmendaRepository tipoEmendaRepository;

    /**
     * Validates that the given codigo exists and is active.
     *
     * @throws IllegalArgumentException when invalid
     */
    public void validateCodigoAtivoOrThrow(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new IllegalArgumentException("Tipo de emenda é obrigatório");
        }

        boolean exists = tipoEmendaRepository.findAtivoByCodigo(codigo).isPresent();
        if (!exists) {
            throw new IllegalArgumentException("Tipo de emenda inválido: " + codigo);
        }
    }
}
