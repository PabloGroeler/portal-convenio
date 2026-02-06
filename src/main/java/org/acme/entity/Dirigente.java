package org.acme.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "dirigentes", indexes = {
    @Index(name = "idx_dirigentes_instituicao", columnList = "id_instituicao"),
    @Index(name = "idx_dirigentes_cpf", columnList = "cpf", unique = true),
    @Index(name = "idx_dirigentes_cargo_status", columnList = "cargo, status_cargo")
})
@Data
public class Dirigente {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    // ===== Vínculo com Instituição =====
    @Column(name = "id_instituicao", nullable = false, length = 100)
    private String instituicaoId;

    // ===== Dados Pessoais =====
    @Column(name = "nome_completo", nullable = false, length = 200)
    private String nomeCompleto;

    @Column(name = "nome_social", length = 200)
    private String nomeSocial;

    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "rg", nullable = false, length = 20)
    private String rg;

    @Column(name = "orgao_expedidor", nullable = false, length = 20)
    private String orgaoExpedidor;

    @Column(name = "uf_orgao_expedidor", nullable = false, length = 2)
    private String ufOrgaoExpedidor;

    @Column(name = "data_expedicao", nullable = false)
    private LocalDate dataExpedicao;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "sexo", nullable = false, length = 50)
    private String sexo; // Masculino/Feminino/Outro/Prefiro não informar

    @Column(name = "nacionalidade", nullable = false, length = 100)
    private String nacionalidade;

    @Column(name = "estado_civil", nullable = false, length = 50)
    private String estadoCivil; // Solteiro/Casado/Divorciado/Viúvo/União Estável

    // ===== Cargo =====
    @Column(name = "cargo", nullable = false, length = 100)
    private String cargo; // Presidente/Vice-Presidente/Secretário/Tesoureiro/Conselheiro Fiscal/Outro

    @Column(name = "data_inicio_cargo", nullable = false)
    private LocalDate dataInicioCargo;

    @Column(name = "data_termino_cargo")
    private LocalDate dataTerminoCargo;

    @Column(name = "status_cargo", nullable = false, length = 20)
    private String statusCargo = "Ativo"; // Ativo/Inativo

    @Column(name = "motivo_inativacao", length = 500)
    private String motivoInativacao;

    // ===== Contato =====
    @Column(name = "telefone", nullable = false, length = 20)
    private String telefone;

    @Column(name = "celular", length = 20)
    private String celular;

    @Column(name = "email", nullable = false, length = 200)
    private String email;

    // ===== Endereço =====
    @Column(name = "cep", nullable = false, length = 8)
    private String cep;

    @Column(name = "logradouro", nullable = false, length = 200)
    private String logradouro;

    @Column(name = "numero", nullable = false, length = 10)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", nullable = false, length = 100)
    private String bairro;

    @Column(name = "cidade", nullable = false, length = 100)
    private String cidade;

    @Column(name = "uf", nullable = false, length = 2)
    private String uf;

    // ===== Auditoria =====
    @Column(name = "data_criacao")
    private OffsetDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private OffsetDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        this.dataCriacao = OffsetDateTime.now();
        this.dataAtualizacao = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = OffsetDateTime.now();
    }
}

