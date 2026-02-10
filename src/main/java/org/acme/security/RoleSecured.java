package org.acme.security;

import jakarta.enterprise.util.Nonbinding;
import jakarta.interceptor.InterceptorBinding;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation for role-based method security
 *
 * Usage:
 * @RoleSecured({"ADMIN"})
 * public Response deleteUser(Long id) { ... }
 *
 * @RoleSecured({"ADMIN", "ANALISTA"})
 * public Response approveEmenda(Long id) { ... }
 */
@InterceptorBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface RoleSecured {
    @Nonbinding
    String[] value() default {};
}
