package org.acme.dto;
import jakarta.validation.constraints.NotNull;
public record AtribuirAnalistaRequestDTO(
    @NotNull Long analistaId
) {}
