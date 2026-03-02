package org.acme.dto;
import org.acme.entity.EmendaAdmissibilidade;
import java.time.OffsetDateTime;
public record AdmissibilidadeResponseDTO(
    Long id,
    String emendaId,
    String status,
    String observacao,
    Long analistaId,
    String analistaNome,
    OffsetDateTime dataAnalise
) {
    public static AdmissibilidadeResponseDTO fromEntity(EmendaAdmissibilidade e) {
        return new AdmissibilidadeResponseDTO(
            e.id,
            e.emenda.id,
            e.status.name(),
            e.observacao,
            e.analista.id,
            e.analista.nomeCompleto,
            e.dataAnalise
        );
    }
}