package org.acme.service;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.acme.dto.AdmissibilidadeRequestDTO;
import org.acme.dto.AdmissibilidadeResponseDTO;
import org.acme.entity.Emenda;
import org.acme.entity.EmendaAdmissibilidade;
import org.acme.entity.User;
import org.acme.repository.EmendaRepository;
import org.jboss.logging.Logger;
import java.time.OffsetDateTime;
import java.util.Optional;
@ApplicationScoped
public class AdmissibilidadeService {
    private static final Logger log = Logger.getLogger(AdmissibilidadeService.class);
    @Inject
    EmendaRepository emendaRepository;
    public Optional<AdmissibilidadeResponseDTO> getAdmissibilidade(String emendaId) {
        return EmendaAdmissibilidade.findByEmendaId(emendaId)
                .map(AdmissibilidadeResponseDTO::fromEntity);
    }
    @Transactional
    public AdmissibilidadeResponseDTO registrar(String emendaId, AdmissibilidadeRequestDTO dto, String currentUsername) {
        Emenda emenda = emendaRepository.findById(emendaId);
        if (emenda == null) {
            throw new WebApplicationException("Emenda nao encontrada", Response.Status.NOT_FOUND);
        }
        User analista = User.find("username", currentUsername).firstResult();
        if (analista == null) {
            throw new WebApplicationException("Usuario nao encontrado", Response.Status.INTERNAL_SERVER_ERROR);
        }
        if (analista.role != User.UserRole.ORCAMENTO && analista.role != User.UserRole.ADMIN) {
            throw new WebApplicationException("Apenas usuarios com perfil ORCAMENTO podem analisar admissibilidade", Response.Status.FORBIDDEN);
        }
        // Delete existing record for this emenda (latest wins)
        EmendaAdmissibilidade.delete("emenda.id", emendaId);
        EmendaAdmissibilidade registro = new EmendaAdmissibilidade();
        registro.emenda = emenda;
        registro.status = EmendaAdmissibilidade.Status.valueOf(dto.status());
        registro.observacao = dto.observacao();
        registro.analista = analista;
        registro.dataAnalise = OffsetDateTime.now();
        registro.persist();
        log.infof("Admissibilidade %s registrada para emenda %s por %s", dto.status(), emendaId, currentUsername);
        return AdmissibilidadeResponseDTO.fromEntity(registro);
    }
}