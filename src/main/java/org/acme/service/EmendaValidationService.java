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
        if (emenda.councilorId == null || emenda.councilorId.isBlank()) {
            throw new BadRequestException("Autor/Emenda (Parlamentar) é obrigatório");
        }

        // Número de Emenda: must be > 0
//        if (emenda.numeroEmenda == null || emenda.numeroEmenda <= 0) {
//            throw new BadRequestException("Número de Emenda deve ser maior que zero");
//        }

        // Exercício: must be present
        if (emenda.exercicio == null || emenda.exercicio <= 0) {
            emenda.exercicio = 2026;
//            throw new BadRequestException("Exercício (ano) é obrigatório");
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
        if (emenda.value == null || emenda.value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Valor da Emenda deve ser maior que R$ 0,00");
        }

        // Objeto da Emenda (description): max 250 chars
//        if (emenda.description != null && emenda.description.length() > 250) {
//            throw new BadRequestException("Objeto da Emenda deve ter no máximo 250 caracteres");
//        }

        // Situação da Emenda: must be one of the allowed values
        if (emenda.status == null || emenda.status.isBlank()) {
            throw new BadRequestException("Situação da Emenda é obrigatória");
        }
        String[] allowedStatus = {"Recebido", "Iniciado", "Em execução", "Concluído", "Devolvido"};
        boolean validStatus = false;
        for (String s : allowedStatus) {
            if (s.equalsIgnoreCase(emenda.status.trim())) {
                validStatus = true;
                break;
            }
        }
        if (!validStatus) {
            throw new BadRequestException(
                "Situação da Emenda deve ser: Recebido, Iniciado, Em execução, Concluído ou Devolvido"
            );
        }

        // Previsão de conclusão: optional but if present, must be a valid date
        // (already validated by LocalDate type)

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

