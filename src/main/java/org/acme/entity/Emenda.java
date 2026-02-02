package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "emendas", indexes = {
    @Index(name = "idx_emendas_parlamentar", columnList = "id_parlamentar"),
    @Index(name = "idx_emendas_instituicao", columnList = "id_instituicao"),
    @Index(name = "idx_emendas_codigo_oficial", columnList = "codigo_oficial")
})
public class Emenda {

    @Id
    @Column(length = 36)
    public String id;

    @Column(name = "numero_emenda")
    public Integer numeroEmenda;

    @Column(name = "exercicio", nullable = false)
    public Integer exercicio;

    @Column(name = "id_parlamentar", length = 100)
    public String idParlamentar;

    @Column(name = "codigo_oficial", length = 100)
    public String codigoOficial;

    @Column(name = "data")
    public LocalDate data;

    @Column(name = "valor", precision = 15, scale = 2)
    public BigDecimal valor;

    @Column(name = "classificacao", length = 100)
    public String classificacao;

    @Column(name = "categoria", length = 100)
    public String categoria;

    @Column(name = "situacao", length = 50)
    public String situacao;

    @Column(name = "status_ciclo_vida", length = 30, nullable = false)
    public String statusCicloVida = "Recebido";

    @Column(name = "status_federal", length = 100)
    public String statusFederal;

    @Column(name = "esfera", length = 20)
    public String esfera;

    @Column(name = "existe_convenio", nullable = false)
    public boolean existeConvenio = false;

    @Column(name = "numero_convenio", length = 16)
    public String numeroConvenio;

    @Column(name = "ano_convenio")
    public Integer anoConvenio;

    @Column(name = "id_instituicao", length = 100)
    public String idInstituicao;

    @Column(name = "link_assinado")
    public String linkAssinado;

    @ElementCollection
    @CollectionTable(name = "emendas_anexos", joinColumns = @JoinColumn(name = "emenda_id"))
    @Column(name = "url", columnDefinition = "TEXT")
    public List<String> anexos = new ArrayList<>();

    @Column(name = "descricao", length = 1000)
    public String descricao;

    @Column(name = "objeto_detalhado", columnDefinition = "TEXT")
    public String objetoDetalhado;

    @Column(name = "previsao_conclusao")
    public LocalDate previsaoConclusao;

    @Column(name = "justificativa", length = 1000)
    public String justificativa;

    @Column(name = "data_criacao")
    public OffsetDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    public OffsetDateTime dataAtualizacao;

    public Emenda() {
    }

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public Emenda(String idParlamentar, String codigoOficial, LocalDate data, BigDecimal valor,
                  String classificacao, String categoria, String situacao, String idInstituicao,
                  String linkAssinado, String descricao, String objetoDetalhado) {
        this.idParlamentar = idParlamentar;
        this.codigoOficial = codigoOficial;
        this.data = data;
        this.valor = valor;
        this.classificacao = classificacao;
        this.categoria = categoria;
        this.situacao = situacao;
        this.idInstituicao = idInstituicao;
        this.linkAssinado = linkAssinado;
        this.descricao = descricao;
        this.objetoDetalhado = objetoDetalhado;
        this.dataCriacao = OffsetDateTime.now();
        this.dataAtualizacao = OffsetDateTime.now();
    }
}
