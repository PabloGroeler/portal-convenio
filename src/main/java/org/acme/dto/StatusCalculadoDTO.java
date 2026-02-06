package org.acme.dto;

import org.acme.entity.StatusOSC;

public class StatusCalculadoDTO {
    private StatusOSC statusCalculado;
    private boolean mudou;

    public StatusCalculadoDTO() {
    }

    public StatusCalculadoDTO(StatusOSC statusCalculado, boolean mudou) {
        this.statusCalculado = statusCalculado;
        this.mudou = mudou;
    }

    public StatusOSC getStatusCalculado() {
        return statusCalculado;
    }

    public void setStatusCalculado(StatusOSC statusCalculado) {
        this.statusCalculado = statusCalculado;
    }

    public boolean isMudou() {
        return mudou;
    }

    public void setMudou(boolean mudou) {
        this.mudou = mudou;
    }
}

