package org.acme.dto;

import org.acme.entity.EmendaHistorico;
import java.time.OffsetDateTime;

public class EmendaHistoricoDTO {
    public Long id;
    public Long emendaId;
    public String acao;
    public String statusAnterior;
    public String statusNovo;
    public String observacao;
    public String usuario;
    public OffsetDateTime dataHora;

    public EmendaHistoricoDTO() {
    }

    public static EmendaHistoricoDTO fromEntity(EmendaHistorico entity) {
        EmendaHistoricoDTO dto = new EmendaHistoricoDTO();
        dto.id = entity.id;
        dto.emendaId = entity.emenda != null ? entity.emenda.id : null;
        dto.acao = entity.acao;
        dto.statusAnterior = entity.statusAnterior;
        dto.statusNovo = entity.statusNovo;
        dto.observacao = entity.observacao;
        dto.usuario = entity.usuario;
        dto.dataHora = entity.dataHora;
        return dto;
    }
}
