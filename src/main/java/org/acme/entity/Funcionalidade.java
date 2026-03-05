package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "funcionalidades")
public class Funcionalidade extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "chave", nullable = false, unique = true)
    public String chave;

    @Column(name = "descricao")
    public String descricao;

    @Column(name = "percentual_saude")
    public BigDecimal percentualSaude;

    @Column(name = "percentual_educacao")
    public BigDecimal percentualEducacao;

    @Column(name = "ativo")
    public Boolean ativo;

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
}
