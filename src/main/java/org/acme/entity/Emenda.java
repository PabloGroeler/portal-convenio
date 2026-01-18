package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "emenda", indexes = {
    @Index(name = "idx_emenda_cnpj", columnList = "cnpj"),
    @Index(name = "idx_emenda_code", columnList = "code")
})
public class Emenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "name", nullable = false)
    public String name;

    @Column(name = "legal_name")
    public String legalName;

    @Column(name = "cnpj", length = 32)
    public String cnpj;

    @Column(name = "category")
    public String category;

    @Column(name = "link")
    public String link;

    @Column(name = "contact_email")
    public String contactEmail;

    @Column(name = "contact_phone", length = 50)
    public String contactPhone;

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    // New fields for emenda management
    @Column(name = "code", length = 50)
    public String code;

    @Column(name = "year")
    public Integer year;

    @Column(name = "value", precision = 15, scale = 2)
    public BigDecimal value;

    @Column(name = "status", length = 50)
    public String status;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "institution")
    public String institution;

    @Column(name = "parlamentar")
    public String parlamentar;

    @Column(name = "has_detail")
    public Boolean hasDetail;

    public Emenda() {
    }

    public Emenda(String name, String legalName, String cnpj, String category, String link, String contactEmail, String contactPhone, OffsetDateTime createTime, OffsetDateTime updateTime) {
        this.name = name;
        this.legalName = legalName;
        this.cnpj = cnpj;
        this.category = category;
        this.link = link;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }
}
