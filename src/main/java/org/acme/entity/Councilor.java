package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import java.time.OffsetDateTime;

@Entity
@Table(name = "councilor", indexes = {
    @Index(name = "idx_councilor_councilor_id", columnList = "councilor_id", unique = true)
})
public class Councilor {

    @Id
    @Column(name = "councilor_id", nullable = false, unique = true, length = 100)
    public String councilorId;

    @Column(name = "full_name", nullable = false)
    public String fullName;

    @Column(name = "political_party", length = 100)
    public String politicalParty;

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    public Councilor() {
    }

    public Councilor(String councilorId, String fullName, String politicalParty) {
        this.councilorId = councilorId;
        this.fullName = fullName;
        this.politicalParty = politicalParty;
        this.createTime = OffsetDateTime.now();
        this.updateTime = OffsetDateTime.now();
    }
}

