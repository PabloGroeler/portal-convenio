package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.service.AuthService;
import org.acme.dto.LoginRequest;
import org.acme.dto.LoginResponse;
import org.acme.dto.SuccessResponse;

@Path("/api")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        if (request == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new LoginResponse(false, null))
                    .build();
        }

        String token = authService.login(request.username(), request.password());
        if (token == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new LoginResponse(false, null))
                    .build();
        }

        return Response.ok(new LoginResponse(true, token)).build();
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
