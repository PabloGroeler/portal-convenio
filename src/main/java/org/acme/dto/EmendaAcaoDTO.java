package org.acme.dto;

public class EmendaAcaoDTO {
    public String acao; // APROVAR, DEVOLVER, REPROVAR
    public String observacao;
    public String usuario;

    public EmendaAcaoDTO() {
    }

    public EmendaAcaoDTO(String acao, String observacao, String usuario) {
        this.acao = acao;
        this.observacao = observacao;
        this.usuario = usuario;
    }
}

