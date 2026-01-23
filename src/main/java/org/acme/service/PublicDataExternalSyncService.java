package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class PublicDataExternalSyncService {

    @Inject
    @RestClient
    ExternalEmendasApiClient publicClient;

    @Inject
    PublicDataImportService importService;

    @Inject
    ExternalApiResponseReader responseReader;

    public PublicDataImportService.SyncSummary syncAll(String usuario) {
        Response response = publicClient.getPublicData();
        var root = responseReader.readJsonOrThrow(response, "GET /api/public/v1/data");
        return importService.importPublicData(root, usuario != null ? usuario : "sistema");
    }
}
