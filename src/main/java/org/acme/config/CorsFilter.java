package org.acme.config;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import org.jboss.logging.Logger;

@Provider
@PreMatching
@Priority(Priorities.AUTHENTICATION - 100)
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    private static final Logger LOG = Logger.getLogger(CorsFilter.class);
    private static final String DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD";
    private static final String DEFAULT_ALLOWED_HEADERS = "accept,authorization,content-type,x-requested-with";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String origin = requestContext.getHeaderString("Origin");
        LOG.debugf("CorsFilter incoming method=%s path=%s origin=%s", requestContext.getMethod(), requestContext.getUriInfo().getPath(), origin);
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            // Do not set Access-Control-Allow-Origin here — let Quarkus CORS extension set it based on application.properties
            Response.ResponseBuilder builder = Response.ok();
            builder.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS)
                    .header("Access-Control-Allow-Headers", DEFAULT_ALLOWED_HEADERS)
                    .header("Access-Control-Allow-Credentials", "true");
            requestContext.abortWith(builder.build());
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        // Do not add Access-Control-Allow-Origin here; Quarkus CORS will set the correct single origin header.
        if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Methods")) {
            responseContext.getHeaders().add("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
        }
        if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Headers")) {
            responseContext.getHeaders().add("Access-Control-Allow-Headers", DEFAULT_ALLOWED_HEADERS);
        }
        if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Credentials")) {
            responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
        }
    }
}
