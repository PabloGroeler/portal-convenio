package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.OffsetDateTime;

@Entity
@Table(name = "tipos_documento_config")
@Data
@EqualsAndHashCode(callSuper = false)
public class TipoDocumentoConfig extends PanacheEntityBase {

    @Id
    @Column(name = "codigo", length = 100)
    public String codigo;

    @Column(name = "nome", nullable = false, length = 200)
    public String nome;

    @Column(name = "categoria", length = 100)
    public String categoria; // INSTITUCIONAL, CERTIDAO, DIRIGENTE

    @Column(name = "obrigatorio", nullable = false)
    public Boolean obrigatorio = true;

    @Column(name = "numero_documento_obrigatorio", nullable = false)
    public Boolean numeroDocumentoObrigatorio = true;

    @Column(name = "data_emissao_obrigatoria", nullable = false)
    public Boolean dataEmissaoObrigatoria = true;

    @Column(name = "data_validade_obrigatoria", nullable = false)
    public Boolean dataValidadeObrigatoria = true;

    @Column(name = "ativo", nullable = false)
    public Boolean ativo = true;

    @Column(name = "ordem")
    public Integer ordem;

    @Column(name = "descricao", columnDefinition = "TEXT")
    public String descricao;

    @Column(name = "formatos_aceitos", length = 200)
    public String formatosAceitos = ".pdf,.jpg,.jpeg,.png";

    @Column(name = "tamanho_maximo_mb")
    public Integer tamanhoMaximoMb = 5;

    @Column(name = "data_criacao", nullable = false)
    public OffsetDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    public OffsetDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        dataCriacao = OffsetDateTime.now();
        dataAtualizacao = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = OffsetDateTime.now();
    }

    public static TipoDocumentoConfig findByCodigo(String codigo) {
        return find("codigo", codigo).firstResult();
    }

    public static java.util.List<TipoDocumentoConfig> findAllAtivos() {
        return list("ativo = true ORDER BY ordem, nome");
    }

    public static java.util.List<TipoDocumentoConfig> findByCategoria(String categoria) {
        return list("ativo = true AND categoria = ?1 ORDER BY ordem, nome", categoria);
    }

    public static java.util.List<TipoDocumentoConfig> findObrigatorios() {
        return list("ativo = true AND obrigatorio = true ORDER BY ordem, nome");
    }
}
