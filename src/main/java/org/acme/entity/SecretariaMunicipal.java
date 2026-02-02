package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * JIRA 8 — Cadastro de Secretarias Municipais.
 */
@Entity
@Table(name = "secretarias_municipais")
public class SecretariaMunicipal {

    @Id
    @Column(name = "secretaria_id", nullable = false, unique = true, length = 100)
    public String secretariaId;

    @Column(name = "nome", nullable = false, length = 200)
    public String nome;

    @Column(name = "sigla", length = 20)
    public String sigla;

    @Column(name = "email", length = 200)
    public String email;

    @Column(name = "telefone", length = 20)
    public String telefone;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "data_criacao")
    public OffsetDateTime createTime;

    @Column(name = "data_atualizacao")
    public OffsetDateTime updateTime;

    public SecretariaMunicipal() {
    }

    @PrePersist
    public void onCreate() {
        if (this.secretariaId == null || this.secretariaId.isBlank()) {
            this.secretariaId = UUID.randomUUID().toString();
        }
        if (this.createTime == null) {
            this.createTime = OffsetDateTime.now();
        }
        this.updateTime = OffsetDateTime.now();
    }
}

