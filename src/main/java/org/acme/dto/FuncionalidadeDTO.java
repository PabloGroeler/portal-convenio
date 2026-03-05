package org.acme.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FuncionalidadeDTO(Long id, String chave, String descricao, BigDecimal percentualSaude, BigDecimal percentualEducacao, Boolean ativo, LocalDateTime createdAt, LocalDateTime updatedAt) {
}

