package org.acme.dto;

import org.acme.entity.TipoEmenda;

import java.time.OffsetDateTime;

/**
 * DTO returned by the public API for "tipos de emenda".
 */
public class TipoEmendaDTO {

    public Long id;
    public String codigo;
    public String nome;
    public boolean ativo;
    public int ordem;
    public OffsetDateTime createTime;
    public OffsetDateTime updateTime;

    public static TipoEmendaDTO fromEntity(TipoEmenda e) {
        if (e == null) return null;
        TipoEmendaDTO dto = new TipoEmendaDTO();
        dto.id = e.id;
        dto.codigo = e.codigo;
        dto.nome = e.nome;
        dto.ativo = e.ativo;
        dto.ordem = e.ordem;
        dto.createTime = e.createTime;
        dto.updateTime = e.updateTime;
        return dto;
    }
}

