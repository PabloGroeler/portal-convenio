package org.acme.entity;

/**
 * JIRA 9 — Status do ciclo de vida da emenda.
 */
public enum StatusCicloVidaEmenda {
    RECEBIDO("Recebido"),
    INICIADO("Iniciado"),
    EM_EXECUCAO("Em execução"),
    CONCLUIDO("Concluído"),
    DEVOLVIDO("Devolvido");

    private final String label;

    StatusCicloVidaEmenda(String label) {
        this.label = label;
    }

    public String toLabel() {
        return label;
    }

    public static StatusCicloVidaEmenda fromStringOrNull(String value) {
        if (value == null) return null;
        String v = value.trim();
        if (v.isEmpty()) return null;

        for (StatusCicloVidaEmenda s : values()) {
            if (s.label.equalsIgnoreCase(v)) return s;
            if (s.name().equalsIgnoreCase(v)) return s;
        }
        return null;
    }
}


