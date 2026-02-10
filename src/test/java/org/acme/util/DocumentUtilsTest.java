package org.acme.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DocumentUtilsTest {

    @Test
    void testCleanCNPJ_Formatted() {
        // Formatted CNPJ with dots, slashes, and hyphens
        String formatted = "12.345.678/0001-90";
        String result = DocumentUtils.cleanCNPJ(formatted);

        assertEquals("12345678000190", result);
        assertEquals(14, result.length());
    }

    @Test
    void testCleanCNPJ_AlreadyClean() {
        // Already clean CNPJ
        String clean = "12345678000190";
        String result = DocumentUtils.cleanCNPJ(clean);

        assertEquals("12345678000190", result);
        assertEquals(14, result.length());
    }

    @Test
    void testCleanCNPJ_Null() {
        String result = DocumentUtils.cleanCNPJ(null);
        assertNull(result);
    }

    @Test
    void testCleanCNPJ_Empty() {
        String result = DocumentUtils.cleanCNPJ("");
        assertNull(result);
    }

    @Test
    void testCleanCNPJ_TooLong() {
        // More than 14 digits - should truncate
        String tooLong = "123456780001901234";
        String result = DocumentUtils.cleanCNPJ(tooLong);

        assertEquals("12345678000190", result);
        assertEquals(14, result.length());
    }

    @Test
    void testCleanCNPJ_WithSpaces() {
        String withSpaces = "12 345 678 0001 90";
        String result = DocumentUtils.cleanCNPJ(withSpaces);

        assertEquals("12345678000190", result);
    }

    @Test
    void testCleanCPF_Formatted() {
        // Formatted CPF with dots and hyphen
        String formatted = "123.456.789-01";
        String result = DocumentUtils.cleanCPF(formatted);

        assertEquals("12345678901", result);
        assertEquals(11, result.length());
    }

    @Test
    void testCleanCPF_AlreadyClean() {
        String clean = "12345678901";
        String result = DocumentUtils.cleanCPF(clean);

        assertEquals("12345678901", result);
        assertEquals(11, result.length());
    }

    @Test
    void testIsValidCNPJFormat_Valid() {
        assertTrue(DocumentUtils.isValidCNPJFormat("12.345.678/0001-90"));
        assertTrue(DocumentUtils.isValidCNPJFormat("12345678000190"));
    }

    @Test
    void testIsValidCNPJFormat_Invalid() {
        assertFalse(DocumentUtils.isValidCNPJFormat("123"));
        assertFalse(DocumentUtils.isValidCNPJFormat(null));
        assertFalse(DocumentUtils.isValidCNPJFormat(""));
    }

    @Test
    void testIsValidCPFFormat_Valid() {
        assertTrue(DocumentUtils.isValidCPFFormat("123.456.789-01"));
        assertTrue(DocumentUtils.isValidCPFFormat("12345678901"));
    }

    @Test
    void testIsValidCPFFormat_Invalid() {
        assertFalse(DocumentUtils.isValidCPFFormat("123"));
        assertFalse(DocumentUtils.isValidCPFFormat(null));
        assertFalse(DocumentUtils.isValidCPFFormat(""));
    }
}
