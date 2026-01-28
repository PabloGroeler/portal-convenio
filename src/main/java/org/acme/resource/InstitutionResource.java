package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entity.Institution;
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
    public List<Institution> list() {
        return institutionService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        Institution institution = institutionService.findById(id);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(institution).build();
    }

    @GET
    @Path("/by-institution-id/{institutionId}")
    public Response getByInstitutionId(@PathParam("institutionId") String institutionId) {
        Institution institution = institutionService.findByInstitutionId(institutionId);
        if (institution == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(institution).build();
    }

    @POST
    public Response create(Institution institution) {
        if (institution == null) {
            return badRequest("Payload inválido");
        }

        institution.cnpj = onlyDigits(institution.cnpj);
        institution.cep = onlyDigits(institution.cep);

        // Required fields validations (basic)
        if (institution.razaoSocial == null || institution.razaoSocial.isBlank()) return badRequest("Razão Social é obrigatória");
        if (institution.razaoSocial.length() > 200) return badRequest("Razão Social deve ter no máximo 200 caracteres");
        if (institution.nomeFantasia != null && institution.nomeFantasia.length() > 200) return badRequest("Nome Fantasia deve ter no máximo 200 caracteres");
        if (institution.cnpj == null || institution.cnpj.length() != 14) return badRequest("CNPJ inválido");
        if (institution.inscricaoMunicipal == null || institution.inscricaoMunicipal.isBlank()) return badRequest("Inscrição Municipal é obrigatória");
        if (institution.inscricaoMunicipal.length() > 20) return badRequest("Inscrição Municipal deve ter no máximo 20 caracteres");
        if (institution.inscricaoEstadual != null && institution.inscricaoEstadual.length() > 20) return badRequest("Inscrição Estadual deve ter no máximo 20 caracteres");

        if (institution.telefone == null || institution.telefone.isBlank()) return badRequest("Telefone é obrigatório");
        if (institution.emailInstitucional == null || institution.emailInstitucional.isBlank()) return badRequest("E-mail institucional é obrigatório");
        if (institution.cep == null || institution.cep.length() != 8) return badRequest("CEP inválido");
        if (institution.logradouro == null || institution.logradouro.isBlank()) return badRequest("Logradouro é obrigatório");
        if (institution.numero == null || institution.numero.isBlank()) return badRequest("Número é obrigatório");
        if (institution.bairro == null || institution.bairro.isBlank()) return badRequest("Bairro é obrigatório");
        if (institution.cidade == null || institution.cidade.isBlank()) return badRequest("Cidade é obrigatória");
        if (institution.uf == null || institution.uf.isBlank()) return badRequest("UF é obrigatória");
        if (institution.numeroRegistroConselhoMunicipal == null || institution.numeroRegistroConselhoMunicipal.isBlank()) return badRequest("Número de Registro no Conselho Municipal é obrigatório");

        // Uniqueness checks
        Institution emailExisting = institutionRepository.find("emailInstitucional", institution.emailInstitucional).firstResult();
        if (emailExisting != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"E-mail institucional já cadastrado\"}")
                    .build();
        }

        // Check if institutionId already exists
        if (institution.institutionId != null && !institution.institutionId.isBlank()) {
            Institution existing = institutionService.findByInstitutionId(institution.institutionId);
            if (existing != null) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("{\"error\": \"ID da instituição já existe\"}")
                        .build();
            }
        }

        Institution created = institutionService.create(institution);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, Institution institution) {
        Institution updated = institutionService.update(id, institution);
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
