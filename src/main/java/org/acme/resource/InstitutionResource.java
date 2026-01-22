package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Institution;
import org.acme.service.InstitutionService;

import java.util.List;

@Path("/api/institutions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InstitutionResource {

    @Inject
    InstitutionService institutionService;

    @GET
    public List<Institution> list() {
        return institutionService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        Institution institution = institutionService.findById(id);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(institution).build();
    }

    @GET
    @Path("/by-institution-id/{institutionId}")
    public Response getByInstitutionId(@PathParam("institutionId") String institutionId) {
        Institution institution = institutionService.findByInstitutionId(institutionId);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(institution).build();
    }

    @POST
    public Response create(Institution institution) {
        // Check if institutionId already exists
        Institution existing = institutionService.findByInstitutionId(institution.institutionId);
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"Institution ID already exists\"}")
                    .build();
        }

        Institution created = institutionService.create(institution);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Institution institution) {
        Institution updated = institutionService.update(id, institution);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean deleted = institutionService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}

