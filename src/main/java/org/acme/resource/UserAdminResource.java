package org.acme.resource;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.service.UserAdminService;

@Path("/api/admin/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserAdminResource {

    private final UserAdminService userAdminService;

    public UserAdminResource(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GET
    public Response list() {
        return Response.ok(userAdminService.list()).build();
    }

    @GET
    @Path("/{id}")
    public Response get(@PathParam("id") Long id) {
        return Response.ok(userAdminService.get(id)).build();
    }

    @POST
    public Response create(UserAdminService.UserAdminCreateRequest req) {
        return Response.ok(userAdminService.create(req)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, UserAdminService.UserAdminUpdateRequest req) {
        return Response.ok(userAdminService.update(id, req)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        userAdminService.delete(id);
        return Response.noContent().build();
    }
}
