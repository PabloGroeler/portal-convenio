package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.annotation.security.RolesAllowed;
import jakarta.annotation.security.PermitAll;

import org.acme.dto.ParlamentarLimiteDTO;
import org.acme.service.ParlamentarLimiteService;

import java.math.BigDecimal;
import java.util.List;

@Path("/api/admin/parlamentar-limites")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminParlamentarLimitesResource {

    @Inject
    ParlamentarLimiteService service;

    @GET
    @PermitAll
    public Response listAll() {
        List<ParlamentarLimiteDTO> list = service.listAll();
        return Response.ok(list).build();
    }

    @GET
    @Path("/parlamentar/{id}")
    @PermitAll
    public Response listByParlamentar(@PathParam("id") String parlamentarId) {
        List<ParlamentarLimiteDTO> list = service.listByParlamentar(parlamentarId);
        return Response.ok(list).build();
    }

    public static class CreatePayload {
        public String parlamentarId;
        public Integer ano;
        public BigDecimal valorAnual;
    }

    @POST
    @RolesAllowed({"ADMIN"})
    public Response create(CreatePayload p) {
        ParlamentarLimiteDTO created = service.create(p.parlamentarId, p.ano, p.valorAnual);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    public static class UpdatePayload { public BigDecimal valorAnual; }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    public Response update(@PathParam("id") Long id, UpdatePayload p) {
        ParlamentarLimiteDTO updated = service.update(id, p.valorAnual);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    public Response delete(@PathParam("id") Long id) {
        boolean ok = service.delete(id);
        if (!ok) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }
}

