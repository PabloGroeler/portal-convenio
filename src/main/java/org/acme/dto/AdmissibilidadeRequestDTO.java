package org.acme.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
public record AdmissibilidadeRequestDTO(
    @NotBlank
    @Pattern(regexp = "APROVADA|REPROVADA", message = "Status deve ser APROVADA ou REPROVADA")
    String status,
    String observacao
) {}