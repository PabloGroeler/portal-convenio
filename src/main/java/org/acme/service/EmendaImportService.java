package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.external.ExternalEmendaDTO;
import org.acme.entity.Emenda;
import org.acme.repository.EmendaRepository;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class EmendaImportService {

    @Inject
    EmendaRepository emendaRepository;

    @Inject
    EmendaService emendaService;

    @Inject
    EmendaImportMapper mapper;

    @Transactional
    public ImportSummary importFromExternal(List<ExternalEmendaDTO> externalEmendas, String usuario) {
        ImportSummary summary = new ImportSummary();
        if (externalEmendas == null || externalEmendas.isEmpty()) {
            return summary;
        }

        for (ExternalEmendaDTO dto : externalEmendas) {
            if (dto == null) continue;

            Emenda incoming = mapper.toEntity(dto);
            if (incoming == null) continue;

            // Required fields for our current idempotency strategy
            if (incoming.officialCode == null || incoming.officialCode.isBlank()) {
                summary.skipped++;
                summary.warnings.add("Skipped: missing officialCode");
                continue;
            }

            if (incoming.institutionId == null || incoming.institutionId.isBlank()) {
                summary.skipped++;
                summary.warnings.add("Skipped: missing institutionId for officialCode=" + incoming.officialCode);
                continue;
            }

            Emenda existing = emendaRepository.findByOfficialCodeAndInstitutionId(incoming.officialCode, incoming.institutionId);
            if (existing == null) {
                emendaService.create(incoming, usuario != null ? usuario : "sistema");
                summary.created++;
            } else {
                emendaService.update(existing.id, incoming, usuario != null ? usuario : "sistema");
                summary.updated++;
            }
        }

        return summary;
    }

    public static class ImportSummary {
        public int created;
        public int updated;
        public int skipped;
        public List<String> warnings = new ArrayList<>();
    }
}

