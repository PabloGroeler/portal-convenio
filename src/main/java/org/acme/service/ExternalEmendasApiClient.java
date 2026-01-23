package org.acme.service;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Client for the external "emendas" service.
 *
 * IMPORTANT:
 * - /admin-api/api/public/v1/* requires Bearer token
 * - /api/public/v1/* (public dataset) does NOT require token and often returns HTML if you hit the wrong host/path.
 */
@RegisterRestClient(configKey = "external-emendas-api")
@RegisterClientHeaders(ExternalEmendasAuthHeaderFactory.class)
public interface ExternalEmendasApiClient {

    @GET
    @Path("/admin-api/api/public/v1/amendments")
    @Produces(MediaType.APPLICATION_JSON)
    Response listAmendments();

    @GET
    @Path("/admin-api/api/public/v1/data")
    @Produces(MediaType.APPLICATION_JSON)
    Response getPublicData();
}
