package org.acme.service;

import org.acme.dto.external.ExternalEmendaDTO;
import org.acme.entity.Emenda;

import java.math.BigDecimal;
import java.time.LocalDate;

@jakarta.enterprise.context.ApplicationScoped
public class EmendaImportMapper {

    public Emenda toEntity(ExternalEmendaDTO src) {
        if (src == null) return null;

        Emenda e = new Emenda();
        e.councilorId = blankToNull(src.councilorId);
        e.officialCode = blankToNull(src.officialCode);
        e.date = parseDateOrYear(src.date, src.year);
        e.value = parseBigDecimal(valueToString(src.value));
        e.classification = blankToNull(src.classification);
        e.category = blankToNull(src.category);
        e.status = normalizeStatus(src);
        e.federalStatus = blankToNull(src.federalStatus);
        e.institutionId = blankToNull(src.institutionId);
        e.signedLink = blankToNull(src.signedLink);
        e.description = blankToNull(src.description);
        e.objectDetail = blankToNull(src.objectDetail);

        // JIRA 7: convênio (optional in external dataset)
        if (src.existeConvenio != null) {
            e.existeConvenio = src.existeConvenio;
        }
        e.numeroConvenio = blankToNull(src.numeroConvenio);
        e.anoConvenio = src.anoConvenio;

        // JIRA 6: esfera (best-effort)
        if (src.esfera != null && !src.esfera.isBlank()) {
            e.esfera = src.esfera.trim();
        } else if (src.federalStatus != null && !src.federalStatus.isBlank()) {
            e.esfera = "Federal";
        } else {
            e.esfera = "Municipal";
        }

        // Auto-fill: when external status is "Aprovada pelo Gestor",
        // set Tipo de Emenda and Tipo de Execução automatically.
        String rawStatus = blankToNull(src.status);
        if (rawStatus == null) rawStatus = blankToNull(src.state);
        if (rawStatus == null) rawStatus = blankToNull(src.situation);
        boolean isAprovadaPeloGestor = rawStatus != null &&
            (rawStatus.equalsIgnoreCase("Aprovada pelo Gestor") ||
             rawStatus.equalsIgnoreCase("Aprovado pelo Gestor"));

        if (isAprovadaPeloGestor) {
            // Always set the canonical Tipo de Emenda
            e.classification = "EMENDA_INDIVIDUAL_TRANSFERENCIA_FINALIDADE_DEFINIDA";
            // Tipo de Execução: use API value if present, otherwise default to Direta
            String tipoApi = blankToNull(src.tipoTransferencia);
            if (tipoApi != null) {
                String tipoNorm = tipoApi.trim().toLowerCase();
                e.tipoTransferencia = tipoNorm.contains("indireta") ? "Indireta" : "Direta";
            } else {
                e.tipoTransferencia = "Direta";
            }
        } else {
            // For other statuses, use API value if present
            String tipoApi = blankToNull(src.tipoTransferencia);
            if (tipoApi != null) {
                String tipoNorm = tipoApi.trim().toLowerCase();
                e.tipoTransferencia = tipoNorm.contains("indireta") ? "Indireta" : "Direta";
            }
        }

        return e;
    }

    private static String normalizeStatus(ExternalEmendaDTO src) {
        String s = blankToNull(src.status);
        if (s == null) s = blankToNull(src.state);
        if (s == null) s = blankToNull(src.situation);

        // If still null, default to "Recebido"
        if (s == null) return "Recebido";

        // Map external status to valid internal status
        // Valid statuses: Recebido, Iniciado, Em execução, Concluído, Devolvido
        String normalized = s.toLowerCase().trim();

        // Map common variations
        switch (normalized) {
            // Aprovada -> Recebida
            case "aprovada":
            case "aprovado":
            case "aprovada pelo gestor":
            case "aprovado pelo gestor":
                return "Recebido";

            // Pendente/Aguardando -> Recebida
            case "pendente":
            case "aguardando":
            case "aguardando detalhamento":
                return "Recebido";

            // Devolvida para Retificação -> Devolvido
            case "devolvida":
            case "devolvido":
            case "devolvida para retificação":
            case "devolvido para retificação":
            case "retificação":
                return "Devolvido";

            // Iniciado
            case "iniciado":
            case "iniciada":
            case "em análise":
                return "Iniciado";

            // Em execução
            case "em execução":
            case "em execucao":
            case "executando":
            case "em andamento":
                return "Em execução";

            // Concluído
            case "concluído":
            case "concluido":
            case "concluída":
            case "concluida":
            case "finalizado":
            case "finalizada":
                return "Concluído";

            default:
                // If doesn't match any known status, default to "Recebido"
                return "Recebido";
        }
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static LocalDate parseDateOrYear(String date, String year) {
        if (date != null && !date.isBlank()) {
            String t = date.trim();
            if (t.length() >= 10) t = t.substring(0, 10);
            try {
                return LocalDate.parse(t);
            } catch (Exception ignored) {
                // fall through
            }
        }
        if (year != null && !year.isBlank()) {
            String y = year.trim();
            // Support "2024" or "2024-01-01" etc.
            if (y.length() >= 4) {
                try {
                    int yi = Integer.parseInt(y.substring(0, 4));
                    return LocalDate.of(yi, 1, 1);
                } catch (Exception ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private static String valueToString(Object v) {
        if (v == null) return null;
        if (v instanceof String s) return s;
        return String.valueOf(v);
    }

    private static BigDecimal parseBigDecimal(String s) {
        if (s == null || s.isBlank()) return null;
        String t = s.trim();
        t = t.replace("R$", "").replace(" ", "");
        // Remove thousand separators and normalize decimal separator
        t = t.replace(".", "").replace(",", ".");
        try {
            return new BigDecimal(t);
        } catch (Exception ignored) {
            return null;
        }
    }
}
