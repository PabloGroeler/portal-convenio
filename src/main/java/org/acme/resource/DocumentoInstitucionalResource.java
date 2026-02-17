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
import org.acme.entity.User;
import org.acme.service.DocumentoInstitucionalService;
import org.acme.service.StatusOSCService;
import org.acme.service.AuditService;
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

    @Inject
    DocumentoInstitucionalService service;

    @Inject
    StatusOSCService statusOSCService;

    @Inject
    AuditService auditService;

    @Context
    ContainerRequestContext requestContext;

    @Context
    SecurityContext securityContext;

    @GET
    @Path("/instituicao/{idInstituicao}")
    public Response listar(@PathParam("idInstituicao") String idInstituicao) {
        try {
            List<DocumentoInstitucionalDTO> documentos = service.listarPorInstituicao(idInstituicao);
            return Response.ok(documentos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao listar documentos: " + e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @jakarta.transaction.Transactional
    public Response upload(
            @RestForm("file") FileUpload file,
            @RestForm("idInstituicao") String idInstituicao,
            @RestForm("tipoDocumento") String tipoDocumento,
            @RestForm("descricao") String descricao,
            @RestForm("usuarioUpload") String usuarioUpload
    ) {
        try {
            DocumentoInstitucionalDTO documento = service.upload(
                    idInstituicao,
                    file.fileName(),
                    tipoDocumento,
                    file.contentType(),
                    descricao,
                    new FileInputStream(file.uploadedFile().toFile()),
                    file.size(),
                    usuarioUpload
            );

            // RF-02.3 - Atualizar status da OSC automaticamente após upload
            statusOSCService.atualizarStatusAutomatico(idInstituicao);

            // AUDIT LOG - Upload de documento (só registra se tudo foi bem)
            auditService.logUpload(
                tipoDocumento,
                file.fileName(),
                file.size(),
                getCurrentUserId(),
                getCurrentUserName(),
                getClientIP()
            );

            return Response.ok(documento).build();
        } catch (Exception e) {
            log.error("Erro ao fazer upload", e);
            // Transaction será revertida automaticamente, incluindo o audit log
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao fazer upload: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @jakarta.transaction.Transactional
    public Response deletar(@PathParam("id") String id) {
        try {
            // Buscar documento antes de deletar para pegar o idInstituicao e fazer audit
            DocumentoInstitucional documento = service.obterDocumento(id);
            String idInstituicao = documento != null ? documento.getIdInstituicao() : null;

            service.deletar(id);

            // RF-02.3 - Atualizar status da OSC automaticamente após deletar documento
            if (idInstituicao != null) {
                statusOSCService.atualizarStatusAutomatico(idInstituicao);
            }

            // AUDIT LOG - Deletar documento (só registra se tudo foi bem)
            if (documento != null) {
                auditService.logDelete(
                    "DocumentoInstitucional",
                    id,
                    documento,
                    getCurrentUserId(),
                    getCurrentUserName(),
                    getClientIP()
                );
            }

            return Response.ok().build();
        } catch (Exception e) {
            log.error("Erro ao deletar documento", e);
            // Transaction será revertida automaticamente, incluindo o audit log
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao deletar documento: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{id}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response download(@PathParam("id") String id) {
        try {
            File file = service.obterArquivo(id);
            if (file == null || !file.exists()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("Arquivo não encontrado"))
                        .build();
            }

            DocumentoInstitucional documento = service.obterDocumento(id);

            // AUDIT LOG - Download de documento
            if (documento != null) {
                auditService.logDownload(
                    documento.getTipoDocumento(),
                    documento.getNomeArquivo(),
                    getCurrentUserId(),
                    getCurrentUserName(),
                    getClientIP()
                );
            }

            return Response.ok(file)
                    .header("Content-Disposition", "attachment; filename=\"" + documento.getNomeOriginal() + "\"")
                    .header("Content-Type", documento.getTipoMime())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao baixar arquivo: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{id}/view")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response view(@PathParam("id") String id) {
        try {
            File file = service.obterArquivo(id);
            if (file == null || !file.exists()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("Arquivo não encontrado"))
                        .build();
            }

            DocumentoInstitucional documento = service.obterDocumento(id);

            // Use "inline" para visualizar no navegador em vez de forçar download
            return Response.ok(file)
                    .header("Content-Disposition", "inline; filename=\"" + documento.getNomeOriginal() + "\"")
                    .header("Content-Type", documento.getTipoMime())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao visualizar arquivo: " + e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/aprovar")
    @jakarta.transaction.Transactional
    public Response aprovar(@PathParam("id") String id, AprovarRequest request) {
        try {
            DocumentoInstitucional documento = service.obterDocumento(id);
            if (documento == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("Documento não encontrado"))
                        .build();
            }

            String idInstituicao = documento.getIdInstituicao();
            DocumentoInstitucionalDTO result = service.aprovarDocumento(id, request.observacoes);

            // RF-02.3 - Atualizar status da OSC automaticamente após aprovação
            statusOSCService.atualizarStatusAutomatico(idInstituicao);

            // AUDIT LOG - Aprovação de documento (só registra se tudo foi bem)
            auditService.logAprovacao(
                "DocumentoInstitucional",
                id,
                request.observacoes,
                getCurrentUserId(),
                getCurrentUserName(),
                getClientIP()
            );

            return Response.ok(result).build();
        } catch (Exception e) {
            log.error("Erro ao aprovar documento", e);
            // Transaction será revertida automaticamente, incluindo o audit log
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao aprovar documento: " + e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/reprovar")
    @jakarta.transaction.Transactional
    public Response reprovar(@PathParam("id") String id, ReprovarRequest request) {
        try {
            if (request.motivo == null || request.motivo.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse("Motivo da reprovação é obrigatório"))
                        .build();
            }

            DocumentoInstitucional documento = service.obterDocumento(id);
            if (documento == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("Documento não encontrado"))
                        .build();
            }

            String idInstituicao = documento.getIdInstituicao();
            DocumentoInstitucionalDTO result = service.reprovarDocumento(id, request.motivo);

            // RF-02.3 - Atualizar status da OSC automaticamente após reprovação
            statusOSCService.atualizarStatusAutomatico(idInstituicao);

            // AUDIT LOG - Reprovação de documento (só registra se tudo foi bem)
            auditService.logReprovacao(
                "DocumentoInstitucional",
                id,
                request.motivo,
                getCurrentUserId(),
                getCurrentUserName(),
                getClientIP()
            );

            return Response.ok(result).build();
        } catch (Exception e) {
            log.error("Erro ao reprovar documento", e);
            // Transaction será revertida automaticamente, incluindo o audit log
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao reprovar documento: " + e.getMessage()))
                    .build();
        }
    }

    // Classes internas para request e response
    public static class AprovarRequest {
        public String observacoes;
    }

    public static class ReprovarRequest {
        public String motivo;
    }

    // Classes internas para response
    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }

    private Long getCurrentUserId() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            try {
                String username = securityContext.getUserPrincipal().getName();
                User user = User.find("username", username).firstResult();
                return user != null ? user.id : null;
            } catch (Exception e) {
                log.warn("Error getting current user ID: " + e.getMessage());
            }
        }
        return null;
    }

    private String getCurrentUserName() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            try {
                return securityContext.getUserPrincipal().getName();
            } catch (Exception e) {
                log.warn("Error getting current user name: " + e.getMessage());
            }
        }
        return "system";
    }

    private String getClientIP() {
        if (requestContext == null) {
            return "unknown";
        }
        String ip = requestContext.getHeaderString("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = requestContext.getHeaderString("X-Real-IP");
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null && !ip.isEmpty() ? ip : "unknown";
    }
}

