package org.acme.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos_institucionais")
public class DocumentoInstitucional {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "id_instituicao", length = 100, nullable = false)
    private String idInstituicao;

    @Column(name = "nome_arquivo", length = 255, nullable = false)
    private String nomeArquivo;

    @Column(name = "nome_original", length = 255, nullable = false)
    private String nomeOriginal;

    @Column(name = "tipo_documento", length = 100, nullable = false)
    private String tipoDocumento;

    @Column(name = "tipo_mime", length = 100, nullable = false)
    private String tipoMime;

    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "caminho_arquivo", length = 500, nullable = false)
    private String caminhoArquivo;

    @Column(name = "data_upload", nullable = false)
    private LocalDateTime dataUpload;

    @Column(name = "usuario_upload", length = 100)
    private String usuarioUpload;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (dataUpload == null) {
            dataUpload = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIdInstituicao() {
        return idInstituicao;
    }

    public void setIdInstituicao(String idInstituicao) {
        this.idInstituicao = idInstituicao;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public String getNomeOriginal() {
        return nomeOriginal;
    }

    public void setNomeOriginal(String nomeOriginal) {
        this.nomeOriginal = nomeOriginal;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
    }

    public Long getTamanhoBytes() {
        return tamanhoBytes;
    }

    public void setTamanhoBytes(Long tamanhoBytes) {
        this.tamanhoBytes = tamanhoBytes;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }

    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
    }

    public LocalDateTime getDataUpload() {
        return dataUpload;
    }

    public void setDataUpload(LocalDateTime dataUpload) {
        this.dataUpload = dataUpload;
    }

    public String getUsuarioUpload() {
        return usuarioUpload;
    }

    public void setUsuarioUpload(String usuarioUpload) {
        this.usuarioUpload = usuarioUpload;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
}

