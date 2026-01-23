package org.acme.service;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "external-emendas-api")
@RegisterClientHeaders(ExternalEmendasAuthHeaderFactory.class)
public interface EmendaExternalApiClient {

    @GET
    @Path("/admin-api/api/public/v1/amendments")
    @Produces(MediaType.APPLICATION_JSON)
    Response listAmendments();

    /**
     * Consolidated public dataset:
     * GET /api/public/v1/data
     */
    @GET
    @Path("/api/public/v1/data")
    @Produces(MediaType.APPLICATION_JSON)
    Response getPublicData();
}
