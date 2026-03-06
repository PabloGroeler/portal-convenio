package org.acme.entity;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.Optional;
@Entity
@Table(name = "emenda_analista_orcamento")
public class EmendaAnalistaOrcamento extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emenda_id", nullable = false)
    public Emenda emenda;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analista_id", nullable = false)
    public User analista;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atribuido_por_id", nullable = false)
    public User atribuidoPor;
    @Column(name = "data_atribuicao", nullable = false)
    public OffsetDateTime dataAtribuicao;
    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;
    public static Optional<EmendaAnalistaOrcamento> findActiveByEmendaId(String emendaId) {
        return find("emenda.id = ?1 and ativo = true", emendaId).firstResultOptional();
    }
}
