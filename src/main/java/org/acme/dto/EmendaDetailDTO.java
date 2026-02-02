package org.acme.dto;

import org.acme.entity.Emenda;
import org.acme.entity.Instituicao;
import org.acme.entity.Parlamentar;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.LazyInitializationException;

public class EmendaDetailDTO {
    public String id;
    public Integer numeroEmenda;
    public Integer exercicio;
    public String idParlamentar;
    public String councilorName; // From Councilor entity
    public String codigoOficial;
    public LocalDate data;
    public BigDecimal valor;
    public String classificacao;
    public String esfera;
    public boolean existeConvenio;
    public String numeroConvenio;
    public Integer anoConvenio;
    public String categoria;
    public String situacao;
    public String statusCicloVida;
    public String statusFederal;
    public String idInstituicao;
    public String institutionName; // From Institution entity
    public String linkAssinado;
    public List<String> anexos;
    public String descricao;
    public String objetoDetalhado;
    public LocalDate previsaoConclusao;
    public String justificativa;

    public EmendaDetailDTO() {
    }

    public EmendaDetailDTO(Emenda emenda, Instituicao instituicao, Parlamentar parlamentar) {
        this.id = emenda.id;
        this.numeroEmenda = emenda.numeroEmenda;
        this.exercicio = emenda.exercicio;
        this.idParlamentar = emenda.idParlamentar;
        this.councilorName = parlamentar != null ? parlamentar.nomeCompleto : null;
        this.codigoOficial = emenda.codigoOficial;
        this.data = emenda.data;
        this.valor = emenda.valor;
        this.classificacao = emenda.classificacao;
        this.esfera = emenda.esfera;
        this.existeConvenio = emenda.existeConvenio;
        this.numeroConvenio = emenda.numeroConvenio;
        this.anoConvenio = emenda.anoConvenio;
        this.categoria = emenda.categoria;
        this.situacao = emenda.situacao;
        this.statusCicloVida = emenda.statusCicloVida;
        this.statusFederal = emenda.statusFederal;
        this.idInstituicao = emenda.idInstituicao;
        this.institutionName = instituicao != null ? instituicao.razaoSocial : null;
        this.linkAssinado = emenda.linkAssinado;
        this.anexos = emenda.anexos != null ? new ArrayList<>(emenda.anexos) : new ArrayList<>();
        this.descricao = emenda.descricao;
        this.objetoDetalhado = emenda.objetoDetalhado;
        this.previsaoConclusao = emenda.previsaoConclusao;
        this.justificativa = emenda.justificativa;
    }

    public static EmendaDetailDTO fromEmenda(Emenda emenda) {
        EmendaDetailDTO dto = new EmendaDetailDTO();
        dto.id = emenda.id;
        dto.numeroEmenda = emenda.numeroEmenda;
        dto.exercicio = emenda.exercicio;
        dto.idParlamentar = emenda.idParlamentar;
        dto.codigoOficial = emenda.codigoOficial;
        dto.data = emenda.data;
        dto.valor = emenda.valor;
        dto.classificacao = emenda.classificacao;
        dto.esfera = emenda.esfera;
        dto.existeConvenio = emenda.existeConvenio;
        dto.numeroConvenio = emenda.numeroConvenio;
        dto.anoConvenio = emenda.anoConvenio;
        dto.categoria = emenda.categoria;
        dto.situacao = emenda.situacao;
        dto.statusCicloVida = emenda.statusCicloVida;
        dto.statusFederal = emenda.statusFederal;
        dto.idInstituicao = emenda.idInstituicao;
        dto.linkAssinado = emenda.linkAssinado;
        try {
            dto.anexos = emenda.anexos != null ? new ArrayList<>(emenda.anexos) : new ArrayList<>();
        } catch (LazyInitializationException e) {
            dto.anexos = new ArrayList<>();
        }
        dto.descricao = emenda.descricao;
        dto.objetoDetalhado = emenda.objetoDetalhado;
        dto.previsaoConclusao = emenda.previsaoConclusao;
        dto.justificativa = emenda.justificativa;
        return dto;
    }
}
