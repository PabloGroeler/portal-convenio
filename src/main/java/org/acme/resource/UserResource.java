package org.acme.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import lombok.extern.slf4j.Slf4j;
import org.acme.dto.RegisterRequest;
import org.acme.dto.UserDTO;
import org.acme.entity.Councilor;
import org.acme.entity.Institution;
import org.acme.entity.User;
import org.acme.entity.UsuarioInstituicao;
import org.acme.repository.InstitutionRepository;
import org.acme.service.UserService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @Inject
    InstitutionRepository institutionRepository;

    @Inject
    org.acme.repository.EmendaRepository emendaRepository;

    @Inject
    org.acme.repository.CouncilorRepository councilorRepository;

    @POST
    @Path("/register")
    public Response register(RegisterRequest request) {
        try {
            return Response.ok(userService.register(request)).build();
        } catch (RuntimeException e) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/vincular-instituicao")
    @RolesAllowed({"ADMIN", "OPERADOR", "ANALISTA", "JURIDICO"})
    @Transactional
    public Response vincularInstituicao(
            @QueryParam("instituicaoId") String instituicaoId,
            @Context SecurityContext securityContext) {
        try {
            String username = securityContext.getUserPrincipal().getName();
            User user = User.findByUsername(username);

            if (user == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"User not found\"}")
                        .build();
            }

            if (instituicaoId == null || instituicaoId.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"instituicaoId is required\"}")
                        .build();
            }

            // Verificar se já existe vínculo
            UsuarioInstituicao vinculoExistente = UsuarioInstituicao.findByUsuarioAndInstituicao(user.id, instituicaoId);
            if (vinculoExistente == null) {
                // Criar novo vínculo
                UsuarioInstituicao novoVinculo = new UsuarioInstituicao();
                novoVinculo.usuarioId = user.id;
                novoVinculo.instituicaoId = instituicaoId;
                novoVinculo.persist();
            }

            // Buscar todas as instituições vinculadas
            List<String> instituicoes = UsuarioInstituicao.findByUsuario(user.id)
                .stream()
                .map(vi -> vi.instituicaoId)
                .collect(Collectors.toList());

            UserDTO userDTO = new UserDTO(
                user.id,
                user.username,
                user.email,
                user.nomeCompleto,
                user.role.name(),
                user.status.name(),
                instituicoes
            );

            return Response.ok(userDTO).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @DELETE
    @Path("/desvincular-instituicao")
    @RolesAllowed({"ADMIN", "OPERADOR", "ANALISTA", "JURIDICO"})
    @Transactional
    public Response desvincularInstituicao(
            @QueryParam("instituicaoId") String instituicaoId,
            @Context SecurityContext securityContext) {
        try {
            String username = securityContext.getUserPrincipal().getName();
            User user = User.findByUsername(username);

            if (user == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"User not found\"}")
                        .build();
            }

            // Buscar vínculo
            UsuarioInstituicao vinculo = UsuarioInstituicao.findByUsuarioAndInstituicao(user.id, instituicaoId);
            if (vinculo != null) {
                vinculo.ativo = false;
                vinculo.persist();
            }

            // Buscar instituições restantes
            List<String> instituicoes = UsuarioInstituicao.findByUsuario(user.id)
                .stream()
                .map(vi -> vi.instituicaoId)
                .collect(Collectors.toList());

            UserDTO userDTO = new UserDTO(
                user.id,
                user.username,
                user.email,
                user.nomeCompleto,
                user.role.name(),
                user.status.name(),
                instituicoes
            );

            return Response.ok(userDTO).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/me")
    @RolesAllowed({"ADMIN", "OPERADOR", "ANALISTA", "JURIDICO"})
    public Response getCurrentUser(@Context SecurityContext securityContext) {
        try {
            String username = securityContext.getUserPrincipal().getName();
            User user = User.findByUsername(username);

            if (user == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"User not found\"}")
                        .build();
            }

            List<String> instituicoes = UsuarioInstituicao.findByUsuario(user.id)
                .stream()
                .map(vi -> vi.instituicaoId)
                .collect(Collectors.toList());

            UserDTO userDTO = new UserDTO(
                user.id,
                user.username,
                user.email,
                user.nomeCompleto,
                user.role.name(),
                user.status.name(),
                instituicoes
            );

            return Response.ok(userDTO).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/minhas-instituicoes-detalhadas")
    public Response minhasInstituicoesDetalhadas(@HeaderParam("Authorization") String authHeader) {
        try {
            log.info("🔵 Endpoint minhas-instituicoes-detalhadas chamado");

            // Extrair e validar token manualmente
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("⚠️ Token não fornecido ou inválido");
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("{\"error\":\"Token não fornecido\"}")
                        .build();
            }

            String token = authHeader.substring(7);
            log.info("Token extraído: {}...", token.substring(0, Math.min(20, token.length())));

            io.jsonwebtoken.Claims claims;
            try {
                claims = org.acme.security.JwtUtil.parseToken(token);
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                log.warn("⚠️ Token expirado: {}", e.getMessage());
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("{\"error\":\"Token expirado\", \"expired\":true}")
                        .build();
            } catch (io.jsonwebtoken.JwtException e) {
                log.error("❌ Token inválido: {}", e.getMessage());
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("{\"error\":\"Token inválido\"}")
                        .build();
            }

            String username = claims.getSubject();
            log.info("Username do token: {}", username);

            User user = User.findByUsername(username);
            log.info("Usuário encontrado: {}", user != null ? user.username : "null");

            if (user == null) {
                log.error("❌ Usuário não encontrado: {}", username);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"User not found\"}")
                        .build();
            }

            // Buscar vínculos ativos
            log.info("Buscando vínculos do usuário ID: {}", user.id);
            List<UsuarioInstituicao> vinculos = UsuarioInstituicao.findByUsuario(user.id);
            log.info("Vínculos encontrados: {}", vinculos.size());

            // Buscar detalhes de cada instituição
            List<Map<String, Object>> instituicoesDetalhadas = new ArrayList<>();
            for (UsuarioInstituicao vinculo : vinculos) {
                log.info("Buscando instituição: {}", vinculo.instituicaoId);
                Institution inst = institutionRepository.find("institutionId", vinculo.instituicaoId).firstResult();
                if (inst != null) {
                    log.info("Instituição encontrada: {}", inst.razaoSocial);
                    Map<String, Object> info = new HashMap<>();
                    info.put("id", inst.institutionId);
                    info.put("razaoSocial", inst.razaoSocial);
                    info.put("nomeFantasia", inst.nomeFantasia);
                    info.put("cnpj", inst.cnpj);
                    info.put("emailInstitucional", inst.emailInstitucional);
                    info.put("telefone", inst.telefone);
                    info.put("cidade", inst.cidade);
                    info.put("uf", inst.uf);
                    info.put("dataVinculo", vinculo.dataVinculo);
                    info.put("ativo", vinculo.ativo);
                    instituicoesDetalhadas.add(info);
                } else {
                    log.warn("⚠️ Instituição não encontrada: {}", vinculo.instituicaoId);
                }
            }

            log.info("✅ Retornando {} instituições", instituicoesDetalhadas.size());
            return Response.ok(instituicoesDetalhadas).build();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("⚠️ Token expirado: {}", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Token expirado\", \"expired\":true}")
                    .build();
        } catch (io.jsonwebtoken.JwtException e) {
            log.error("❌ Token inválido: {}", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Token inválido\"}")
                    .build();
        } catch (Exception e) {
            log.error("❌ Erro ao buscar instituições detalhadas: {}", e.getMessage(), e);
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\", \"type\":\"" + e.getClass().getSimpleName() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/minhas-emendas")
    public Response minhasEmendas(@HeaderParam("Authorization") String authHeader) {
        try {
            log.info("🔵 Endpoint minhas-emendas chamado");

            // Extrair e validar token manualmente
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("⚠️ Token não fornecido ou inválido");
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("{\"error\":\"Token não fornecido\"}")
                        .build();
            }

            String token = authHeader.substring(7);
            log.info("Token extraído para buscar emendas");

            io.jsonwebtoken.Claims claims;
            try {
                claims = org.acme.security.JwtUtil.parseToken(token);
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                log.warn("⚠️ Token expirado: {}", e.getMessage());
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("{\"error\":\"Token expirado\", \"expired\":true}")
                        .build();
            } catch (io.jsonwebtoken.JwtException e) {
                log.error("❌ Token inválido: {}", e.getMessage());
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("{\"error\":\"Token inválido\"}")
                        .build();
            }

            String username = claims.getSubject();
            log.info("Username do token: {}", username);

            User user = User.findByUsername(username);
            log.info("Usuário encontrado: {}", user != null ? user.username : "null");

            if (user == null) {
                log.error("❌ Usuário não encontrado: {}", username);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"User not found\"}")
                        .build();
            }

            // Buscar instituições do usuário
            log.info("Buscando instituições do usuário ID: {}", user.id);
            List<UsuarioInstituicao> vinculos = UsuarioInstituicao.findByUsuario(user.id);
            log.info("Vínculos encontrados: {}", vinculos.size());

            if (vinculos.isEmpty()) {
                log.info("Nenhuma instituição vinculada, retornando lista vazia de emendas");
                return Response.ok(new ArrayList<>()).build();
            }

            // Buscar emendas de todas as instituições do usuário
            List<String> instituicaoIds = vinculos.stream()
                    .map(v -> v.instituicaoId)
                    .collect(Collectors.toList());

            log.info("Buscando emendas para {} instituições", instituicaoIds.size());

            // Buscar emendas (limitando a 50 mais recentes)
            List<org.acme.entity.Emenda> emendas = emendaRepository.list(
                "institutionId in ?1 order by createTime desc",
                instituicaoIds
            );

            log.info("Total de emendas encontradas: {}", emendas.size());

            // Montar resposta resumida
            List<Map<String, Object>> emendasResumidas = new ArrayList<>();
            for (org.acme.entity.Emenda emenda : emendas) {
                try {
                    Institution inst = institutionRepository.find("institutionId", emenda.institutionId).firstResult();
                    Councilor parlamentar = councilorRepository.find("councilorId", emenda.councilorId).firstResult();

                    Map<String, Object> resumo = new HashMap<>();
                    resumo.put("id", emenda.id);
                    resumo.put("codigoOficial", emenda.officialCode);
                    resumo.put("valor", emenda.value);
                    resumo.put("descricao", emenda.description != null && emenda.description.length() > 150
                        ? emenda.description.substring(0, 150) + "..."
                        : emenda.description);
                    resumo.put("status", emenda.status);
                    resumo.put("instituicaoNome", inst != null ? inst.razaoSocial : "N/A");
                    resumo.put("parlamentarNome", parlamentar != null ? parlamentar.fullName : "N/A");
                    resumo.put("dataCriacao", emenda.createTime);
                    resumo.put("categoria", emenda.category);

                    emendasResumidas.add(resumo);
                } catch (Exception e) {
                    log.warn("⚠️ Erro ao processar emenda {}: {}", emenda.id, e.getMessage());
                }
            }

            log.info("✅ Retornando {} emendas resumidas", emendasResumidas.size());
            return Response.ok(emendasResumidas).build();
        } catch (Exception e) {
            log.error("❌ Erro ao buscar emendas: {}", e.getMessage(), e);
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\", \"type\":\"" + e.getClass().getSimpleName() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/minhas-instituicoes")
    @RolesAllowed({"ADMIN", "OPERADOR", "ANALISTA", "JURIDICO"})
    public Response minhasInstituicoes(@Context SecurityContext securityContext) {
        try {
            String username = securityContext.getUserPrincipal().getName();
            User user = User.findByUsername(username);

            if (user == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"User not found\"}")
                        .build();
            }

            List<String> instituicoes = UsuarioInstituicao.findByUsuario(user.id)
                .stream()
                .map(vi -> vi.instituicaoId)
                .collect(Collectors.toList());

            return Response.ok(instituicoes).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
