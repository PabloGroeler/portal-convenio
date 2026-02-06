package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_historico", indexes = {
    @Index(name = "idx_status_historico_instituicao", columnList = "instituicao_id"),
    @Index(name = "idx_status_historico_data", columnList = "data_alteracao")
})
public class StatusHistorico extends PanacheEntityBase {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    public String id;

    @Column(name = "instituicao_id", nullable = false, length = 255)
    public String instituicaoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_anterior", nullable = false, length = 50)
    public StatusOSC statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_novo", nullable = false, length = 50)
    public StatusOSC statusNovo;

    @Column(name = "data_alteracao", nullable = false)
    public LocalDateTime dataAlteracao;

    @Column(name = "usuario_responsavel", nullable = false, length = 255)
    public String usuarioResponsavel;

    @Column(name = "justificativa", columnDefinition = "TEXT")
    public String justificativa;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    public String observacoes;

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.dataAlteracao == null) {
            this.dataAlteracao = LocalDateTime.now();
        }
    }
}

