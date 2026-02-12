package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.TipoDocumentoConfigDTO;
import org.acme.service.TipoDocumentoConfigService;

@Path("/api/tipos-documento-config")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TipoDocumentoConfigResource {

    @Inject
    TipoDocumentoConfigService service;

    @GET
    public Response listarAtivos() {
        return Response.ok(service.listarAtivos()).build();
    }

    @GET
    @Path("/categoria/{categoria}")
    public Response listarPorCategoria(@PathParam("categoria") String categoria) {
        return Response.ok(service.listarPorCategoria(categoria)).build();
    }

    @GET
    @Path("/{codigo}")
    public Response buscarPorCodigo(@PathParam("codigo") String codigo) {
        TipoDocumentoConfigDTO dto = service.buscarPorCodigo(codigo);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @PUT
    @Path("/{codigo}")
    public Response atualizar(@PathParam("codigo") String codigo, TipoDocumentoConfigDTO dto) {
        try {
            return Response.ok(service.atualizar(codigo, dto)).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }
}
