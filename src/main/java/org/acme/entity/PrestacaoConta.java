package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "prestacao_contas")
public class PrestacaoConta extends PanacheEntityBase {
    @Id
    public String id;

    @Column(name = "plano_trabalho_id", length = 36, nullable = false)
    public String planoTrabalhoId;

    @Column(name = "valor_executado", precision = 18, scale = 2)
    public BigDecimal valorExecutado;

    @Column(columnDefinition = "text")
    public String observacoes;

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    @PrePersist
    void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
        this.createTime = OffsetDateTime.now();
        this.updateTime = this.createTime;
    }

    @PreUpdate
    void preUpdate() {
        this.updateTime = OffsetDateTime.now();
    }
}
