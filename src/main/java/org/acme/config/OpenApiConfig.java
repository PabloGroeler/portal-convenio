package org.acme.config;

import org.eclipse.microprofile.openapi.annotations.Components;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;

import jakarta.ws.rs.core.Application;

@OpenAPIDefinition(
        info = @Info(
                title = "Your API",
                version = "1.0.0",
                description = "API documentation for your application"
        ),
        components = @Components(
                securitySchemes = {
                        @SecurityScheme(
                                securitySchemeName = "bearerAuth",
                                type = SecuritySchemeType.HTTP,
                                scheme = "bearer",
                                bearerFormat = "JWT"
                        )
                }
        )
)
public class OpenApiConfig extends Application {
}
