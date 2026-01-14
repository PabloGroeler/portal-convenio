package org.acme.resource;

import io.quarkus.logging.Log;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.NewsRequest;
import org.acme.dto.SuccessResponse;
import org.acme.entity.News;
import org.acme.repository.NewsRepository;

import java.util.List;

@Path("/api/news")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class NewsResource {

    @Inject
    NewsRepository newsRepository;

    @GET
    public List<News> list() {
        return newsRepository.listAll();
    }

    @POST
    @Transactional
    public Response create(NewsRequest request) {
        Log.info("Starting create NewsResource");
        if (request == null) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        News news = new News(null, request.title(), request.content());
        newsRepository.persist(news);
        return Response.status(Response.Status.OK).entity(news).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") long id, NewsRequest request) {
        if (id <= 0 || request == null) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        News existing = newsRepository.findById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        existing.title = request.title();
        existing.content = request.content();
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        if (id <= 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new SuccessResponse(false)).build();
        }

        News existing = newsRepository.findById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND).entity(new SuccessResponse(false)).build();
        }

        newsRepository.delete(existing);
        return Response.ok(new SuccessResponse(true)).build();
    }
}
