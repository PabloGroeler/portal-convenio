package org.acme.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.acme.dto.external.ExternalEmendaDTO;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.Collections;
import java.util.List;

@ApplicationScoped
public class EmendaExternalSyncService {

    @Inject
    @RestClient
    EmendaExternalApiClient client;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    EmendaImportService importService;

    @Inject
    ExternalApiResponseReader responseReader;

    /**
     * Fetches emendas from the external API and persists them into our database.
     */
    public EmendaImportService.ImportSummary syncNow(String usuario) {
        Response response = client.listAmendments();
        JsonNode root = responseReader.readJsonOrThrow(response, "GET /admin-api/api/public/v1/amendments");
        List<ExternalEmendaDTO> list = extractList(root);
        return importService.importFromExternal(list, usuario);
    }

    /**
     * The external API may return either:
     * - an array directly, or
     * - an object containing a list under common keys (data/items/content/results).
     */
    private List<ExternalEmendaDTO> extractList(JsonNode root) {
        if (root == null || root.isNull()) return Collections.emptyList();

        JsonNode listNode = root;
        if (root.isObject()) {
            if (root.hasNonNull("data")) listNode = root.get("data");
            else if (root.hasNonNull("items")) listNode = root.get("items");
            else if (root.hasNonNull("content")) listNode = root.get("content");
            else if (root.hasNonNull("results")) listNode = root.get("results");
        }

        if (listNode == null || !listNode.isArray()) return Collections.emptyList();

        return objectMapper.convertValue(listNode, new TypeReference<>() {});
    }
}
