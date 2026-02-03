package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "tipos_emenda")
public class TipoEmenda extends PanacheEntityBase {

    @Id
    @Column(name = "codigo", length = 100, nullable = false)
    public String codigo;

    @Column(name = "nome", length = 200, nullable = false)
    public String nome;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "ordem")
    public Integer ordem;

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    @PrePersist
    public void onCreate() {
        if (createTime == null) {
            createTime = OffsetDateTime.now();
        }
        updateTime = OffsetDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updateTime = OffsetDateTime.now();
    }

    public static TipoEmenda findByCodigo(String codigo) {
        return find("codigo", codigo).firstResult();
    }
}

