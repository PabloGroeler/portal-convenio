package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.acme.dto.TipoEmendaDTO;
import org.acme.repository.TipoEmendaRepository;

import java.util.List;

@Path("/api/tipos-emenda")
@Produces(MediaType.APPLICATION_JSON)
public class TiposEmendaResource {

    @Inject
    TipoEmendaRepository tipoEmendaRepository;

    @GET
    public List<TipoEmendaDTO> list(@QueryParam("includeInactive") @DefaultValue("false") boolean includeInactive) {
        return (includeInactive ?
                tipoEmendaRepository.find("order by ordem asc, nome asc").list() :
                tipoEmendaRepository.listAtivosOrdenado())
                .stream()
                .map(TipoEmendaDTO::fromEntity)
                .toList();
    }
}

// Alias for JIRA 2: GET /tipos-emenda
@Path("/tipos-emenda")
@Produces(MediaType.APPLICATION_JSON)
class TiposEmendaAliasResource {

    @Inject
    TipoEmendaRepository tipoEmendaRepository;

    @GET
    public List<TipoEmendaDTO> list(@QueryParam("includeInactive") @DefaultValue("false") boolean includeInactive) {
        return (includeInactive ?
                tipoEmendaRepository.find("order by ordem asc, nome asc").list() :
                tipoEmendaRepository.listAtivosOrdenado())
                .stream()
                .map(TipoEmendaDTO::fromEntity)
                .toList();
    }
}
