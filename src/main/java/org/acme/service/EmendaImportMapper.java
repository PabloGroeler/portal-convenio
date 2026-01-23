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
        e.status = blankToNull(src.status);
        e.institutionId = blankToNull(src.institutionId);
        e.signedLink = blankToNull(src.signedLink);
        e.description = blankToNull(src.description);
        e.objectDetail = blankToNull(src.objectDetail);
        return e;
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
