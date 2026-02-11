package org.acme.security;

import jakarta.interceptor.InterceptorBinding;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation for Role-Based Access Control (RBAC)
 *
 * Use this annotation on REST endpoints or classes to restrict access
 * to users with specific roles.
 *
 * Example usage:
 *
 * Single role:
 * @RolesAllowed("ADMIN")
 * public Response adminOnlyEndpoint() { ... }
 *
 * Multiple roles (OR logic - user needs ONE of these roles):
 * @RolesAllowed({"ADMIN", "GESTOR"})
 * public Response protectedEndpoint() { ... }
 *
 * Class-level (applies to all methods):
 * @RolesAllowed("ADMIN")
 * @Path("/admin")
 * public class AdminResource { ... }
 *
 * Valid roles: ADMIN, OPERADOR, ANALISTA, JURIDICO
 */
@InterceptorBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface RolesAllowed {
    /**
     * List of allowed roles
     * User needs to have AT LEAST ONE of these roles to access the endpoint
     *
     * @return Array of role names (e.g., {"ADMIN", "OPERADOR"})
     */
    String[] value() default {};
}
