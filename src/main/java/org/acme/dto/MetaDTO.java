package org.acme.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record MetaDTO(
    String id,
    String planoTrabalhoId,
    String titulo,
    String descricao,
    BigDecimal valor,
    String periodo,
    OffsetDateTime createTime,
    OffsetDateTime updateTime
) {}
