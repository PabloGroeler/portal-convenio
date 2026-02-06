package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.DocumentoInstitucionalDTO;
import org.acme.entity.DocumentoInstitucional;
import org.acme.service.DocumentoInstitucionalService;
import org.acme.service.StatusOSCService;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.File;
import java.io.FileInputStream;
import java.util.List;

@Path("/api/documentos-institucionais")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DocumentoInstitucionalResource {

    @Inject
    DocumentoInstitucionalService service;

    @Inject
    StatusOSCService statusOSCService;

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
            try {
                statusOSCService.atualizarStatusAutomatico(idInstituicao);
            } catch (Exception e) {
                // Log mas não falha o upload se der erro na atualização do status
                System.err.println("Erro ao atualizar status da OSC: " + e.getMessage());
            }

            return Response.ok(documento).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Erro ao fazer upload: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") String id) {
        try {
            // Buscar documento antes de deletar para pegar o idInstituicao
            DocumentoInstitucional documento = service.obterDocumento(id);
            String idInstituicao = documento != null ? documento.getIdInstituicao() : null;

            service.deletar(id);

            // RF-02.3 - Atualizar status da OSC automaticamente após deletar documento
            if (idInstituicao != null) {
                try {
                    statusOSCService.atualizarStatusAutomatico(idInstituicao);
                } catch (Exception e) {
                    // Log mas não falha a exclusão se der erro na atualização do status
                    System.err.println("Erro ao atualizar status da OSC: " + e.getMessage());
                }
            }

            return Response.ok().build();
        } catch (Exception e) {
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

    // Classes internas para response
    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}

