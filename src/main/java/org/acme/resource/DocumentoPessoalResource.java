package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import lombok.extern.slf4j.Slf4j;
import org.acme.dto.DocumentoPessoalDTO;
import org.acme.service.DocumentoPessoalService;
import org.jboss.resteasy.reactive.multipart.FileUpload;
import org.jboss.resteasy.reactive.RestForm;

import java.io.*;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Path("/api/documentos-pessoais")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class DocumentoPessoalResource {

    @Inject
    DocumentoPessoalService service;

    @Context
    SecurityContext securityContext;

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Transactional
    public Response upload(
        @RestForm("dirigenteId") String dirigenteId,
        @RestForm("tipoDocumento") String tipoDocumento,
        @RestForm("file") FileUpload file,
        @RestForm("numeroDocumento") String numeroDocumento,
        @RestForm("dataEmissao") String dataEmissao,
        @RestForm("dataValidade") String dataValidade,
        @RestForm("descricao") String descricao
    ) {
        try {
            log.info("📤 Upload request: dirigente={}, tipo={}, file={}",
                     dirigenteId, tipoDocumento, file != null ? file.fileName() : "null");

            if (file == null || file.uploadedFile() == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Arquivo não fornecido"))
                    .build();
            }

            String usuarioUpload = obterUsuarioLogado();

            // Converter strings para LocalDate se fornecidas
            LocalDate dataEmissaoDate = dataEmissao != null && !dataEmissao.isEmpty()
                ? LocalDate.parse(dataEmissao) : null;
            LocalDate dataValidadeDate = dataValidade != null && !dataValidade.isEmpty()
                ? LocalDate.parse(dataValidade) : null;

            InputStream inputStream = Files.newInputStream(file.uploadedFile());

            DocumentoPessoalDTO dto = service.upload(
                dirigenteId,
                tipoDocumento,
                file.fileName(),
                file.contentType(),
                inputStream,
                file.size(),
                usuarioUpload,
                numeroDocumento,
                dataEmissaoDate,
                dataValidadeDate,
                descricao
            );

            return Response.status(Response.Status.CREATED).entity(dto).build();

        } catch (IOException e) {
            log.error("❌ Erro ao fazer upload", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao salvar arquivo: " + e.getMessage()))
                .build();
        } catch (Exception e) {
            log.error("❌ Erro inesperado", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao processar upload: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/dirigente/{dirigenteId}")
    public Response listarPorDirigente(@PathParam("dirigenteId") String dirigenteId) {
        try {
            List<DocumentoPessoalDTO> documentos = service.listarPorDirigente(dirigenteId);
            return Response.ok(documentos).build();
        } catch (Exception e) {
            log.error("❌ Erro ao listar documentos", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/{id}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response download(@PathParam("id") String id) {
        try {
            File file = service.obterArquivo(id);
            return Response.ok(file)
                .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
                .build();
        } catch (FileNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Documento não encontrado"))
                .build();
        } catch (IOException e) {
            log.error("❌ Erro ao baixar documento", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao baixar documento"))
                .build();
        }
    }

    @POST
    @Path("/{id}/aprovar")
    @Transactional
    public Response aprovar(
        @PathParam("id") String id,
        Map<String, String> body
    ) {
        try {
            // Validar se o usuário tem permissão (não pode ser OPERADOR)
            if (isOperador()) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Operadores não têm permissão para aprovar documentos"))
                    .build();
            }

            String observacoes = body != null ? body.get("observacoes") : null;
            String usuario = obterUsuarioLogado();

            DocumentoPessoalDTO dto = service.aprovar(id, observacoes, usuario);
            return Response.ok(dto).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        } catch (Exception e) {
            log.error("❌ Erro ao aprovar documento", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao aprovar documento"))
                .build();
        }
    }

    @POST
    @Path("/{id}/reprovar")
    @Transactional
    public Response reprovar(
        @PathParam("id") String id,
        Map<String, String> body
    ) {
        try {
            // Validar se o usuário tem permissão (não pode ser OPERADOR)
            if (isOperador()) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Operadores não têm permissão para reprovar documentos"))
                    .build();
            }

            String motivo = body != null ? body.get("motivo") : null;
            String usuario = obterUsuarioLogado();

            DocumentoPessoalDTO dto = service.reprovar(id, motivo, usuario);
            return Response.ok(dto).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        } catch (Exception e) {
            log.error("❌ Erro ao reprovar documento", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao reprovar documento"))
                .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response excluir(@PathParam("id") String id) {
        try {
            service.excluir(id);
            return Response.noContent().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", e.getMessage()))
                .build();
        } catch (IOException e) {
            log.error("❌ Erro ao excluir documento", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao excluir documento"))
                .build();
        }
    }

    private String obterUsuarioLogado() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            return securityContext.getUserPrincipal().getName();
        }
        return "system";
    }

    private boolean isOperador() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            try {
                String username = securityContext.getUserPrincipal().getName();
                org.acme.entity.User user = org.acme.entity.User.findByUsername(username);
                if (user != null) {
                    return user.role == org.acme.entity.User.UserRole.OPERADOR;
                }
            } catch (Exception e) {
                log.error("Erro ao verificar role do usuário", e);
            }
        }
        return false;
    }
}
