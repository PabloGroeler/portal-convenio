package org.acme.entity;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.Optional;
@Entity
@Table(name = "emenda_admissibilidade")
public class EmendaAdmissibilidade extends PanacheEntityBase {
    public enum Status { PENDENTE, APROVADA, REPROVADA }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emenda_id", nullable = false)
    public Emenda emenda;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    public Status status = Status.PENDENTE;
    @Column(name = "observacao", columnDefinition = "TEXT")
    public String observacao;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analista_id", nullable = false)
    public User analista;
    @Column(name = "data_analise", nullable = false)
    public OffsetDateTime dataAnalise;
    public static Optional<EmendaAdmissibilidade> findByEmendaId(String emendaId) {
        return find("emenda.id = ?1 order by dataAnalise desc", emendaId).firstResultOptional();
    }
}