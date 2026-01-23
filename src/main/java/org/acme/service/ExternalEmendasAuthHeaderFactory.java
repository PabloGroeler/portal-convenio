package org.acme.service;

import org.eclipse.microprofile.config.ConfigProvider;
import org.eclipse.microprofile.rest.client.ext.ClientHeadersFactory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.MultivaluedMap;
import org.jboss.logging.Logger;

/**
 * Adds Authorization: Bearer <token> for the external emendas API.
 */
@ApplicationScoped
public class ExternalEmendasAuthHeaderFactory implements ClientHeadersFactory {

    private static final Logger LOG = Logger.getLogger(ExternalEmendasAuthHeaderFactory.class);

    @Override
    public MultivaluedMap<String, String> update(MultivaluedMap<String, String> incomingHeaders,
                                                MultivaluedMap<String, String> clientOutgoingHeaders) {
        String token = readToken();
        if (token != null && !token.isBlank()) {
            clientOutgoingHeaders.putSingle("Authorization", "Bearer " + token);
            LOG.debugf("External emendas API auth header applied (tokenLength=%d)", token.length());
        } else {
            // Without the token, the external API call will always return 401.
            // We throw here to provide a clear message to /sync-external.
            throw new IllegalStateException(
                    "External emendas API token not configured. Set one of: " +
                            "(1) env EXTERNAL_EMENDAS_API_TOKEN, " +
                            "(2) JVM -Dexternal-emendas-api.token=..., " +
                            "(3) application.properties external-emendas-api.token=..."
            );
        }
        return clientOutgoingHeaders;
    }

    private String readToken() {
        // 1) application.properties (optional)
        String t = ConfigProvider.getConfig()
                .getOptionalValue("external-emendas-api.token", String.class)
                .orElse(null);
        if (t != null && !t.isBlank()) return t;

        // 1b) allow Quarkus-style env var mapping: EXTERNAL_EMENDAS_API_TOKEN
        // (kept as separate explicit key for clarity)

        // 2) JVM system property
        t = System.getProperty("external-emendas-api.token");
        if (t != null && !t.isBlank()) return t;

        // 3) Environment variable
        t = System.getenv("EXTERNAL_EMENDAS_API_TOKEN");
        if (t != null && !t.isBlank()) return t;

        return null;
    }
}
