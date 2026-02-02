package org.acme.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.external.ExternalCouncilorDTO;
import org.acme.dto.external.ExternalInstitutionDTO;
import org.acme.dto.external.ExternalPublicDataDTO;
import org.acme.entity.Instituicao;
import org.acme.entity.Parlamentar;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class PublicDataImportService {

    @Inject
    ObjectMapper objectMapper;

    @Inject
    CouncilorService councilorService;

    @Inject
    InstitutionService institutionService;

    @Inject
    EmendaImportService emendaImportService;

    @Transactional
    public SyncSummary importPublicData(JsonNode root, String usuario) {
        SyncSummary summary = new SyncSummary();
        if (root == null || root.isNull()) {
            summary.warnings.add("Public data response was empty");
            return summary;
        }

        ExternalPublicDataDTO dto = objectMapper.convertValue(root, ExternalPublicDataDTO.class);

        // Councilors
        if (dto.councilors != null) {
            for (ExternalCouncilorDTO c : dto.councilors) {
                if (c == null || c.councilorId == null || c.councilorId.isBlank()) {
                    summary.councilorsSkipped++;
                    continue;
                }

                Parlamentar existing = councilorService.findByCouncilorId(c.councilorId);
                if (existing == null) {
                    Parlamentar entity = new Parlamentar();
                    entity.idParlamentar = c.councilorId;
                    entity.nomeCompleto = c.fullName != null ? c.fullName : "";
                    entity.partidoPolitico = c.politicalParty;
                    councilorService.create(entity);
                    summary.councilorsCreated++;
                } else {
                    Parlamentar updated = new Parlamentar();
                    updated.idParlamentar = c.councilorId;
                    updated.nomeCompleto = c.fullName != null ? c.fullName : existing.nomeCompleto;
                    updated.partidoPolitico = c.politicalParty;
                    councilorService.updateStringId(existing.idParlamentar, updated);
                    summary.councilorsUpdated++;
                }
            }
        }

        // Institutions
        if (dto.institutions != null) {
            for (ExternalInstitutionDTO i : dto.institutions) {
                if (i == null || i.institutionId == null || i.institutionId.isBlank()) {
                    summary.institutionsSkipped++;
                    continue;
                }

                Instituicao existing = institutionService.findByInstitutionId(i.institutionId);
                if (existing == null) {
                    Instituicao entity = new Instituicao();
                    entity.institutionId = i.institutionId;
                    // Map external 'name' into Razão Social as best-effort.
                    entity.razaoSocial = i.name != null ? i.name : "";

                    // Required fields that external API may not provide.
                    // Keep empty strings to satisfy non-null constraints, and allow later completion via UI.
                    entity.cnpj = "00000000000000";
                    entity.inscricaoMunicipal = "";
                    entity.telefone = "";
                    entity.emailInstitucional = (i.institutionId + "@invalido.local");
                    entity.cep = "00000000";
                    entity.logradouro = "";
                    entity.numero = "";
                    entity.bairro = "";
                    entity.cidade = "";
                    entity.uf = "MT";
                    entity.numeroRegistroConselhoMunicipal = "";

                    institutionService.create(entity);
                    summary.institutionsCreated++;
                } else {
                    Instituicao updated = new Instituicao();
                    updated.institutionId = i.institutionId;
                    updated.razaoSocial = i.name != null ? i.name : existing.razaoSocial;
                    institutionService.updateStringId(existing.institutionId, updated);
                    summary.institutionsUpdated++;
                }
            }
        }

        // Emendas
        if (dto.amendments != null) {
            EmendaImportService.ImportSummary es = emendaImportService.importFromExternal(dto.amendments, usuario);
            summary.emendasCreated = es.created;
            summary.emendasUpdated = es.updated;
            summary.emendasSkipped = es.skipped;
            summary.warnings.addAll(es.warnings);
        }

        return summary;
    }

    public static class SyncSummary {
        public int councilorsCreated;
        public int councilorsUpdated;
        public int councilorsSkipped;

        public int institutionsCreated;
        public int institutionsUpdated;
        public int institutionsSkipped;

        public int emendasCreated;
        public int emendasUpdated;
        public int emendasSkipped;

        public List<String> warnings = new ArrayList<>();
    }
}
