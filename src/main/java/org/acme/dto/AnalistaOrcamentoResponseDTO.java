package org.acme.dto;
import org.acme.entity.EmendaAnalistaOrcamento;
import java.time.OffsetDateTime;
public record AnalistaOrcamentoResponseDTO(
    Long id,
    Long analistaId,
    String analistaNome,
    String analistaEmail,
    Long atribuidoPorId,
    String atribuidoPorNome,
    OffsetDateTime dataAtribuicao,
    boolean ativo
) {
    public static AnalistaOrcamentoResponseDTO fromEntity(EmendaAnalistaOrcamento e) {
        return new AnalistaOrcamentoResponseDTO(
            e.id,
            e.analista.id,
            e.analista.nomeCompleto,
            e.analista.email,
            e.atribuidoPor.id,
            e.atribuidoPor.nomeCompleto,
            e.dataAtribuicao,
            e.ativo
        );
    }
}
