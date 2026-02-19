package org.acme.dto;

import lombok.Data;
import org.acme.entity.DocumentoPessoal;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DocumentoPessoalDTO {
    private String id;
    private String dirigenteId;
    private String tipoDocumento;
    private String nomeOriginal;
    private String tipoMime;
    private Long tamanhoBytes;
    private String numeroDocumento;
    private LocalDate dataEmissao;
    private LocalDate dataValidade;
    private LocalDateTime dataUpload;
    private String statusDocumento;
    private String observacoes;
    private String motivoReprovacao;

    public static DocumentoPessoalDTO fromEntity(DocumentoPessoal entity) {
        if (entity == null) return null;

        DocumentoPessoalDTO dto = new DocumentoPessoalDTO();
        dto.setId(entity.getId());
        dto.setDirigenteId(entity.getDirigenteId());
        dto.setTipoDocumento(entity.getTipoDocumento());
        dto.setNomeOriginal(entity.getNomeOriginal());
        dto.setTipoMime(entity.getTipoMime());
        dto.setTamanhoBytes(entity.getTamanhoBytes());
        dto.setNumeroDocumento(entity.getNumeroDocumento());
        dto.setDataEmissao(entity.getDataEmissao());
        dto.setDataValidade(entity.getDataValidade());
        dto.setDataUpload(entity.getDataUpload());
        dto.setStatusDocumento(entity.getStatusDocumento());
        dto.setObservacoes(entity.getObservacoes());
        dto.setMotivoReprovacao(entity.getMotivoReprovacao());

        return dto;
    }
}
