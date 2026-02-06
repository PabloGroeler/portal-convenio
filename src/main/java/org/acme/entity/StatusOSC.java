package org.acme.entity;

public enum StatusOSC {
    EM_CADASTRO("Em Cadastro"),
    DOCUMENTOS_INCOMPLETOS("Documentos Incompletos"),
    EM_ANALISE("Em Análise"),
    APROVADO("Aprovado"),
    REPROVADO("Reprovado"),
    SUSPENSA("Suspensa"),
    INATIVA("Inativa");

    private final String descricao;

    StatusOSC(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

