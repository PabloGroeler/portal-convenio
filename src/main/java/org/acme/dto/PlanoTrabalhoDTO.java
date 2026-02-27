package org.acme.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PlanoTrabalhoDTO(
    String id,
    String titulo,
    String descricao,
    String emendaId,
    String emendaCodigo,   // enriched: officialCode of the linked emenda
    BigDecimal emendaValor, // enriched: value of the linked emenda
    String instituicaoId,
    BigDecimal valor,
    String status,
    OffsetDateTime createTime,
    OffsetDateTime updateTime
) {}
