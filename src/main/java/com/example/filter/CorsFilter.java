package com.example.filter;

import jakarta.annotation.Priority;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
@PreMatching
@Priority(Integer.MIN_VALUE) // Run before all other filters
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    private static final String ALLOWED_ORIGIN = "http://localhost:3000";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            Response.ResponseBuilder rb = Response.ok();
            addCorsHeaders(rb);
            requestContext.abortWith(rb.build());
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        addCorsHeaders(responseContext.getHeaders());
    }

    private void addCorsHeaders(Response.ResponseBuilder rb) {
        rb.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
        rb.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        rb.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        rb.header("Access-Control-Allow-Credentials", "true");
        rb.header("Access-Control-Max-Age", "86400");
    }

    private void addCorsHeaders(jakarta.ws.rs.core.MultivaluedMap<String, Object> headers) {
        headers.putSingle("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
        headers.putSingle("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        headers.putSingle("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        headers.putSingle("Access-Control-Allow-Credentials", "true");
    }
}
