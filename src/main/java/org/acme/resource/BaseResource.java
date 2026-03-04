package org.acme.resource;

import io.jsonwebtoken.Claims;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.security.JwtUtil;
import org.jboss.logging.Logger;

/**
 * Base class providing JWT-aware user resolution for JAX-RS resources.
 * Since there is no ContainerRequestFilter populating the SecurityContext principal,
 * we parse the Authorization: Bearer <token> header directly.
 */
public abstract class BaseResource {

    private static final Logger LOG = Logger.getLogger(BaseResource.class);

    @Inject
    JwtUtil jwtUtil;

    @Context
    HttpHeaders httpHeaders;

    @Context
    SecurityContext securityContext;

    /**
     * Returns the authenticated username from the JWT subject claim.
     * Falls back to "sistema" if no valid token is present.
     */
    protected String getCurrentUser() {
        // 1. Try SecurityContext (populated by a filter if configured)
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            String name = securityContext.getUserPrincipal().getName();
            if (name != null && !name.isBlank() && !"sistema".equals(name)) return name;
        }
        // 2. Parse JWT from Authorization header
        try {
            String authHeader = httpHeaders.getHeaderString(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                Claims claims = jwtUtil.parseToken(authHeader.substring(7));
                String subject = claims.getSubject();
                if (subject != null && !subject.isBlank()) return subject;
            }
        } catch (Exception e) {
            LOG.debugf("Could not extract user from JWT: %s", e.getMessage());
        }
        return "sistema";
    }

    /**
     * Returns the authenticated user's DB id, or null if not found.
     */
    protected Long getCurrentUserId() {
        String username = getCurrentUser();
        if ("sistema".equals(username)) return null;
        try {
            org.acme.entity.User user = org.acme.entity.User.find("username", username).firstResult();
            return user != null ? user.id : null;
        } catch (Exception e) {
            LOG.warnf("Could not resolve userId for username=%s: %s", username, e.getMessage());
            return null;
        }
    }

    protected String getClientIP() {
        try {
            String ip = httpHeaders.getHeaderString("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = httpHeaders.getHeaderString("X-Real-IP");
            }
            if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
            return ip != null ? ip : "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }
}

