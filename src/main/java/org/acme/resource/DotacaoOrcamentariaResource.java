package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.DotacaoOrcamentaria;
import org.acme.repository.DotacaoOrcamentariaRepository;
import org.jboss.logging.Logger;
import java.util.List;

@Path("/api/dotacoes-orcamentarias")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DotacaoOrcamentariaResource {

    private static final Logger log = Logger.getLogger(DotacaoOrcamentariaResource.class);

    @Inject DotacaoOrcamentariaRepository repository;

    /** GET /api/dotacoes-orcamentarias/search?codigoReduzido=xxx&dotacao=yyy&limit=20 */
    @GET
    @Path("/search")
    public Response search(
            @QueryParam("codigoReduzido") String codigoReduzido,
            @QueryParam("dotacao")        String dotacao,
            @QueryParam("limit")          @DefaultValue("20") int limit) {
        try {
            List<DotacaoOrcamentaria> results = repository.search(codigoReduzido, dotacao, Math.min(limit, 100));
            return Response.ok(results).build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao buscar dotações");
            return Response.serverError().entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        DotacaoOrcamentaria d = repository.findById(id);
        if (d == null) return Response.status(404).build();
        return Response.ok(d).build();
    }

    @POST
    @jakarta.transaction.Transactional
    public Response create(DotacaoOrcamentaria body) {
        try {
            repository.persist(body);
            return Response.status(201).entity(body).build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao criar dotação");
            return Response.serverError().entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }

    @DELETE
    @Path("/{id}")
    @jakarta.transaction.Transactional
    public Response delete(@PathParam("id") Long id) {
        DotacaoOrcamentaria d = repository.findById(id);
        if (d == null) return Response.status(404).build();
        d.ativo = false;
        repository.persist(d);
        return Response.ok().build();
    }
}

