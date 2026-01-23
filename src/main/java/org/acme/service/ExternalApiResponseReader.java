package org.acme.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Safely reads an external HTTP response that should be JSON, but may come back as HTML
 * (login pages, WAF blocks, redirects, etc.).
 */
@ApplicationScoped
public class ExternalApiResponseReader {

    @Inject
    ObjectMapper objectMapper;

    public JsonNode readJsonOrThrow(Response response, String endpointLabel) {
        if (response == null) {
            throw new IllegalStateException("External API response was null for " + endpointLabel);
        }

        int status = response.getStatus();
        MediaType mt = response.getMediaType();
        String contentType = mt != null ? mt.toString() : "(unknown)";

        String body;
        try {
            body = response.readEntity(String.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to read external API response body for " + endpointLabel + ": " + e.getMessage(), e);
        }

        if (status < 200 || status >= 300) {
            throw new IllegalStateException(
                    "External API call failed for " + endpointLabel + " (status=" + status + ", contentType=" + contentType + ") body=" + abbreviate(body)
            );
        }

        // If content-type isn't JSON, fail with a useful snippet.
        if (mt == null || (!MediaType.APPLICATION_JSON_TYPE.isCompatible(mt) && !contentType.contains("json"))) {
            throw new IllegalStateException(
                    "External API returned non-JSON for " + endpointLabel + " (status=" + status + ", contentType=" + contentType + ") body=" + abbreviate(body)
            );
        }

        try {
            return objectMapper.readTree(body);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "External API JSON parse failed for " + endpointLabel + " (contentType=" + contentType + ") body=" + abbreviate(body),
                    e
            );
        }
    }

    private static String abbreviate(String s) {
        if (s == null) return "(null)";
        String t = s.replaceAll("\\s+", " ").trim();
        if (t.length() <= 300) return t;
        return t.substring(0, 300) + "...";
    }
}

