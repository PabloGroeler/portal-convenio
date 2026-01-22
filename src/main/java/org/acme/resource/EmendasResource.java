package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.entity.Emenda;
import org.acme.service.EmendaService;
import org.acme.dto.EmendaAcaoDTO;
import org.acme.dto.EmendaHistoricoDTO;
import org.acme.dto.EmendaDetailDTO;

import java.util.List;

@Path("/api/emendas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmendasResource {

    @Inject
    EmendaService emendaService;

    @Context
    SecurityContext securityContext;

    private String getCurrentUser() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            return securityContext.getUserPrincipal().getName();
        }
        return "sistema";
    }

    @GET
    public List<Emenda> list() {
        return emendaService.listAll();
    }

    @GET
    @Path("/with-details")
    public List<EmendaDetailDTO> listWithDetails() {
        return emendaService.listAllWithDetails();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        Emenda e = emendaService.findById(id);
        if (e == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(e).build();
    }

    @GET
    @Path("/{id}/with-details")
    public Response getByIdWithDetails(@PathParam("id") String id) {
        EmendaDetailDTO dto = emendaService.findByIdWithDetails(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @POST
    public Response create(Emenda emenda) {
        Emenda created = emendaService.create(emenda, getCurrentUser());
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Emenda emenda) {
        Emenda updated = emendaService.update(id, emenda, getCurrentUser());
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @POST
    @Path("/{id}/acao")
    public Response executarAcao(@PathParam("id") String id, EmendaAcaoDTO acao) {
        if (acao.acao == null || acao.acao.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Ação é obrigatória\"}")
                    .build();
        }

        // Set current user if not provided
        if (acao.usuario == null || acao.usuario.isBlank()) {
            acao.usuario = getCurrentUser();
        }

        Emenda updated = emendaService.executarAcao(id, acao);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @GET
    @Path("/{id}/historico")
    public Response getHistorico(@PathParam("id") String id) {
        Emenda emenda = emendaService.findById(id);
        if (emenda == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        List<EmendaHistoricoDTO> historico = emendaService.getHistorico(id);
        return Response.ok(historico).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean deleted = emendaService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}
