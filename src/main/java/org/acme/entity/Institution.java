package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "instituicoes", indexes = {
    @Index(name = "idx_instituicoes_id_instituicao", columnList = "id_instituicao", unique = true),
    @Index(name = "idx_instituicoes_cnpj", columnList = "cnpj"),
    @Index(name = "idx_instituicoes_email", columnList = "email_institucional", unique = true)
})
public class Institution {

    @Id
    @Column(name = "id_instituicao", nullable = false, unique = true, length = 100)
    public String institutionId;

    // ===== Dados Básicos =====

    @Column(name = "razao_social", nullable = false, length = 200)
    public String razaoSocial;

    @Column(name = "nome_fantasia", length = 200)
    public String nomeFantasia;

    @Column(name = "cnpj", nullable = false, length = 14)
    public String cnpj;

    @Column(name = "inscricao_estadual", length = 20)
    public String inscricaoEstadual;

    @Column(name = "inscricao_municipal", nullable = false, length = 20)
    public String inscricaoMunicipal;

    @Column(name = "data_fundacao")
    public LocalDate dataFundacao;

    /**
     * Áreas de atuação (múltipla escolha)
     */
    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @CollectionTable(name = "instituicoes_areas_atuacao", joinColumns = @JoinColumn(name = "institution_id"))
    @Column(name = "area", length = 100)
    public List<String> areasAtuacao = new ArrayList<>();

    // ===== Dados de Contato =====

    @Column(name = "telefone", nullable = false, length = 20)
    public String telefone;

    @Column(name = "celular", length = 20)
    public String celular;

    @Column(name = "email_institucional", nullable = false, unique = true, length = 200)
    public String emailInstitucional;

    @Column(name = "email_secundario", length = 200)
    public String emailSecundario;

    @Column(name = "website", length = 300)
    public String website;

    // ===== Endereço =====

    @Column(name = "cep", length = 8)
    public String cep;

    @Column(name = "logradouro", length = 200)
    public String logradouro;

    @Column(name = "numero", length = 20)
    public String numero;

    @Column(name = "complemento", length = 100)
    public String complemento;

    @Column(name = "bairro", length = 100)
    public String bairro;

    @Column(name = "cidade", length = 120)
    public String cidade;

    @Column(name = "uf", length = 2)
    public String uf;

    @Column(name = "ponto_referencia", length = 200)
    public String pontoReferencia;

    // ===== Informações Adicionais =====

    @Column(name = "numero_registro_conselho_municipal", length = 100)
    public String numeroRegistroConselhoMunicipal;

    @Column(name = "data_registro_conselho")
    public LocalDate dataRegistroConselho;

    @Column(name = "objeto_social", columnDefinition = "TEXT")
    public String objetoSocial;

    @Column(name = "quantidade_beneficiarios")
    public Integer quantidadeBeneficiarios;

    // ===== Auditoria =====

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    public Institution() {
    }

    @PrePersist
    public void generateId() {
        if (this.institutionId == null) {
            this.institutionId = UUID.randomUUID().toString();
        }
    }
}
