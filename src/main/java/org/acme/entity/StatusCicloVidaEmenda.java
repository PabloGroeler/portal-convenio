package org.acme.entity;

/**
 * JIRA 9 — Status do ciclo de vida da emenda.
 */
public enum StatusCicloVidaEmenda {
    RECEBIDO("Recebido"),
    EM_ANALISE_ADMISSIBILIDADE("Em análise de admissibilidade"),
    ADMISSIBILIDADE_APROVADA("Admissibilidade aprovada"),
    DEVOLVIDA_LEGISLATIVO("Devolvida ao legislativo"),
    EM_ANALISE_DEMANDA("Em análise de demanda"),
    ANALISE_DEMANDA_APROVADA("Análise de demanda aprovada"),
    DEVOLVIDA_INCOMPATIBILIDADE_DEMANDA("Devolvida por incompatibilidade de demanda"),
    EM_ANALISE_DOCUMENTAL("Em análise documental"),
    ANALISE_DOCUMENTAL_APROVADA("Análise documental aprovada"),
    DEVOLVIDA_INVIABILIDADE_DOCUMENTAL("Devolvida por inviabilidade documental"),
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


