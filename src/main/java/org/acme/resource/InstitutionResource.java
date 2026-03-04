package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.acme.dto.AlterarStatusDTO;
import org.acme.dto.StatusCalculadoDTO;
import org.acme.entity.Institution;
import org.acme.entity.StatusHistorico;
import org.acme.entity.StatusOSC;
import org.acme.entity.User;
import org.acme.entity.UsuarioInstituicao;
import org.acme.repository.InstitutionRepository;
import org.acme.service.InstitutionService;
import org.acme.service.StatusOSCService;
import org.acme.service.AuditService;

import java.util.List;
import java.util.Map;

@Path("/api/institutions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class InstitutionResource extends BaseResource {

    @Inject
    InstitutionService institutionService;

    @Inject
    InstitutionRepository institutionRepository;

    @Inject
    StatusOSCService statusOSCService;

    @Inject
    AuditService auditService;

    @Context
    ContainerRequestContext requestContext;


    private Response badRequest(String msg) {
        return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\": \"" + msg.replace("\"", "\\\"") + "\"}")
                .build();
    }

    private static String onlyDigits(String s) {
        return s == null ? null : s.replaceAll("\\D", "");
    }

    @GET
    public List<Institution> list() {
        return institutionService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        Institution institution = institutionService.findById(id);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(institution).build();
    }

    @GET
    @Path("/by-institution-id/{institutionId}")
    public Response getByInstitutionId(@PathParam("institutionId") String institutionId) {
        Institution institution = institutionService.findByInstitutionId(institutionId);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(institution).build();
    }

    @GET
    @Path("/by-cnpj/{cnpj}")
    public Response getByCnpj(@PathParam("cnpj") String cnpj) {
        // Remove formatting and keep only digits
        String cleanCnpj = onlyDigits(cnpj);

        if (cleanCnpj == null || cleanCnpj.length() != 14) {
            return badRequest("CNPJ inválido - deve conter 14 dígitos");
        }

        Institution institution = institutionService.findByCnpj(cleanCnpj);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Instituição não encontrada com este CNPJ\"}")
                    .build();
        }
        return Response.ok(institution).build();
    }

    @POST
    @Transactional
    // TODO: Adicionar @RolesAllowed quando JWT estiver configurado
    public Response create(Institution institution, @HeaderParam("Authorization") String authHeader) {
        log.info("🔵 CREATE/UPDATE INSTITUTION - CNPJ: {}", institution.cnpj);

        if (institution == null) {
            return badRequest("Payload inválido");
        }

        // Normalizar campos
        institution.cnpj = onlyDigits(institution.cnpj);
        institution.cep = onlyDigits(institution.cep);

        // Validações obrigatórias
        if (institution.razaoSocial == null || institution.razaoSocial.isBlank()) return badRequest("Razão Social é obrigatória");
        if (institution.razaoSocial.length() > 200) return badRequest("Razão Social deve ter no máximo 200 caracteres");
        if (institution.nomeFantasia != null && institution.nomeFantasia.length() > 200) return badRequest("Nome Fantasia deve ter no máximo 200 caracteres");
        if (institution.cnpj == null || institution.cnpj.length() != 14) return badRequest("CNPJ inválido - deve conter 14 dígitos");
        if (institution.inscricaoMunicipal == null || institution.inscricaoMunicipal.isBlank()) return badRequest("Inscrição Municipal é obrigatória");
        if (institution.inscricaoMunicipal.length() > 20) return badRequest("Inscrição Municipal deve ter no máximo 20 caracteres");
        if (institution.inscricaoEstadual != null && institution.inscricaoEstadual.length() > 20) return badRequest("Inscrição Estadual deve ter no máximo 20 caracteres");

        if (institution.telefone == null || institution.telefone.isBlank()) return badRequest("Telefone é obrigatório");
        if (institution.emailInstitucional == null || institution.emailInstitucional.isBlank()) return badRequest("E-mail institucional é obrigatório");
        if (institution.cep == null || institution.cep.length() != 8) return badRequest("CEP inválido");
        if (institution.logradouro == null || institution.logradouro.isBlank()) return badRequest("Logradouro é obrigatório");
        if (institution.numero == null || institution.numero.isBlank()) return badRequest("Número é obrigatório");
        if (institution.bairro == null || institution.bairro.isBlank()) return badRequest("Bairro é obrigatório");
        if (institution.cidade == null || institution.cidade.isBlank()) return badRequest("Cidade é obrigatória");
        if (institution.uf == null || institution.uf.isBlank()) return badRequest("UF é obrigatória");
        if (institution.numeroRegistroConselhoMunicipal == null || institution.numeroRegistroConselhoMunicipal.isBlank()) return badRequest("Número de Registro no Conselho Municipal é obrigatório");

        // Usar createOrUpdate: cria nova instituição OU atualiza existente se CNPJ já existe
        Institution result;
        boolean isUpdate = false;

        try {
            Institution existing = institutionService.findByCnpj(institution.cnpj);
            isUpdate = (existing != null);

            result = institutionService.createOrUpdate(institution);

            log.info("✅ Instituição {} - ID: {}, CNPJ: {}",
                     isUpdate ? "ATUALIZADA" : "CRIADA",
                     result.institutionId,
                     result.cnpj);
        } catch (Exception e) {
            log.error("❌ Erro ao criar/atualizar instituição: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}")
                    .build();
        }

        // Vincular usuário à instituição (se autenticado)
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                io.jsonwebtoken.Claims claims = jwtUtil.parseToken(token);
                String username = claims.getSubject();
                User user = User.findByUsername(username);

                if (user != null) {
                    UsuarioInstituicao vinculoExistente = UsuarioInstituicao.findByUsuarioAndInstituicao(
                        user.id, result.institutionId
                    );

                    if (vinculoExistente == null) {
                        UsuarioInstituicao novoVinculo = new UsuarioInstituicao();
                        novoVinculo.usuarioId = user.id;
                        novoVinculo.instituicaoId = result.institutionId;
                        novoVinculo.persist();
                        log.info("✅ Vínculo criado: usuário {} → instituição {}", user.username, result.institutionId);
                    } else {
                        log.info("ℹ️ Vínculo já existe: usuário {} → instituição {}", user.username, result.institutionId);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Erro ao vincular usuário: {}", e.getMessage());
        }

        // Registrar auditoria
        if (isUpdate) {
            auditService.logUpdate(
                "Institution",
                result.institutionId,
                null,
                result,
                getCurrentUserId(),
                getCurrentUser(),
                getClientIP()
            );
        } else {
            auditService.logCreate("Institution", result.institutionId, result,
                getCurrentUserId(), getCurrentUser(), getClientIP());
        }

        // Retornar resposta apropriada
        return isUpdate
            ? Response.ok(result).build()
            : Response.status(Response.Status.CREATED).entity(result).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") String id, Institution institution, @HeaderParam("Authorization") String authHeader) {
        log.info("🔧 PUT /api/institutions/{} - Atualizando instituição", id);

        // Get old values for audit
        Institution oldInstitution = institutionService.findById(id);
        if (oldInstitution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Institution updated = institutionService.update(id, institution);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // AUDIT LOG - Atualização de instituição
        auditService.logUpdate(
            "Institution",
            id,
            oldInstitution,
            updated,
            getCurrentUserId(),
            getCurrentUser(),
            getClientIP()
        );

        // IMPORTANTE: Vincular usuário logado à instituição atualizada
        // Isso é necessário quando o usuário busca por CNPJ e edita uma instituição existente
        try {
            log.info("🔗 Tentando vincular usuário à instituição após UPDATE...");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("⚠️ Nenhum token JWT fornecido no header Authorization");
                return Response.ok(updated).build();
            }

            String token = authHeader.substring(7);
            io.jsonwebtoken.Claims claims = jwtUtil.parseToken(token);
            String username = claims.getSubject();
            log.info("Username extraído do token: '{}'", username);

            User user = User.findByUsername(username);
            if (user == null) {
                log.warn("⚠️ Usuário '{}' não encontrado", username);
                return Response.ok(updated).build();
            }

            log.info("✅ Usuário encontrado: {} (ID: {})", user.username, user.id);

            // Verificar se vínculo já existe
            UsuarioInstituicao vinculoExistente = UsuarioInstituicao.findByUsuarioAndInstituicao(
                user.id, updated.institutionId
            );

            if (vinculoExistente != null) {
                log.info("ℹ️ Vínculo já existe entre usuário {} e instituição {}", user.username, updated.institutionId);
            } else {
                // Criar novo vínculo
                UsuarioInstituicao novoVinculo = new UsuarioInstituicao();
                novoVinculo.usuarioId = user.id;
                novoVinculo.instituicaoId = updated.institutionId;
                novoVinculo.persist();
                log.info("✅ Vínculo criado com sucesso: usuário {} → instituição {}", user.username, updated.institutionId);
            }

        } catch (Exception e) {
            log.warn("⚠️ Erro ao vincular usuário na atualização: {}", e.getMessage());
            // Não bloqueia o UPDATE - retorna sucesso mesmo se vinculação falhar
        }

        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean deleted = institutionService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }

    // ===== RF-02.3 - Endpoints de Status da OSC =====

    /**
     * Alterar status manualmente
     */
    @POST
    @Path("/{id}/status")
    @Transactional
    public Response alterarStatus(@PathParam("id") String id, AlterarStatusDTO dto) {
        try {
            // Get old status for audit
            Institution old = institutionRepository.findById(id);
            StatusOSC oldStatus = old != null ? old.statusOSC : null;

            log.info("Alterando status da instituição {} para {}", id, dto.getNovoStatus());
            Institution instituicao = statusOSCService.alterarStatus(id, dto);

            // AUDIT LOG - Mudança de status
            if (oldStatus != instituicao.statusOSC) {
                auditService.logMudancaStatus(
                    "Institution",
                    id,
                    oldStatus != null ? oldStatus.name() : "NONE",
                    instituicao.statusOSC != null ? instituicao.statusOSC.name() : "NONE",
                    getCurrentUserId(),
                    getCurrentUser(),
                    getClientIP()
                );
            }

            return Response.ok(instituicao).build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao alterar status: {}", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    /**
     * Calcular status automático sem persistir
     */
    @GET
    @Path("/{id}/calcular-status")
    public Response calcularStatus(@PathParam("id") String id) {
        Institution instituicao = institutionRepository.findById(id);
        if (instituicao == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Instituição não encontrada"))
                .build();
        }

        StatusOSC statusAtual = instituicao.statusOSC != null ? instituicao.statusOSC : StatusOSC.EM_CADASTRO;
        StatusOSC statusCalculado = statusOSCService.calcularStatusAutomatico(instituicao);
        boolean mudou = statusAtual != statusCalculado;

        log.debug("Status calculado para {}: atual={}, calculado={}, mudou={}",
                  id, statusAtual, statusCalculado, mudou);

        return Response.ok(new StatusCalculadoDTO(statusCalculado, mudou)).build();
    }

    /**
     * Obter histórico de alterações de status
     */
    @GET
    @Path("/{id}/historico-status")
    public Response getHistoricoStatus(@PathParam("id") String id) {
        Institution instituicao = institutionRepository.findById(id);
        if (instituicao == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Instituição não encontrada"))
                .build();
        }

        List<StatusHistorico> historico = statusOSCService.buscarHistorico(id);
        return Response.ok(historico).build();
    }

    /**
     * Forçar recálculo e atualização automática do status
     */
    @POST
    @Path("/{id}/atualizar-status")
    @Transactional
    public Response atualizarStatusAutomatico(@PathParam("id") String id) {
        Institution instituicao = institutionRepository.findById(id);
        if (instituicao == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Instituição não encontrada"))
                .build();
        }

        StatusOSC statusAnterior = instituicao.statusOSC != null ? instituicao.statusOSC : StatusOSC.EM_CADASTRO;
        statusOSCService.atualizarStatusAutomatico(id);

        // Recarregar para pegar o status atualizado
        instituicao = institutionRepository.findById(id);
        StatusOSC statusNovo = instituicao.statusOSC;

        return Response.ok(Map.of(
            "statusAnterior", statusAnterior,
            "statusNovo", statusNovo,
            "mudou", statusAnterior != statusNovo
        )).build();
    }

    /**
     * Endpoint específico para vincular usuário logado à instituição
     * Evita problemas de validação ao fazer UPDATE parcial
     */
    @POST
    @Path("/{id}/vincular")
    @Transactional
    public Response vincularUsuario(@PathParam("id") String id, @HeaderParam("Authorization") String authHeader) {
        log.info("🔗 POST /api/institutions/{}/vincular - Vinculando usuário", id);

        // Verificar se instituição existe
        Institution institution = institutionRepository.findById(id);
        if (institution == null) {
            log.warn("❌ Instituição {} não encontrada", id);
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Instituição não encontrada"))
                .build();
        }

        // Verificar token JWT
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("❌ Token JWT não fornecido");
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "Token não fornecido"))
                .build();
        }

        try {
            String token = authHeader.substring(7);
            io.jsonwebtoken.Claims claims = jwtUtil.parseToken(token);
            String username = claims.getSubject();
            log.info("👤 Username extraído do token: '{}'", username);

            User user = User.findByUsername(username);
            if (user == null) {
                log.warn("❌ Usuário '{}' não encontrado", username);
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Usuário não encontrado"))
                    .build();
            }

            log.info("✅ Usuário encontrado: {} (ID: {})", user.username, user.id);

            // Verificar se vínculo já existe
            UsuarioInstituicao vinculoExistente = UsuarioInstituicao.findByUsuarioAndInstituicao(
                user.id, institution.institutionId
            );

            if (vinculoExistente != null) {
                log.info("ℹ️ Vínculo já existe entre usuário {} e instituição {}", user.username, institution.institutionId);
                return Response.ok(Map.of(
                    "message", "Vínculo já existe",
                    "usuario", user.username,
                    "instituicao", institution.razaoSocial
                )).build();
            }

            // Criar novo vínculo
            UsuarioInstituicao novoVinculo = new UsuarioInstituicao();
            novoVinculo.usuarioId = user.id;
            novoVinculo.instituicaoId = institution.institutionId;
            novoVinculo.persist();

            log.info("✅ Vínculo criado com sucesso: usuário {} → instituição {}", user.username, institution.institutionId);

            // AUDIT LOG - Vinculação
            auditService.logAcao(
                "VINCULACAO_USUARIO",
                "Institution",
                institution.institutionId,
                "Usuário " + user.username + " vinculado à instituição " + institution.razaoSocial,
                user.id,
                user.username,
                getClientIP()
            );

            return Response.ok(Map.of(
                "message", "Vínculo criado com sucesso",
                "usuario", user.username,
                "instituicao", institution.razaoSocial
            )).build();

        } catch (Exception e) {
            log.error("❌ Erro ao vincular usuário: {}", e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Erro ao vincular usuário: " + e.getMessage()))
                .build();
        }
    }


    // ===== Endpoints de Aprovação da Instituição =====

    @POST
    @Path("/{id}/aprovar")
    @Transactional
    public Response aprovarInstituicao(@PathParam("id") String id, Map<String, String> body) {
        try {
            String observacoes = body != null ? body.get("observacoes") : null;
            Institution instituicao = statusOSCService.aprovarInstituicao(id, observacoes);

            // AUDIT LOG
            auditService.logAprovacao(
                "Institution",
                id,
                observacoes,
                getCurrentUserId(),
                getCurrentUser(),
                getClientIP()
            );

            log.info("✅ Instituição aprovada: {} por {}", id, getCurrentUser());
            return Response.ok(instituicao).build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("❌ Erro ao aprovar instituição: {}", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            log.error("💥 Erro inesperado ao aprovar instituição", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erro interno ao aprovar instituição"))
                    .build();
        }
    }

    @POST
    @Path("/{id}/reprovar")
    @Transactional
    public Response reprovarInstituicao(@PathParam("id") String id, Map<String, String> body) {
        try {
            String motivo = body != null ? body.get("motivo") : null;

            if (motivo == null || motivo.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Motivo da reprovação é obrigatório"))
                        .build();
            }

            Institution instituicao = statusOSCService.reprovarInstituicao(id, motivo);

            // AUDIT LOG
            auditService.logReprovacao(
                "Institution",
                id,
                motivo,
                getCurrentUserId(),
                getCurrentUser(),
                getClientIP()
            );

            log.info("❌ Instituição reprovada: {} por {} - Motivo: {}", id, getCurrentUser(), motivo);
            return Response.ok(instituicao).build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("❌ Erro ao reprovar instituição: {}", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            log.error("💥 Erro inesperado ao reprovar instituição", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erro interno ao reprovar instituição"))
                    .build();
        }
    }
}
