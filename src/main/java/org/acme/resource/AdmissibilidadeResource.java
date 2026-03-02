package org.acme.resource;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.dto.AdmissibilidadeRequestDTO;
import org.acme.service.AdmissibilidadeService;
@Path("/api/emendas/{emendaId}/admissibilidade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdmissibilidadeResource {
    @Inject
    AdmissibilidadeService service;
    @Context
    SecurityContext securityContext;
    @GET
    public Response get(@PathParam("emendaId") String emendaId) {
        return service.getAdmissibilidade(emendaId)
                .map(dto -> Response.ok(dto).build())
                .orElse(Response.noContent().build());
    }
    @POST
    public Response registrar(
            @PathParam("emendaId") String emendaId,
            @Valid AdmissibilidadeRequestDTO request) {
        String currentUser = securityContext.getUserPrincipal() != null
                ? securityContext.getUserPrincipal().getName() : "sistema";
        var result = service.registrar(emendaId, request, currentUser);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }
}