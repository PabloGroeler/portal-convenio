package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import org.acme.entity.Emenda;
import org.acme.repository.EmendaRepository;

import java.math.BigDecimal;

/**
 * Task-10: Validation service for emenda creation/update rules
 */
@ApplicationScoped
public class EmendaValidationService {

    @Inject
    EmendaRepository emendaRepository;

    /**
     * Validates all Task-10 requirements for an emenda
     */
    public void validateOrThrow(Emenda emenda, boolean isUpdate) {
        // Autor/Emenda: Parlamentar must be selected
        if (emenda.idParlamentar == null || emenda.idParlamentar.isBlank()) {
            throw new BadRequestException("Autor/Emenda (Parlamentar) é obrigatório");
        }

        // Exercício: must be present
        if (emenda.exercicio == null || emenda.exercicio <= 0) {
            emenda.exercicio = 2026;
        }

        if (!isUpdate) {
            long count = emendaRepository.count("numeroEmenda = ?1 and exercicio = ?2",
                emenda.numeroEmenda, emenda.exercicio);
            if (count > 0) {
                throw new BadRequestException(
                    String.format("Número de Emenda %d já existe para o exercício %d",
                        emenda.numeroEmenda, emenda.exercicio)
                );
            }
        } else {
            // For updates, check if another emenda has the same numero+exercicio
            long count = emendaRepository.count(
                "numeroEmenda = ?1 and exercicio = ?2 and id != ?3",
                emenda.numeroEmenda, emenda.exercicio, emenda.id
            );
            if (count > 0) {
                throw new BadRequestException(
                    String.format("Número de Emenda %d já existe para o exercício %d",
                        emenda.numeroEmenda, emenda.exercicio)
                );
            }
        }

        // Valor da Emenda: must be > 0
        if (emenda.valor == null || emenda.valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Valor da Emenda deve ser maior que R$ 0,00");
        }

        // Situação da Emenda: must be one of the allowed values
        if (emenda.situacao == null || emenda.situacao.isBlank()) {
            throw new BadRequestException("Situação da Emenda é obrigatória");
        }
        String[] allowedStatus = {"Recebido", "Iniciado", "Em execução", "Concluído", "Devolvido"};
        boolean validStatus = false;
        for (String s : allowedStatus) {
            if (s.equalsIgnoreCase(emenda.situacao.trim())) {
                validStatus = true;
                break;
            }
        }
        if (!validStatus) {
            throw new BadRequestException(
                "Situação da Emenda deve ser: Recebido, Iniciado, Em execução, Concluído ou Devolvido"
            );
        }


        // Justificativa: min 20, max 250 chars
        if (emenda.justificativa != null) {
            if (emenda.justificativa.length() < 20) {
                throw new BadRequestException("Justificativa deve ter no mínimo 20 caracteres");
            }
            if (emenda.justificativa.length() > 250) {
                throw new BadRequestException("Justificativa deve ter no máximo 250 caracteres");
            }
        }
    }
}

