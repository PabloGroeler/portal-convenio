package org.acme.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record FullPlanoTrabalhoDTO(
    String id,
    String titulo,
    String descricao,
    String instituicaoId,
    BigDecimal valor,
    String status,
    OffsetDateTime createTime,
    OffsetDateTime updateTime,
    List<MetaDTO> metas
) {}
