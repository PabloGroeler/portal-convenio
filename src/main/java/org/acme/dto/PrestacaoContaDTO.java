package org.acme.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PrestacaoContaDTO(
    String id,
    String planoTrabalhoId,
    BigDecimal valorExecutado,
    String observacoes,
    OffsetDateTime createTime,
    OffsetDateTime updateTime
) {}
