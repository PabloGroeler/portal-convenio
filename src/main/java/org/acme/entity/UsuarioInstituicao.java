package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "usuarios_instituicoes")
public class UsuarioInstituicao extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "usuarios_instituicoes_seq")
    @SequenceGenerator(name = "usuarios_instituicoes_seq", sequenceName = "usuarios_instituicoes_id_seq", allocationSize = 1)
    public Long id;

    @Column(name = "usuario_id", nullable = false)
    public Long usuarioId;

    @Column(name = "instituicao_id", nullable = false, length = 255)
    public String instituicaoId;

    @Column(name = "data_vinculo", nullable = false)
    public OffsetDateTime dataVinculo;

    @Column(name = "ativo", nullable = false)
    public Boolean ativo = true;

    @PrePersist
    public void onCreate() {
        if (dataVinculo == null) {
            dataVinculo = OffsetDateTime.now();
        }
        if (ativo == null) {
            ativo = true;
        }
    }

    public static UsuarioInstituicao findByUsuarioAndInstituicao(Long usuarioId, String instituicaoId) {
        return find("usuarioId = ?1 and instituicaoId = ?2 and ativo = true", usuarioId, instituicaoId).firstResult();
    }

    public static java.util.List<UsuarioInstituicao> findByUsuario(Long usuarioId) {
        return find("usuarioId = ?1 and ativo = true", usuarioId).list();
    }

    public static java.util.List<UsuarioInstituicao> findByInstituicao(String instituicaoId) {
        return find("instituicaoId = ?1 and ativo = true", instituicaoId).list();
    }
}

