package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Councilor;
import org.acme.service.CouncilorService;

import java.util.List;

@Path("/api/councilors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CouncilorResource {

    @Inject
    CouncilorService councilorService;

    @GET
    public List<Councilor> list() {
        return councilorService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Councilor councilor = councilorService.findById(id);
        if (councilor == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(councilor).build();
    }

    @GET
    @Path("/by-councilor-id/{councilorId}")
    public Response getByCouncilorId(@PathParam("councilorId") String councilorId) {
        Councilor councilor = councilorService.findByCouncilorId(councilorId);
        if (councilor == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(councilor).build();
    }

    @POST
    public Response create(Councilor councilor) {
        // Check if councilorId already exists
        Councilor existing = councilorService.findByCouncilorId(councilor.councilorId);
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"Councilor ID already exists\"}")
                    .build();
        }

        Councilor created = councilorService.create(councilor);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Councilor councilor) {
        Councilor updated = councilorService.update(id, councilor);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = councilorService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}

