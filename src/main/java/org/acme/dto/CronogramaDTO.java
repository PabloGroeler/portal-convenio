package org.acme.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record CronogramaDTO(
    String id,
    String metaId,
    LocalDate dataPrevista,
    String atividade,
    OffsetDateTime createTime,
    OffsetDateTime updateTime
) {}
