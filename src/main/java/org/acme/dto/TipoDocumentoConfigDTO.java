package org.acme.dto;

import lombok.Data;

@Data
public class TipoDocumentoConfigDTO {
    public String id; // Same as codigo, for frontend compatibility
    public String codigo;
    public String nome;
    public String categoria;
    public Boolean obrigatorio;
    public Boolean numeroDocumentoObrigatorio;
    public Boolean dataEmissaoObrigatoria;
    public Boolean dataValidadeObrigatoria;
    public Boolean ativo;
    public Integer ordem;
    public String descricao;
    public String formatosAceitos;
    public Integer tamanhoMaximoMb;

    public static TipoDocumentoConfigDTO fromEntity(org.acme.entity.TipoDocumentoConfig entity) {
        if (entity == null) return null;

        TipoDocumentoConfigDTO dto = new TipoDocumentoConfigDTO();
        dto.id = entity.codigo; // Use codigo as id for frontend
        dto.codigo = entity.codigo;
        dto.nome = entity.nome;
        dto.categoria = entity.categoria;
        dto.obrigatorio = entity.obrigatorio;
        dto.numeroDocumentoObrigatorio = entity.numeroDocumentoObrigatorio;
        dto.dataEmissaoObrigatoria = entity.dataEmissaoObrigatoria;
        dto.dataValidadeObrigatoria = entity.dataValidadeObrigatoria;
        dto.ativo = entity.ativo;
        dto.ordem = entity.ordem;
        dto.descricao = entity.descricao;
        dto.formatosAceitos = entity.formatosAceitos;
        dto.tamanhoMaximoMb = entity.tamanhoMaximoMb;

        return dto;
    }
}
