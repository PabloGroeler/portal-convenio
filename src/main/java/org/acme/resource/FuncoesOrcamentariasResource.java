package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.FuncaoOrcamentaria;
import org.acme.service.FuncaoOrcamentariaService;

import java.util.List;

@Path("/api/funcoes-orcamentarias")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FuncoesOrcamentariasResource {

    @Inject
    FuncaoOrcamentariaService service;

    @GET
    public List<FuncaoOrcamentaria> list() {
        return service.listAll();
    }

    @GET
    @Path("/{codigo}")
    public Response getByCodigo(@PathParam("codigo") String codigo) {
        FuncaoOrcamentaria f = service.findByCodigo(codigo);
        if (f == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(f).build();
    }
}

