package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Instituicao;
import org.acme.repository.InstitutionRepository;
import org.acme.service.InstitutionService;

import java.util.List;

@Path("/api/institutions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InstitutionResource {

    @Inject
    InstitutionService institutionService;

    @Inject
    InstitutionRepository institutionRepository;

    private Response badRequest(String msg) {
        return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\": \"" + msg.replace("\"", "\\\"") + "\"}")
                .build();
    }

    private static String onlyDigits(String s) {
        return s == null ? null : s.replaceAll("\\D", "");
    }

    @GET
    public List<Instituicao> list() {
        return institutionService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        Instituicao instituicao = institutionService.findById(id);
        if (instituicao == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(instituicao).build();
    }

    @GET
    @Path("/by-institution-id/{institutionId}")
    public Response getByInstitutionId(@PathParam("institutionId") String institutionId) {
        Instituicao instituicao = institutionService.findByInstitutionId(institutionId);
        if (instituicao == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(instituicao).build();
    }

    @POST
    public Response create(Instituicao instituicao) {
        if (instituicao == null) {
            return badRequest("Payload inválido");
        }

        instituicao.cnpj = onlyDigits(instituicao.cnpj);
        instituicao.cep = onlyDigits(instituicao.cep);

        // Required fields validations (basic)
        if (instituicao.razaoSocial == null || instituicao.razaoSocial.isBlank()) return badRequest("Razão Social é obrigatória");
        if (instituicao.razaoSocial.length() > 200) return badRequest("Razão Social deve ter no máximo 200 caracteres");
        if (instituicao.nomeFantasia != null && instituicao.nomeFantasia.length() > 200) return badRequest("Nome Fantasia deve ter no máximo 200 caracteres");
        if (instituicao.cnpj == null || instituicao.cnpj.length() != 14) return badRequest("CNPJ inválido");
        if (instituicao.inscricaoMunicipal == null || instituicao.inscricaoMunicipal.isBlank()) return badRequest("Inscrição Municipal é obrigatória");
        if (instituicao.inscricaoMunicipal.length() > 20) return badRequest("Inscrição Municipal deve ter no máximo 20 caracteres");
        if (instituicao.inscricaoEstadual != null && instituicao.inscricaoEstadual.length() > 20) return badRequest("Inscrição Estadual deve ter no máximo 20 caracteres");

        if (instituicao.telefone == null || instituicao.telefone.isBlank()) return badRequest("Telefone é obrigatório");
        if (instituicao.emailInstitucional == null || instituicao.emailInstitucional.isBlank()) return badRequest("E-mail institucional é obrigatório");
        if (instituicao.cep == null || instituicao.cep.length() != 8) return badRequest("CEP inválido");
        if (instituicao.logradouro == null || instituicao.logradouro.isBlank()) return badRequest("Logradouro é obrigatório");
        if (instituicao.numero == null || instituicao.numero.isBlank()) return badRequest("Número é obrigatório");
        if (instituicao.bairro == null || instituicao.bairro.isBlank()) return badRequest("Bairro é obrigatório");
        if (instituicao.cidade == null || instituicao.cidade.isBlank()) return badRequest("Cidade é obrigatória");
        if (instituicao.uf == null || instituicao.uf.isBlank()) return badRequest("UF é obrigatória");
        if (instituicao.numeroRegistroConselhoMunicipal == null || instituicao.numeroRegistroConselhoMunicipal.isBlank()) return badRequest("Número de Registro no Conselho Municipal é obrigatório");

        // Uniqueness checks
        Instituicao emailExisting = institutionRepository.find("emailInstitucional", instituicao.emailInstitucional).firstResult();
        if (emailExisting != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"E-mail institucional já cadastrado\"}")
                    .build();
        }

        // Check if institutionId already exists
        if (instituicao.institutionId != null && !instituicao.institutionId.isBlank()) {
            Instituicao existing = institutionService.findByInstitutionId(instituicao.institutionId);
            if (existing != null) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("{\"error\": \"ID da instituição já existe\"}")
                        .build();
            }
        }

        Instituicao created = institutionService.create(instituicao);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Instituicao instituicao) {
        Instituicao updated = institutionService.update(id, instituicao);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        boolean deleted = institutionService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}
