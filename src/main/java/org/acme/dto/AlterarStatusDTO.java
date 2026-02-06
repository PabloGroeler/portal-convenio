package org.acme.dto;

import org.acme.entity.StatusOSC;

public class AlterarStatusDTO {
    private StatusOSC novoStatus;
    private String justificativa;
    private String observacoes;

    public AlterarStatusDTO() {
    }

    public StatusOSC getNovoStatus() {
        return novoStatus;
    }

    public void setNovoStatus(StatusOSC novoStatus) {
        this.novoStatus = novoStatus;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}

