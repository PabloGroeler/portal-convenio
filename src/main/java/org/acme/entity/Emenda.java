package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "emenda", indexes = {
    @Index(name = "idx_emenda_councilor", columnList = "councilor_id"),
    @Index(name = "idx_emenda_institution", columnList = "institution_id"),
    @Index(name = "idx_emenda_official_code", columnList = "official_code")
})
public class Emenda {

    @Id
    @Column(length = 36)
    public String id;

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

    @Column(name = "institution_id", length = 100)
    public String institutionId;

    @Column(name = "signed_link")
    public String signedLink;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "object_detail", columnDefinition = "TEXT")
    public String objectDetail;

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
