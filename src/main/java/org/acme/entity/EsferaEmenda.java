package org.acme.entity;

/**
 * JIRA 6 — Esfera da Emenda.
 */
public enum EsferaEmenda {
    MUNICIPAL,
    ESTADUAL,
    FEDERAL;

    public static EsferaEmenda fromStringOrNull(String value) {
        if (value == null) return null;
        String v = value.trim();
        if (v.isEmpty()) return null;

        // Accept both enum style and Portuguese labels
        return switch (v.toUpperCase()) {
            case "MUNICIPAL" -> MUNICIPAL;
            case "ESTADUAL" -> ESTADUAL;
            case "FEDERAL" -> FEDERAL;
            default -> null;
        };
    }

    public String toLabel() {
        return switch (this) {
            case MUNICIPAL -> "Municipal";
            case ESTADUAL -> "Estadual";
            case FEDERAL -> "Federal";
        };
    }
}

