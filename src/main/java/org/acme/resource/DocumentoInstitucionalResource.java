package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.dto.DocumentoInstitucionalDTO;
import org.acme.entity.DocumentoInstitucional;
import org.acme.service.DocumentoInstitucionalService;
import org.acme.service.StatusOSCService;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.File;
import java.io.FileInputStream;
import java.util.List;

@Path("/api/documentos-institucionais")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DocumentoInstitucionalResource {

    private static final Logger log = Logger.getLogger(DocumentoInstitucionalResource.class);

    @Inject DocumentoInstitucionalService service;
    @Inject StatusOSCService statusOSCService;

    @Context ContainerRequestContext requestContext;
    @Context SecurityContext securityContext;

    // ── LIST ─────────────────────────────────────────────────────────────────

    @GET
    @Path("/instituicao/{idInstituicao}")
    public Response listar(@PathParam("idInstituicao") String idInstituicao) {
        try {
            List<DocumentoInstitucionalDTO> docs = service.listarPorInstituicao(idInstituicao);
            return Response.ok(docs).build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao listar documentos da instituição %s", idInstituicao);
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── UPLOAD ────────────────────────────────────────────────────────────────

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response upload(
            @RestForm("file")          FileUpload file,
            @RestForm("idInstituicao") String idInstituicao,
            @RestForm("tipoDocumento") String tipoDocumento,
            @RestForm("descricao")     String descricao,
            @RestForm("usuarioUpload") String usuarioUpload
    ) {
        try {
            log.infof("📤 Upload: instituicao=%s tipo=%s arquivo=%s size=%d",
                    idInstituicao, tipoDocumento, file.fileName(), file.size());

            DocumentoInstitucionalDTO doc = service.upload(
                    idInstituicao,
                    file.fileName(),
                    tipoDocumento,
                    file.contentType(),
                    descricao,
                    new FileInputStream(file.uploadedFile().toFile()),
                    file.size(),
                    usuarioUpload
            );

            statusOSCService.atualizarStatusAutomatico(idInstituicao);
            return Response.ok(doc).build();
        } catch (Exception e) {
            log.errorf(e, "❌ Erro no upload");
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── VIEW (inline) ────────────────────────────────────────────────────────

    @GET
    @Path("/{id}/view")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response view(@PathParam("id") String id) {
        try {
            File file = service.obterArquivo(id);
            if (file == null || !file.exists()) {
                log.warnf("Arquivo não encontrado para documento %s", id);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new Err("Arquivo não encontrado")).build();
            }
            DocumentoInstitucional doc = service.obterDocumento(id);
            return Response.ok(file)
                    .header("Content-Disposition", "inline; filename=\"" + doc.getNomeOriginal() + "\"")
                    .header("Content-Type", doc.getTipoMime())
                    .build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao visualizar documento %s", id);
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── DOWNLOAD ─────────────────────────────────────────────────────────────

    @GET
    @Path("/{id}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response download(@PathParam("id") String id) {
        try {
            File file = service.obterArquivo(id);
            if (file == null || !file.exists()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new Err("Arquivo não encontrado")).build();
            }
            DocumentoInstitucional doc = service.obterDocumento(id);
            return Response.ok(file)
                    .header("Content-Disposition", "attachment; filename=\"" + doc.getNomeOriginal() + "\"")
                    .header("Content-Type", doc.getTipoMime())
                    .build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao baixar documento %s", id);
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") String id) {
        try {
            DocumentoInstitucional doc = service.obterDocumento(id);
            String idInstituicao = doc != null ? doc.getIdInstituicao() : null;
            service.deletar(id);
            if (idInstituicao != null) statusOSCService.atualizarStatusAutomatico(idInstituicao);
            return Response.ok().build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao deletar documento %s", id);
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── APPROVE ───────────────────────────────────────────────────────────────

    @POST
    @Path("/{id}/aprovar")
    public Response aprovar(@PathParam("id") String id, AprovarReq req) {
        try {
            DocumentoInstitucional doc = service.obterDocumento(id);
            if (doc == null) return Response.status(404).entity(new Err("Documento não encontrado")).build();
            DocumentoInstitucionalDTO result = service.aprovarDocumento(id, req != null ? req.observacoes : null);
            statusOSCService.atualizarStatusAutomatico(doc.getIdInstituicao());
            return Response.ok(result).build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao aprovar documento %s", id);
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── REJECT ────────────────────────────────────────────────────────────────

    @POST
    @Path("/{id}/reprovar")
    public Response reprovar(@PathParam("id") String id, ReprovarReq req) {
        try {
            if (req == null || req.motivo == null || req.motivo.isBlank())
                return Response.status(400).entity(new Err("Motivo é obrigatório")).build();
            DocumentoInstitucional doc = service.obterDocumento(id);
            if (doc == null) return Response.status(404).entity(new Err("Documento não encontrado")).build();
            DocumentoInstitucionalDTO result = service.reprovarDocumento(id, req.motivo);
            statusOSCService.atualizarStatusAutomatico(doc.getIdInstituicao());
            return Response.ok(result).build();
        } catch (Exception e) {
            log.errorf(e, "Erro ao reprovar documento %s", id);
            return Response.serverError().entity(new Err(e.getMessage())).build();
        }
    }

    // ── INNER CLASSES ─────────────────────────────────────────────────────────

    public static class AprovarReq  { public String observacoes; }
    public static class ReprovarReq { public String motivo; }
    public static class Err         { public String error; public Err(String e) { this.error = e; } }
}

