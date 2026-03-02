package org.acme.service;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.acme.dto.AnalistaOrcamentoResponseDTO;
import org.acme.dto.UserAdminDTO;
import org.acme.entity.Emenda;
import org.acme.entity.EmendaAnalistaOrcamento;
import org.acme.entity.User;
import org.acme.repository.EmendaRepository;
import org.jboss.logging.Logger;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@ApplicationScoped
public class EmendaAnalistaOrcamentoService {
    private static final Logger log = Logger.getLogger(EmendaAnalistaOrcamentoService.class);
    @Inject
    EmendaRepository emendaRepository;
    public Optional<AnalistaOrcamentoResponseDTO> getAnalistaAtivo(String emendaId) {
        return EmendaAnalistaOrcamento.findActiveByEmendaId(emendaId)
                .map(AnalistaOrcamentoResponseDTO::fromEntity);
    }
    @Transactional
    public AnalistaOrcamentoResponseDTO atribuirAnalista(String emendaId, Long analistaId, String currentUsername) {
        Emenda emenda = emendaRepository.findById(emendaId);
        if (emenda == null) {
            throw new WebApplicationException("Emenda nao encontrada", Response.Status.NOT_FOUND);
        }
        User analista = User.findById(analistaId);
        if (analista == null) {
            throw new WebApplicationException("Analista nao encontrado", Response.Status.BAD_REQUEST);
        }
        if (analista.role != User.UserRole.ORCAMENTO) {
            throw new WebApplicationException("Usuario nao possui perfil ORCAMENTO", Response.Status.BAD_REQUEST);
        }
        if (analista.status != User.UserStatus.ATIVO) {
            throw new WebApplicationException("Analista nao esta ativo", Response.Status.BAD_REQUEST);
        }
        User atribuidoPor = User.find("username", currentUsername).firstResult();
        if (atribuidoPor == null) {
            throw new WebApplicationException("Usuario atual nao encontrado", Response.Status.INTERNAL_SERVER_ERROR);
        }
        // Deactivate existing active analyst
        EmendaAnalistaOrcamento.findActiveByEmendaId(emendaId).ifPresent(existing -> {
            existing.ativo = false;
            existing.persist();
        });
        EmendaAnalistaOrcamento assignment = new EmendaAnalistaOrcamento();
        assignment.emenda = emenda;
        assignment.analista = analista;
        assignment.atribuidoPor = atribuidoPor;
        assignment.dataAtribuicao = OffsetDateTime.now();
        assignment.ativo = true;
        assignment.persist();
        log.infof("Analista %s atribuido a emenda %s por %s", analista.nomeCompleto, emendaId, currentUsername);
        return AnalistaOrcamentoResponseDTO.fromEntity(assignment);
    }
    @Transactional
    public void removerAnalista(String emendaId, String currentUsername) {
        EmendaAnalistaOrcamento active = EmendaAnalistaOrcamento.findActiveByEmendaId(emendaId)
                .orElseThrow(() -> new WebApplicationException("Nenhum analista ativo para esta emenda", Response.Status.NOT_FOUND));
        active.ativo = false;
        active.persist();
        log.infof("Analista removido da emenda %s por %s", emendaId, currentUsername);
    }
    public List<UserAdminDTO> listarAnalistasOrcamento() {
        return User.<User>list("role = ?1 and status = ?2", User.UserRole.ORCAMENTO, User.UserStatus.ATIVO)
                .stream()
                .map(UserAdminDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
