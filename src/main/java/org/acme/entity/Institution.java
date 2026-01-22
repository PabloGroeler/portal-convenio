package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "institution", indexes = {
    @Index(name = "idx_institution_institution_id", columnList = "institution_id", unique = true)
})
public class Institution {

    @Id
    @Column(name = "institution_id", nullable = false, unique = true, length = 100)
    public String institutionId;

    @Column(name = "name", nullable = false)
    public String name;

    @Column(name = "create_time")
    public OffsetDateTime createTime;

    @Column(name = "update_time")
    public OffsetDateTime updateTime;

    public Institution() {
    }

    @PrePersist
    public void generateId() {
        if (this.institutionId == null) {
            this.institutionId = UUID.randomUUID().toString();
        }
    }

    public Institution(String institutionId, String name) {
        this.institutionId = institutionId;
        this.name = name;
        this.createTime = OffsetDateTime.now();
        this.updateTime = OffsetDateTime.now();
    }
}

