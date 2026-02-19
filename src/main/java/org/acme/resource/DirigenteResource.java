package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.acme.dto.DirigenteDTO;
import org.acme.service.DirigenteService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/dirigentes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class DirigenteResource {

    @Inject
    DirigenteService dirigenteService;

    @POST
    public Response criar(DirigenteDTO dto) {
        try {
            log.info("POST /api/dirigentes - Criando dirigente: {}", dto.getNomeCompleto());

            if (dto.getInstituicaoId() == null || dto.getInstituicaoId().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "ID da instituição é obrigatório"))
                        .build();
            }

            var dirigente = dirigenteService.criarDirigente(dto);
            var result = dirigenteService.buscarPorId(dirigente.getId());
            return Response.status(Response.Status.CREATED).entity(result).build();
        } catch (Exception e) {
            log.error("Erro ao criar dirigente: {}", e.getMessage(), e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/instituicao/{instituicaoId}")
    public Response listarPorInstituicao(@PathParam("instituicaoId") String instituicaoId,
                                         @QueryParam("apenasAtivos") @DefaultValue("false") boolean apenasAtivos) {
        try {
            log.info("GET /api/dirigentes/instituicao/{} - apenasAtivos: {}", instituicaoId, apenasAtivos);

            if (instituicaoId == null || instituicaoId.trim().isEmpty()) {
                log.error("ID da instituição é nulo ou vazio");
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "ID da instituição é obrigatório"))
                        .build();
            }

            List<DirigenteDTO> dirigentes = apenasAtivos
                ? dirigenteService.listarAtivosPorInstituicao(instituicaoId)
                : dirigenteService.listarPorInstituicao(instituicaoId);

            log.info("Encontrados {} dirigentes para instituição {}", dirigentes.size(), instituicaoId);
            return Response.ok(dirigentes).build();
        } catch (Exception e) {
            log.error("Erro ao listar dirigentes da instituição {}: {}", instituicaoId, e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erro ao carregar lista de dirigentes: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") String id) {
        try {
            log.info("GET /api/dirigentes/{}", id);

            if (id == null || id.trim().isEmpty()) {
                log.error("ID do dirigente é nulo ou vazio");
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "ID do dirigente é obrigatório"))
                        .build();
            }

            DirigenteDTO dirigente = dirigenteService.buscarPorId(id);
            if (dirigente == null) {
                log.warn("Dirigente não encontrado com ID: {}", id);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Dirigente não encontrado com ID: " + id))
                        .build();
            }

            log.info("Dirigente encontrado: {}", dirigente.getNomeCompleto());
            return Response.ok(dirigente).build();
        } catch (Exception e) {
            log.error("Erro ao buscar dirigente ID {}: {}", id, e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erro ao carregar dados do dirigente: " + e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response atualizar(@PathParam("id") String id, DirigenteDTO dto) {
        try {
            log.info("PUT /api/dirigentes/{} - Atualizando dirigente", id);

            var dirigente = dirigenteService.atualizarDirigente(id, dto);
            var result = dirigenteService.buscarPorId(dirigente.getId());
            return Response.ok(result).build();
        } catch (Exception e) {
            log.error("Erro ao atualizar dirigente: {}", e.getMessage(), e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/inativar")
    public Response inativar(@PathParam("id") String id, Map<String, String> payload) {
        try {
            log.info("POST /api/dirigentes/{}/inativar", id);

            String dataTerminoStr = payload.get("dataTermino");
            String motivo = payload.get("motivo");

            if (dataTerminoStr == null || dataTerminoStr.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Data de término é obrigatória"))
                        .build();
            }

            if (motivo == null || motivo.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Motivo da inativação é obrigatório"))
                        .build();
            }

            LocalDate dataTermino = LocalDate.parse(dataTerminoStr);
            dirigenteService.inativarDirigente(id, dataTermino, motivo);

            return Response.ok(Map.of("message", "Dirigente inativado com sucesso")).build();
        } catch (Exception e) {
            log.error("Erro ao inativar dirigente: {}", e.getMessage(), e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/instituicao/{instituicaoId}/avisos")
    public Response verificarCargosObrigatorios(@PathParam("instituicaoId") String instituicaoId) {
        try {
            log.info("GET /api/dirigentes/instituicao/{}/avisos", instituicaoId);

            List<String> avisos = dirigenteService.verificarCargosObrigatorios(instituicaoId);

            Map<String, Object> response = new HashMap<>();
            response.put("avisos", avisos);
            response.put("temAvisos", !avisos.isEmpty());

            return Response.ok(response).build();
        } catch (Exception e) {
            log.error("Erro ao verificar cargos obrigatórios: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}

