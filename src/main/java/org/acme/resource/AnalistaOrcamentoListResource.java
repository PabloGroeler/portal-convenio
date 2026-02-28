package org.acme.resource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.UserAdminDTO;
import org.acme.service.EmendaAnalistaOrcamentoService;
import java.util.List;
@Path("/api/usuarios/analistas-orcamento")
@Produces(MediaType.APPLICATION_JSON)
public class AnalistaOrcamentoListResource {
    @Inject
    EmendaAnalistaOrcamentoService service;
    @GET
    public Response listar() {
        List<UserAdminDTO> list = service.listarAnalistasOrcamento();
        return Response.ok(list).build();
    }
}
