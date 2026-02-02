package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Parlamentar;
import org.acme.service.CouncilorService;

import java.util.List;

@Path("/api/councilors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CouncilorResource {

    @Inject
    CouncilorService councilorService;

    @GET
    public List<Parlamentar> list() {
        return councilorService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        Parlamentar parlamentar = councilorService.findById(id);
        if (parlamentar == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(parlamentar).build();
    }

    @GET
    @Path("/by-councilor-id/{councilorId}")
    public Response getByCouncilorId(@PathParam("councilorId") String councilorId) {
        Parlamentar parlamentar = councilorService.findByCouncilorId(councilorId);
        if (parlamentar == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(parlamentar).build();
    }

    @POST
    public Response create(Parlamentar parlamentar) {
        // Check if councilorId already exists
        Parlamentar existing = councilorService.findByCouncilorId(parlamentar.idParlamentar);
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"Councilor ID already exists\"}")
                    .build();
        }

        Parlamentar created = councilorService.create(parlamentar);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Parlamentar parlamentar) {
        Parlamentar updated = councilorService.update(id, parlamentar);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean deleted = councilorService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}

