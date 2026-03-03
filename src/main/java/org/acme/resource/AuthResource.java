package org.acme.resource;

import io.jsonwebtoken.Claims;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.acme.entity.UsuarioInstituicao;
import org.acme.service.AuthService;
import org.acme.service.AuditService;
import org.acme.dto.LoginRequest;
import org.acme.dto.LoginResponse;
import org.acme.dto.SuccessResponse;
import org.acme.dto.UserDTO;
import org.acme.entity.User;
import org.acme.security.JwtUtil;

import java.util.List;
import java.util.stream.Collectors;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class AuthResource {

    @Inject
    AuthService authService;

    @Inject
    AuditService auditService;

    @Inject
    JwtUtil jwtUtil;

    @Context
    ContainerRequestContext requestContext;

    @POST
    @Path("/login")
    public Response login(LoginRequest loginRequest) {
        log.info("Login request for document: {}", loginRequest.username());
        String ipAddress = getClientIP();

        try {
            // username now contains CPF or CNPJ (digits only)
            String document = loginRequest.username();

            // Authenticate with the document
            String token = authService.login(document, loginRequest.password());
            if (token == null) {
                // AUDIT LOG - Login falhou (credenciais inválidas)
                auditService.logLogin(null, document, null, ipAddress, false);
                throw new Exception("Invalid credentials");
            }

            // Find user by documento (CPF or CNPJ)
            User user = User.findByDocumento(document);

            if (user == null) {
                // AUDIT LOG - Login falhou (usuário não encontrado)
                auditService.logLogin(null, document, null, ipAddress, false);
                throw new Exception("User not found");
            }

            // Buscar instituições vinculadas
            List<String> instituicoes = UsuarioInstituicao.findByUsuario(user.id)
                .stream()
                .map(vi -> vi.instituicaoId)
                .collect(Collectors.toList());

            UserDTO userDTO = new UserDTO(
                user.id,
                user.username,
                user.email,
                user.nomeCompleto,
                user.role.name(),      // Include role for RBAC
                user.status.name(),    // Include status
                instituicoes,
                user.secretaria        // Secretaria vinculada (SECRETARIA role)
            );

            // AUDIT LOG - Login bem sucedido
            auditService.logLogin(user.id, user.username, user.email, ipAddress, true);

            return Response.ok(new LoginResponse(true, token, userDTO)).build();
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid credentials\"}")
                    .build();
        }
    }

    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("Authorization") String authorization) {
        String token = extractBearerToken(authorization);
        String ipAddress = getClientIP();

        if (token != null) {
            try {
                // Parse token to get user info
                Claims claims = jwtUtil.parseToken(token);
                String username = claims.getSubject();
                User user = User.find("username", username).firstResult();

                if (user != null) {
                    // AUDIT LOG - Logout
                    auditService.logLogout(user.id, user.username, ipAddress);
                }

                authService.logout(token);
            } catch (Exception e) {
                log.warn("Error during logout audit: {}", e.getMessage());
                // Continue with logout even if audit fails
                authService.logout(token);
            }
        }
        return Response.ok(new SuccessResponse(true)).build();
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null) {
            return null;
        }
        String trimmed = authorization.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.regionMatches(true, 0, "Bearer ", 0, "Bearer ".length())) {
            String token = trimmed.substring("Bearer ".length()).trim();
            return token.isEmpty() ? null : token;
        }
        return trimmed;
    }

    private String getClientIP() {
        if (requestContext == null) {
            return "unknown";
        }
        // Try to get real IP from headers (in case of proxy/load balancer)
        String ip = requestContext.getHeaderString("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = requestContext.getHeaderString("X-Real-IP");
        }
        // If multiple IPs in X-Forwarded-For, get the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null && !ip.isEmpty() ? ip : "unknown";
    }
}
