package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.AtivoDTO;
import org.acme.entity.SecretariaMunicipal;
import org.acme.service.SecretariaMunicipalService;

import java.util.List;

@Path("/api/secretarias-municipais")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SecretariasMunicipaisResource {

    @Inject
    SecretariaMunicipalService service;

    private Response badRequest(String msg) {
        return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\": \"" + msg.replace("\"", "\\\"") + "\"}")
                .build();
    }

    @GET
    public List<SecretariaMunicipal> list() {
        return service.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        SecretariaMunicipal s = service.findById(id);
        if (s == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(s).build();
    }

    @POST
    public Response create(SecretariaMunicipal s) {
        if (s == null) return badRequest("Payload inválido");
        if (s.nome == null || s.nome.isBlank()) return badRequest("Nome é obrigatório");
        if (s.nome.length() > 200) return badRequest("Nome deve ter no máximo 200 caracteres");
        SecretariaMunicipal created = service.create(s);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, SecretariaMunicipal s) {
        if (s == null) return badRequest("Payload inválido");
        if (s.nome == null || s.nome.isBlank()) return badRequest("Nome é obrigatório");
        if (s.nome.length() > 200) return badRequest("Nome deve ter no máximo 200 caracteres");
        SecretariaMunicipal updated = service.update(id, s);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }

    @PATCH
    @Path("/{id}/ativo")
    public Response setAtivo(@PathParam("id") Long id, AtivoDTO body) {
        if (body == null) return badRequest("Payload inválido");
        SecretariaMunicipal updated = service.setAtivo(id, body.ativo);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }
}
