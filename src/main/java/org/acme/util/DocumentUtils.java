package org.acme.util;

/**
 * Utility class for handling Brazilian document numbers (CPF, CNPJ)
 */
public class DocumentUtils {

    private DocumentUtils() {
        // Utility class, no instances
    }

    /**
     * Removes all non-numeric characters from a CNPJ string.
     * Ensures the result is at most 14 digits.
     *
     * Examples:
     * - "12.345.678/0001-90" -> "12345678000190"
     * - "12345678000190" -> "12345678000190"
     * - null -> null
     *
     * @param cnpj the CNPJ string (may be formatted or not)
     * @return cleaned CNPJ with only digits, max 14 characters, or null if input is null
     */
    public static String cleanCNPJ(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) {
            return null;
        }

        // Remove all non-digit characters
        String cleaned = cnpj.replaceAll("[^0-9]", "");

        // Ensure it's not longer than 14 digits (CNPJ standard length)
        if (cleaned.length() > 14) {
            cleaned = cleaned.substring(0, 14);
        }

        // Return null if empty after cleaning
        return cleaned.isEmpty() ? null : cleaned;
    }

    /**
     * Removes all non-numeric characters from a CPF string.
     * Ensures the result is at most 11 digits.
     *
     * Examples:
     * - "123.456.789-01" -> "12345678901"
     * - "12345678901" -> "12345678901"
     * - null -> null
     *
     * @param cpf the CPF string (may be formatted or not)
     * @return cleaned CPF with only digits, max 11 characters, or null if input is null
     */
    public static String cleanCPF(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            return null;
        }

        // Remove all non-digit characters
        String cleaned = cpf.replaceAll("[^0-9]", "");

        // Ensure it's not longer than 11 digits (CPF standard length)
        if (cleaned.length() > 11) {
            cleaned = cleaned.substring(0, 11);
        }

        // Return null if empty after cleaning
        return cleaned.isEmpty() ? null : cleaned;
    }

    /**
     * Validates if a string is a valid CNPJ (14 digits after cleaning)
     *
     * @param cnpj the CNPJ to validate
     * @return true if valid format (14 digits), false otherwise
     */
    public static boolean isValidCNPJFormat(String cnpj) {
        String cleaned = cleanCNPJ(cnpj);
        return cleaned != null && cleaned.length() == 14;
    }

    /**
     * Validates if a string is a valid CPF (11 digits after cleaning)
     *
     * @param cpf the CPF to validate
     * @return true if valid format (11 digits), false otherwise
     */
    public static boolean isValidCPFFormat(String cpf) {
        String cleaned = cleanCPF(cpf);
        return cleaned != null && cleaned.length() == 11;
    }
}
