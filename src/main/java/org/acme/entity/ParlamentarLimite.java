package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parlamentar_limites")
public class ParlamentarLimite extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "parlamentar_id", nullable = false, length = 100)
    public String parlamentarId;

    @Column(name = "ano", nullable = false)
    public Integer ano;

    @Column(name = "valor_anual", nullable = false)
    public BigDecimal valorAnual;

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
}
