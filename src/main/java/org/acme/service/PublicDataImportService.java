package org.acme.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.external.ExternalCouncilorDTO;
import org.acme.dto.external.ExternalInstitutionDTO;
import org.acme.dto.external.ExternalPublicDataDTO;
import org.acme.entity.Councilor;
import org.acme.entity.Institution;

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

                Councilor existing = councilorService.findByCouncilorId(c.councilorId);
                if (existing == null) {
                    Councilor entity = new Councilor();
                    entity.councilorId = c.councilorId;
                    entity.fullName = c.fullName != null ? c.fullName : "";
                    entity.politicalParty = c.politicalParty;
                    councilorService.create(entity);
                    summary.councilorsCreated++;
                } else {
                    Councilor updated = new Councilor();
                    updated.councilorId = c.councilorId;
                    updated.fullName = c.fullName != null ? c.fullName : existing.fullName;
                    updated.politicalParty = c.politicalParty;
                    councilorService.updateStringId(existing.councilorId, updated);
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

                Institution existing = institutionService.findByInstitutionId(i.institutionId);
                if (existing == null) {
                    Institution entity = new Institution();
                    entity.institutionId = i.institutionId;
                    entity.name = i.name != null ? i.name : "";
                    institutionService.create(entity);
                    summary.institutionsCreated++;
                } else {
                    Institution updated = new Institution();
                    updated.institutionId = i.institutionId;
                    updated.name = i.name != null ? i.name : existing.name;
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
