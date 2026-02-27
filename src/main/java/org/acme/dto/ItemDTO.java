package org.acme.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ItemDTO(
    String id,
    String metaId,
    String titulo,
    String descricao,
    BigDecimal valor,
    OffsetDateTime createTime,
    OffsetDateTime updateTime
) {}
