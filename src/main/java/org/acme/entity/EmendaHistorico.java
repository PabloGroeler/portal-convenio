package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.time.OffsetDateTime;

@Entity
@Table(name = "emendas_historico")
public class EmendaHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emendas_historico_seq")
    @SequenceGenerator(name = "emendas_historico_seq", sequenceName = "emendas_historico_seq", allocationSize = 1)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emenda_id", nullable = false)
    public Emenda emenda;

    @Column(name = "acao", nullable = false, length = 50)
    public String acao; // APROVADA, DEVOLVIDA, REPROVADA, CRIADA, ATUALIZADA

    @Column(name = "status_anterior", length = 50)
    public String statusAnterior;

    @Column(name = "status_novo", length = 50)
    public String statusNovo;

    @Column(name = "observacao", columnDefinition = "TEXT")
    public String observacao;

    @Column(name = "usuario", length = 100)
    public String usuario;

    @Column(name = "data_hora", nullable = false)
    public OffsetDateTime dataHora;

    public EmendaHistorico() {
    }

    public EmendaHistorico(Emenda emenda, String acao, String statusAnterior, String statusNovo, String observacao, String usuario) {
        this.emenda = emenda;
        this.acao = acao;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.observacao = observacao;
        this.usuario = usuario;
        this.dataHora = OffsetDateTime.now();
    }
}
