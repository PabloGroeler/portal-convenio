package org.acme.resource;

import org.acme.dto.PrestacaoContaDTO;
import org.acme.service.PrestacaoContaService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;

@Path("/api/prestacao-contas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PrestacaoContaResource {

    @Inject
    PrestacaoContaService service;

    @GET
    @Path("/plano/{planoId}")
    public List<PrestacaoContaDTO> listByPlano(@PathParam("planoId") String planoId) {
        return service.listByPlano(planoId);
    }

    @POST
    public Response create(PrestacaoContaDTO dto) {
        try {
            PrestacaoContaDTO created = service.create(dto);
            return Response.created(URI.create("/api/prestacao-contas/" + created.id())).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro interno: " + e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, PrestacaoContaDTO dto) {
        try {
            PrestacaoContaDTO updated = service.update(id, dto);
            if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro interno: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean ok = service.delete(id);
        if (!ok) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }
}
