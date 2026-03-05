package org.acme.resource;

import org.acme.dto.FuncionalidadeDTO;
import org.acme.service.FuncionalidadeService;
import org.acme.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.annotation.security.PermitAll;

import java.math.BigDecimal;
import java.util.List;

@Path("/api/admin/funcionalidades")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminFuncionalidadeResource {

    @Inject
    FuncionalidadeService service;

    @GET
    @PermitAll
    public Response listAll() {
        List<FuncionalidadeDTO> list = service.listAll();
        return Response.ok(list).build();
    }

    public static class CreatePayload {
        public String chave;
        public String descricao;
        public BigDecimal percentualSaude;
        public BigDecimal percentualEducacao;
    }

    @POST
    @RolesAllowed({"ADMIN"})
    public Response create(CreatePayload p) {
        FuncionalidadeDTO created = service.create(p.chave, p.descricao, p.percentualSaude, p.percentualEducacao);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    public static class UpdatePayload {
        public String descricao;
        public BigDecimal percentualSaude;
        public BigDecimal percentualEducacao;
        public Boolean ativo;
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN"})
    public Response update(@PathParam("id") Long id, UpdatePayload p) {
        FuncionalidadeDTO updated = service.update(id, p.descricao, p.percentualSaude, p.percentualEducacao, p.ativo);
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
