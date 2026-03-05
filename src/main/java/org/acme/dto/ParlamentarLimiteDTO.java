package org.acme.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ParlamentarLimiteDTO(Long id, String parlamentarId, Integer ano, BigDecimal valorAnual, LocalDateTime createdAt, LocalDateTime updatedAt) {
}
