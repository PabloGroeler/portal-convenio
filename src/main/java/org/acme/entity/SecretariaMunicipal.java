package org.acme.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * JIRA 8 — Cadastro de Secretarias Municipais.
 */
@Entity
@Table(name = "secretarias_municipais")
public class SecretariaMunicipal {

    @Id
    @SequenceGenerator(name = "secretarias_municipais_seq", sequenceName = "secretarias_municipais_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "secretarias_municipais_seq")
    @Column(name = "id")
    public Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    public String codigo;

    @Column(name = "nome", nullable = false, length = 200)
    public String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    public String descricao;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "create_time", nullable = false)
    public OffsetDateTime createTime;

    @Column(name = "update_time", nullable = false)
    public OffsetDateTime updateTime;

    public SecretariaMunicipal() {
    }

    @PrePersist
    public void onCreate() {
        if (this.createTime == null) {
            this.createTime = OffsetDateTime.now();
        }
        this.updateTime = OffsetDateTime.now();
    }
}
