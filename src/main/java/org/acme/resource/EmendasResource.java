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
import org.acme.service.EmendaExternalSyncService;
import org.acme.service.EmendaImportService;
import org.acme.service.TipoEmendaService;
import org.acme.service.EsferaEmendaService;
import org.acme.service.ConvenioValidationService;
import org.acme.service.StatusCicloVidaEmendaService;

import java.util.List;

@Path("/api/emendas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmendasResource {

    @Inject
    EmendaService emendaService;

    @Inject
    EmendaExternalSyncService externalSyncService;

    @Inject
    TipoEmendaService tipoEmendaService;

    @Inject
    EsferaEmendaService esferaEmendaService;

    @Inject
    ConvenioValidationService convenioValidationService;

    @Inject
    StatusCicloVidaEmendaService statusCicloVidaEmendaService;

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
        try {
            // JIRA 9: default/validate status do ciclo de vida
            if (emenda.statusCicloVida == null || emenda.statusCicloVida.isBlank()) {
                emenda.statusCicloVida = "Recebido";
            }
            statusCicloVidaEmendaService.validateOrThrow(emenda.statusCicloVida);
            emenda.statusCicloVida = statusCicloVidaEmendaService.normalize(emenda.statusCicloVida);

            // JIRA 4: validate tipo de emenda (mapped in 'classification')
            tipoEmendaService.validateCodigoAtivoOrThrow(emenda.classification);

            // JIRA 6: validate esfera
            esferaEmendaService.validateOrThrow(emenda.esfera);
            emenda.esfera = esferaEmendaService.normalize(emenda.esfera);

            // JIRA 7: validate convênio fields
            convenioValidationService.validateOrThrow(emenda.existeConvenio, emenda.numeroConvenio, emenda.anoConvenio);
            convenioValidationService.normalize(emenda);

            // JIRA 5: validate business rules per tipo (executed in service)
            Emenda created = emendaService.create(emenda, getCurrentUser());
            return Response.status(Response.Status.CREATED).entity(EmendaDetailDTO.fromEmenda(created)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Emenda emenda) {
        try {
            // JIRA 9: default/validate status do ciclo de vida
            if (emenda.statusCicloVida == null || emenda.statusCicloVida.isBlank()) {
                emenda.statusCicloVida = "Recebido";
            }
            statusCicloVidaEmendaService.validateOrThrow(emenda.statusCicloVida);
            emenda.statusCicloVida = statusCicloVidaEmendaService.normalize(emenda.statusCicloVida);

            // JIRA 4: validate tipo de emenda (mapped in 'classification')
            tipoEmendaService.validateCodigoAtivoOrThrow(emenda.classification);

            // JIRA 6: validate esfera
            esferaEmendaService.validateOrThrow(emenda.esfera);
            emenda.esfera = esferaEmendaService.normalize(emenda.esfera);

            // JIRA 7: validate convênio fields
            convenioValidationService.validateOrThrow(emenda.existeConvenio, emenda.numeroConvenio, emenda.anoConvenio);
            convenioValidationService.normalize(emenda);

            // JIRA 5: validate business rules per tipo (executed in service)
            Emenda updated = emendaService.update(id, emenda, getCurrentUser());
            if (updated == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(EmendaDetailDTO.fromEmenda(updated)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
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

        Emenda updated;
        try {
            updated = emendaService.executarAcao(id, acao);
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(EmendaDetailDTO.fromEmenda(updated)).build();
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

    @POST
    @Path("/sync-external")
    public Response syncExternal() {
        try {
            EmendaImportService.ImportSummary summary = externalSyncService.syncNow(getCurrentUser());
            return Response.ok(summary).build();
        } catch (IllegalStateException e) {
            // e.g. missing external token
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        } catch (Exception e) {
            // Propagate a helpful error (external 401, parsing, etc.)
            return Response.status(Response.Status.BAD_GATEWAY)
                    .entity("{\"error\": \"Falha ao sincronizar com API externa\", \"details\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
    }
}
