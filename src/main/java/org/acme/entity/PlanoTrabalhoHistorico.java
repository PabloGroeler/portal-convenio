package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "plano_trabalho_historico")
public class PlanoTrabalhoHistorico extends PanacheEntityBase {

    @Id
    public String id;

    @Column(name = "plano_trabalho_id", length = 64)
    public String planoTrabalhoId;

    @Column(name = "acao", length = 32)
    public String acao; // APROVAR, REPROVAR, CREATE, UPDATE, DELETE

    @Column(name = "motivo", columnDefinition = "text")
    public String motivo;

    @Column(name = "usuario", length = 128)
    public String usuario;

    @Column(name = "data_hora")
    public OffsetDateTime dataHora;

    @PrePersist
    void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
        this.dataHora = OffsetDateTime.now();
    }
}
