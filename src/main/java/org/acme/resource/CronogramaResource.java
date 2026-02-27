package org.acme.resource;

import org.acme.dto.CronogramaDTO;
import org.acme.service.CronogramaService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;

@Path("/api/cronograma")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CronogramaResource {

    @Inject
    CronogramaService service;

    @GET
    @Path("/meta/{metaId}")
    public List<CronogramaDTO> listByMeta(@PathParam("metaId") String metaId) {
        return service.listByMeta(metaId);
    }

    @POST
    public Response create(CronogramaDTO dto) {
        CronogramaDTO created = service.create(dto);
        return Response.created(URI.create("/api/cronograma/" + created.id())).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, CronogramaDTO dto) {
        CronogramaDTO updated = service.update(id, dto);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean ok = service.delete(id);
        if (!ok) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }
}
