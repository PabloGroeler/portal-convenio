package org.acme.resource;

import org.acme.dto.PlanoTrabalhoDTO;
import org.acme.dto.FullPlanoTrabalhoDTO;
import org.acme.service.PlanoTrabalhoService;
import org.acme.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;
import java.net.URI;
import java.util.List;

@Path("/api/plano-trabalho")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PlanoTrabalhoResource {

    @Inject
    PlanoTrabalhoService service;

    @GET
    public Response listAll() {
        try {
            List<PlanoTrabalhoDTO> list = service.listAll();
            return Response.ok(list).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro ao listar planos: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/instituicao/{id}")
    public Response listByInstituicao(@PathParam("id") String id) {
        try {
            List<PlanoTrabalhoDTO> list = service.listByInstituicao(id);
            return Response.ok(list).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro ao listar planos: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response get(@PathParam("id") String id) {
        PlanoTrabalhoDTO p = service.findById(id);
        if (p == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(p).build();
    }

    @GET
    @Path("/full/{id}")
    public Response getFull(@PathParam("id") String id) {
        FullPlanoTrabalhoDTO p = service.findFullById(id);
        if (p == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(p).build();
    }

    @POST
    public Response create(PlanoTrabalhoDTO dto, @Context SecurityContext ctx) {
        String user = ctx.getUserPrincipal() != null ? ctx.getUserPrincipal().getName() : null;
        try {
            PlanoTrabalhoDTO created = service.create(dto, user);
            return Response.created(URI.create("/api/plano-trabalho/" + created.id())).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro interno ao criar plano: " + e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, PlanoTrabalhoDTO dto, @Context SecurityContext ctx) {
        String user = ctx.getUserPrincipal() != null ? ctx.getUserPrincipal().getName() : null;
        try {
            PlanoTrabalhoDTO updated = service.update(id, dto, user);
            if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro interno ao atualizar plano: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id, @Context SecurityContext ctx) {
        String user = ctx.getUserPrincipal() != null ? ctx.getUserPrincipal().getName() : null;
        boolean ok = service.delete(id, user);
        if (!ok) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/aprovar")
    public Response aprovar(@PathParam("id") String id, MotivoPayload payload, @Context SecurityContext ctx) {
        String user = ctx.getUserPrincipal() != null ? ctx.getUserPrincipal().getName() : null;
        PlanoTrabalhoDTO updated = service.aprovar(id, payload.motivo, user);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }

    @POST
    @Path("/{id}/reprovar")
    public Response reprovar(@PathParam("id") String id, MotivoPayload payload, @Context SecurityContext ctx) {
        String user = ctx.getUserPrincipal() != null ? ctx.getUserPrincipal().getName() : null;
        PlanoTrabalhoDTO updated = service.reprovar(id, payload.motivo, user);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }

    @POST
    @Path("/{id}/enviar")
    @RolesAllowed({"ADMIN", "GESTOR"})
    public Response enviar(@PathParam("id") String id, @Context SecurityContext ctx) {
        String user = ctx.getUserPrincipal() != null ? ctx.getUserPrincipal().getName() : null;
        try {
            PlanoTrabalhoDTO updated = service.enviarParaAprovacao(id, user);
            if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity(java.util.Map.of("error", e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(java.util.Map.of("error", "Erro interno ao enviar para aprovação: " + e.getMessage())).build();
        }
    }

    @GET
    @Path("/emenda/{emendaId}")
    public Response hasPlanForEmenda(@PathParam("emendaId") String emendaId) {
        try {
            boolean has = service.existsByEmendaId(emendaId);
            return Response.ok(java.util.Map.of("hasPlan", has)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Erro ao verificar emenda: " + e.getMessage()))
                    .build();
        }
    }

    public static class MotivoPayload {
        public String motivo;
    }
}
