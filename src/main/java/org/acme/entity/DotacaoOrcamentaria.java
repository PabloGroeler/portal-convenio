package org.acme.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dotacoes_orcamentarias")
public class DotacaoOrcamentaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "codigo_reduzido", length = 20, nullable = false)
    public String codigoReduzido;

    @Column(name = "dotacao", length = 500, nullable = false)
    public String dotacao;

    @Column(name = "descricao", length = 500)
    public String descricao;

    @Column(name = "exercicio", nullable = false)
    public Integer exercicio;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "data_criacao")
    public LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    public LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (exercicio == null) exercicio = java.time.Year.now().getValue();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}

