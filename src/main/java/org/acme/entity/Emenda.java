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
    @Index(name = "idx_emendas_vereador", columnList = "councilor_id"),
    @Index(name = "idx_emendas_instituicao", columnList = "institution_id"),
    @Index(name = "idx_emendas_codigo_oficial", columnList = "official_code")
//    @Index(name = "idx_emendas_numero_exercicio", columnList = "numero_emenda, exercicio", unique = true)
})
public class Emenda {

    @Id
    @Column(length = 36)
    public String id;

    @Column(name = "numero_emenda")
    public Integer numeroEmenda;

    @Column(name = "exercicio", nullable = false)
    public Integer exercicio;

    @Column(name = "councilor_id", length = 100)
    public String councilorId;

    @Column(name = "official_code", length = 100)
    public String officialCode;

    @Column(name = "date")
    public LocalDate date;

    @Column(name = "value", precision = 15, scale = 2)
    public BigDecimal value;

    @Column(name = "classification", length = 100)
    public String classification;

    @Column(name = "category", length = 100)
    public String category;

    @Column(name = "status", length = 50)
    public String status;

    /**
     * JIRA 9 — Status do ciclo de vida da emenda.
     * Valores: Recebido, Iniciado, Em execução, Concluído, Devolvido.
     */
    @Column(name = "status_ciclo_vida", length = 30, nullable = false)
    public String statusCicloVida = "Recebido";

    @Column(name = "federal_status", length = 100)
    public String federalStatus;

    /**
     * JIRA 6 — Esfera da Emenda (Municipal/Estadual/Federal).
     * Stored as a string column for simplicity.
     */
    @Column(name = "esfera", length = 20)
    public String esfera;

    /**
     * JIRA 7 — Convênio fields.
     */
    @Column(name = "existe_convenio", nullable = false)
    public boolean existeConvenio = false;

    @Column(name = "numero_convenio", length = 16)
    public String numeroConvenio;

    @Column(name = "ano_convenio")
    public Integer anoConvenio;

    @Column(name = "institution_id", length = 100)
    public String institutionId;

    @Column(name = "signed_link")
    public String signedLink;

    /**
     * One or more attachment links related to the emenda.
     * Stored as a separate table emenda_attachment(emenda_id, url).
     */
    @ElementCollection
    @CollectionTable(name = "emendas_anexos", joinColumns = @JoinColumn(name = "emenda_id"))
    @Column(name = "url", columnDefinition = "TEXT")
    public List<String> attachments = new ArrayList<>();

    @Column(name = "description", length = 1000)
    public String description;

    @Column(name = "object_detail", columnDefinition = "TEXT")
    public String objectDetail;

    @Column(name = "previsao_conclusao")
    public LocalDate previsaoConclusao;

    @Column(name = "justificativa", length = 1000)
    public String justificativa;

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    public Emenda() {
    }

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public Emenda(String councilorId, String officialCode, LocalDate date, BigDecimal value, String classification, String category, String status, String institutionId, String signedLink, String description, String objectDetail) {
        this.councilorId = councilorId;
        this.officialCode = officialCode;
        this.date = date;
        this.value = value;
        this.classification = classification;
        this.category = category;
        this.status = status;
        this.institutionId = institutionId;
        this.signedLink = signedLink;
        this.description = description;
        this.objectDetail = objectDetail;
        this.createTime = OffsetDateTime.now();
        this.updateTime = OffsetDateTime.now();
    }
}
