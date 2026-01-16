package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Emenda;
import org.acme.service.EmendaService;

import java.util.List;

@Path("/api/emendas")
@Produces(MediaType.APPLICATION_JSON)
public class EmendasResource {

    @Inject
    EmendaService emendaService;

    @GET
    public List<Emenda> list() {
        return emendaService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Emenda e = emendaService.findById(id);
        if (e == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(e).build();
    }
}
