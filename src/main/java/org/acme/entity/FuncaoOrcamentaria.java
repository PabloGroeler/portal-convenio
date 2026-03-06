package org.acme.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "funcoes_orcamentarias")
public class FuncaoOrcamentaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 10)
    public String codigo;

    @Column(name = "descricao", nullable = false, length = 200)
    public String descricao;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    public FuncaoOrcamentaria() {
    }
}

