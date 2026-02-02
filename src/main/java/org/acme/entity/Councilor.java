package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import java.time.OffsetDateTime;

@Entity
@Table(name = "parlamentares", indexes = {
    @Index(name = "idx_parlamentares_id", columnList = "id_parlamentar", unique = true)
})
public class Councilor {

    @Id
    @Column(name = "id_parlamentar", nullable = false, unique = true, length = 100)
    public String councilorId;

    @Column(name = "nome_completo", nullable = false)
    public String fullName;

    @Column(name = "partido_politico", length = 100)
    public String politicalParty;

    @Column(name = "data_criacao")
    public OffsetDateTime createTime;

    @Column(name = "data_atualizacao")
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
