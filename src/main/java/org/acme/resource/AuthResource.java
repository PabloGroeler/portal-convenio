package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.acme.service.AuthService;
import org.acme.dto.LoginRequest;
import org.acme.dto.LoginResponse;
import org.acme.dto.SuccessResponse;
import org.acme.dto.UserDTO;
import org.acme.entity.User;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response login(LoginRequest loginRequest) {
        log.info("Login request for document: {}", loginRequest.username());
        try {
            // username now contains CPF or CNPJ (digits only)
            String document = loginRequest.username();

            // Authenticate with the document
            String token = authService.login(document, loginRequest.password());
            if (token == null) {
                throw new Exception("Invalid credentials");
            }

            // Find user by CPF or CNPJ
            User user = null;
            if (document.length() == 11) {
                // CPF (11 digits)
                user = User.find("cpf", document).firstResult();
            } else if (document.length() == 14) {
                // CNPJ (14 digits)
                user = User.find("cnpj", document).firstResult();
            }

            if (user == null) {
                throw new Exception("User not found");
            }

            UserDTO userDTO = new UserDTO(user.id, user.username, user.email);
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
        if (token != null) {
            authService.logout(token);
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
}
