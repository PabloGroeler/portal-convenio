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
public class Parlamentar {

    @Id
    @Column(name = "id_parlamentar", nullable = false, unique = true, length = 100)
    public String idParlamentar;

    @Column(name = "nome_completo", nullable = false)
    public String nomeCompleto;

    @Column(name = "partido_politico", length = 100)
    public String partidoPolitico;

    @Column(name = "data_criacao")
    public OffsetDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    public OffsetDateTime dataAtualizacao;

    public Parlamentar() {
    }

    public Parlamentar(String idParlamentar, String nomeCompleto, String partidoPolitico) {
        this.idParlamentar = idParlamentar;
        this.nomeCompleto = nomeCompleto;
        this.partidoPolitico = partidoPolitico;
        this.dataCriacao = OffsetDateTime.now();
        this.dataAtualizacao = OffsetDateTime.now();
    }
}
