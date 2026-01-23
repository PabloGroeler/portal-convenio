package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.service.PublicDataExternalSyncService;
import org.acme.service.PublicDataImportService;

@Path("/api/public/sync")
@Produces(MediaType.APPLICATION_JSON)
public class PublicDataSyncResource {

    @Inject
    PublicDataExternalSyncService syncService;

    @Context
    SecurityContext securityContext;

    private String getCurrentUser() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            return securityContext.getUserPrincipal().getName();
        }
        return "sistema";
    }

    /**
     * Triggers a full sync using GET /api/public/v1/data from the external service.
     */
    @POST
    @Path("/external-data")
    public Response syncExternalPublicData() {
        try {
            PublicDataImportService.SyncSummary summary = syncService.syncAll(getCurrentUser());
            return Response.ok(summary).build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_GATEWAY)
                    .entity("{\"error\": \"Falha ao sincronizar com API externa\", \"details\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
    }
}

