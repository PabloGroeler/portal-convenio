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
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Emenda;
import org.acme.service.*;
import org.acme.dto.EmendaAcaoDTO;
import org.acme.dto.EmendaHistoricoDTO;
import org.acme.dto.EmendaDetailDTO;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/emendas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmendasResource extends BaseResource {

    private static final Logger LOG = Logger.getLogger(EmendasResource.class);

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

    @Inject
    AuditService auditService;

    @Context
    ContainerRequestContext httpRequest;


    @GET
    public List<Emenda> list() {
        return emendaService.listAll();
    }

    @GET
    @Path("/with-details")
    public List<EmendaDetailDTO> listWithDetails() {
        LOG.info("🔍 GET /api/emendas/with-details - Listing emendas for user: " + getCurrentUser());
        try {
            // Story 4: apply role-based visibility filter
            List<EmendaDetailDTO> result = emendaService.listWithDetailsForUser(getCurrentUser());
            LOG.info("✅ Found " + (result != null ? result.size() : 0) + " emendas for user");
            return result;
        } catch (Exception e) {
            LOG.error("❌ Error listing emendas with details", e);
            throw e;
        }
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
            LOG.info("🔵 POST /api/emendas - Creating new emenda");
            LOG.info("📋 Received emenda data: officialCode=" + emenda.officialCode +
                ", councilorId=" + emenda.councilorId +
                ", institutionId=" + emenda.institutionId +
                ", value=" + emenda.value +
                ", classification=" + emenda.classification);

            // JIRA 9: default/validate status do ciclo de vida
            if (emenda.statusCicloVida == null || emenda.statusCicloVida.isBlank()) {
                emenda.statusCicloVida = "Recebido";
            }
            LOG.info("✅ Status ciclo vida: " + emenda.statusCicloVida);
            statusCicloVidaEmendaService.validateOrThrow(emenda.statusCicloVida);
            emenda.statusCicloVida = statusCicloVidaEmendaService.normalize(emenda.statusCicloVida);

            // JIRA 4: validate tipo de emenda (mapped in 'classification')
            LOG.info("🔍 Validating tipo emenda (classification): " + emenda.classification);
            tipoEmendaService.validateCodigoAtivoOrThrow(emenda.classification);

            // JIRA 6: validate esfera
            LOG.info("🔍 Validating esfera: " + emenda.esfera);
            esferaEmendaService.validateOrThrow(emenda.esfera);
            emenda.esfera = esferaEmendaService.normalize(emenda.esfera);

            // JIRA 7: validate convênio fields
            LOG.info("🔍 Validating convenio: existeConvenio=" + emenda.existeConvenio +
                ", numeroConvenio=" + emenda.numeroConvenio +
                ", anoConvenio=" + emenda.anoConvenio);
            convenioValidationService.validateOrThrow(emenda.existeConvenio, emenda.numeroConvenio, emenda.anoConvenio);
            convenioValidationService.normalize(emenda);

            // JIRA 5: validate business rules per tipo (executed in service)
            LOG.info("✅ All validations passed, creating emenda...");
            Emenda created = emendaService.create(emenda, getCurrentUser());
            LOG.info("✅ Emenda created successfully with id: " + created.id);

            // AUDIT LOG - Criação de emenda
            String currentUser = getCurrentUser();
            auditService.logCreate(
                "Emenda",
                created.id,
                created,
                getCurrentUserId(),
                currentUser != null ? currentUser : "system",
                getClientIP()
            );

            return Response.status(Response.Status.CREATED).entity(EmendaDetailDTO.fromEmenda(created)).build();
        } catch (IllegalArgumentException e) {
            LOG.error("❌ Validation error creating emenda: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        } catch (Exception e) {
            LOG.error("❌ Unexpected error creating emenda", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Erro interno ao criar emenda: " + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Emenda emenda) {
        try {
            // Get old values for audit
            Emenda oldEmenda = emendaService.findById(id);
            if (oldEmenda == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            // Clone for audit before update
            EmendaDetailDTO oldValues = EmendaDetailDTO.fromEmenda(oldEmenda);

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

            // AUDIT LOG - Atualização de emenda
            String currentUser = getCurrentUser();
            auditService.logUpdate(
                "Emenda",
                id,
                oldValues,
                EmendaDetailDTO.fromEmenda(updated),
                getCurrentUserId(),
                currentUser != null ? currentUser : "system",
                getClientIP()
            );

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

        // Get old status for audit
        Emenda oldEmenda = emendaService.findById(id);
        if (oldEmenda == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        String oldStatus = oldEmenda.statusCicloVida;

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

        // AUDIT LOG - Ação na emenda
        String currentUser = getCurrentUser();
        String acaoUpper = acao.acao.toUpperCase();

        if ("APROVAR".equals(acaoUpper)) {
            auditService.logAprovacao(
                "Emenda",
                id,
                acao.observacao,
                getCurrentUserId(),
                currentUser != null ? currentUser : "system",
                getClientIP()
            );
        } else if ("REPROVAR".equals(acaoUpper)) {
            auditService.logReprovacao(
                "Emenda",
                id,
                acao.observacao != null ? acao.observacao : "Sem motivo informado",
                getCurrentUserId(),
                currentUser != null ? currentUser : "system",
                getClientIP()
            );
        } else if ("DEVOLVER".equals(acaoUpper) || "RETIFICAR".equals(acaoUpper)) {
            auditService.logAcao(
                "DEVOLUCAO",
                "Emenda",
                id,
                "Devolvido para retificação: " + (acao.observacao != null ? acao.observacao : ""),
                getCurrentUserId(),
                currentUser != null ? currentUser : "system",
                getClientIP()
            );
        }

        // Log status change if changed
        if (updated.statusCicloVida != null && !updated.statusCicloVida.equals(oldStatus)) {
            auditService.logMudancaStatus(
                "Emenda",
                id,
                oldStatus,
                updated.statusCicloVida,
                getCurrentUserId(),
                currentUser != null ? currentUser : "system",
                getClientIP()
            );
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
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_GATEWAY)
                    .entity("{\"error\": \"Falha ao sincronizar com API externa\", \"details\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }
    }
}
