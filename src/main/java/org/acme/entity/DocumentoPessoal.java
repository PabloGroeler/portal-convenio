package org.acme.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos_pessoais", indexes = {
    @Index(name = "idx_doc_pessoal_dirigente", columnList = "id_dirigente"),
    @Index(name = "idx_doc_pessoal_tipo", columnList = "tipo_documento"),
    @Index(name = "idx_doc_pessoal_status", columnList = "status_documento")
})
@Data
public class DocumentoPessoal {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    // ===== Vínculo com Dirigente =====
    @Column(name = "id_dirigente", nullable = false, length = 36)
    private String dirigenteId;

    // ===== Tipo de Documento =====
    /**
     * Tipos de documentos aceitos:
     *
     * PRESIDENTE:
     * - RG
     * - CNH
     * - DOCUMENTO_COM_FOTO (outro documento com foto)
     * - COMPROVANTE_ENDERECO
     * - CERTIDAO_NEGATIVA_TCE
     *
     * DEMAIS DIRIGENTES:
     * - DOCUMENTO_IDENTIFICACAO_FOTO
     * - CERTIDAO_NEGATIVA_TCE
     */
    @Column(name = "tipo_documento", nullable = false, length = 100)
    private String tipoDocumento;

    // ===== Informações do Arquivo =====
    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;

    @Column(name = "nome_original", nullable = false, length = 255)
    private String nomeOriginal;

    @Column(name = "tipo_mime", nullable = false, length = 100)
    private String tipoMime;

    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;

    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    private String caminhoArquivo;

    // ===== Metadados do Documento =====
    @Column(name = "numero_documento", length = 50)
    private String numeroDocumento;

    @Column(name = "data_emissao")
    private LocalDate dataEmissao;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Column(name = "descricao", length = 500)
    private String descricao;

    // ===== Controle de Upload =====
    @Column(name = "data_upload", nullable = false)
    private LocalDateTime dataUpload;

    @Column(name = "usuario_upload", length = 200)
    private String usuarioUpload;

    // ===== Status do Documento =====
    /**
     * Status: PENDENTE, APROVADO, REPROVADO
     */
    @Column(name = "status_documento", nullable = false, length = 20)
    private String statusDocumento = "PENDENTE";

    @Column(name = "observacoes", length = 1000)
    private String observacoes;

    @Column(name = "motivo_reprovacao", length = 1000)
    private String motivoReprovacao;

    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    @Column(name = "data_reprovacao")
    private LocalDateTime dataReprovacao;

    @Column(name = "usuario_aprovador", length = 200)
    private String usuarioAprovador;

    @Column(name = "usuario_reprovador", length = 200)
    private String usuarioReprovador;

    // ===== Auditoria =====
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @PrePersist
    public void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        dataAtualizacao = LocalDateTime.now();
        if (statusDocumento == null) {
            statusDocumento = "PENDENTE";
        }
    }

    @PreUpdate
    public void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}
