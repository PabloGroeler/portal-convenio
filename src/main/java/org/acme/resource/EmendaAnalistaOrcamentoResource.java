package org.acme.resource;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.dto.AnalistaOrcamentoResponseDTO;
import org.acme.dto.AtribuirAnalistaRequestDTO;
import org.acme.dto.UserAdminDTO;
import org.acme.service.EmendaAnalistaOrcamentoService;
import java.util.List;
@Path("/api/emendas/{emendaId}/analista-orcamento")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmendaAnalistaOrcamentoResource {
    @Inject
    EmendaAnalistaOrcamentoService service;
    @Context
    SecurityContext securityContext;
    @GET
    public Response getAnalistaAtivo(@PathParam("emendaId") String emendaId) {
        return service.getAnalistaAtivo(emendaId)
                .map(dto -> Response.ok(dto).build())
                .orElse(Response.noContent().build());
    }
    @POST
    public Response atribuirAnalista(
            @PathParam("emendaId") String emendaId,
            @Valid AtribuirAnalistaRequestDTO request) {
        String currentUser = securityContext.getUserPrincipal() != null
                ? securityContext.getUserPrincipal().getName() : "sistema";
        AnalistaOrcamentoResponseDTO result = service.atribuirAnalista(emendaId, request.analistaId(), currentUser);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }
    @DELETE
    public Response removerAnalista(@PathParam("emendaId") String emendaId) {
        String currentUser = securityContext.getUserPrincipal() != null
                ? securityContext.getUserPrincipal().getName() : "sistema";
        service.removerAnalista(emendaId, currentUser);
        return Response.noContent().build();
    }
}
