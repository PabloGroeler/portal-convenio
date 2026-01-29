package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "tipos_emenda")
public class TipoEmenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "codigo", length = 80, nullable = false, unique = true)
    public String codigo;

    @Column(name = "nome", length = 200, nullable = false)
    public String nome;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "ordem", nullable = false)
    public int ordem = 0;

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
}

