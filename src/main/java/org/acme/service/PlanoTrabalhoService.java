package org.acme.service;

import org.acme.dto.PlanoTrabalhoDTO;
import org.acme.dto.FullPlanoTrabalhoDTO;
import org.acme.dto.MetaDTO;
import org.acme.entity.PlanoTrabalho;
import org.acme.entity.PlanoTrabalhoHistorico;
import org.acme.entity.Emenda;
import org.acme.repository.EmendaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PlanoTrabalhoService {

    @Inject
    MetaService metaService;

    @Inject
    ItemService itemService;

    @Inject
    EmendaRepository emendaRepository;

    @Transactional
    public List<PlanoTrabalhoDTO> listByInstituicao(String instituicaoId) {
        return PlanoTrabalho.find("instituicaoId", instituicaoId).stream()
                .map(o -> (PlanoTrabalho) o)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PlanoTrabalhoDTO> listAll() {
        return PlanoTrabalho.findAll().stream()
                .map(o -> (PlanoTrabalho) o)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PlanoTrabalhoDTO findById(String id) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        return p == null ? null : toDto(p);
    }

    public FullPlanoTrabalhoDTO findFullById(String id) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        if (p == null) return null;
        List<MetaDTO> metas = metaService.listByPlano(p.id);
        return new FullPlanoTrabalhoDTO(p.id, p.titulo, p.descricao, p.instituicaoId, p.valor, p.status, p.createTime, p.updateTime, metas);
    }

    @Transactional
    public PlanoTrabalhoDTO create(PlanoTrabalhoDTO dto, String usuario) {
        if (dto.instituicaoId() == null || dto.instituicaoId().isBlank()) {
            throw new IllegalArgumentException("Instituição é obrigatória");
        }
        if (dto.emendaId() != null && !dto.emendaId().isBlank()) {
            PlanoTrabalho existingForEmenda = PlanoTrabalho.find("emendaId", dto.emendaId()).firstResult();
            if (existingForEmenda != null) {
                throw new IllegalArgumentException("Esta emenda já possui um plano de trabalho vinculado");
            }
            Emenda em = emendaRepository.findById(dto.emendaId());
            if (em == null) {
                throw new IllegalArgumentException("Emenda informada não encontrada");
            }
            if (em.institutionId == null || !em.institutionId.equals(dto.instituicaoId())) {
                throw new IllegalArgumentException("A emenda não pertence à instituição informada");
            }
        }
        PlanoTrabalho p = new PlanoTrabalho();
        p.titulo = dto.titulo();
        p.descricao = dto.descricao();
        p.instituicaoId = dto.instituicaoId();
        p.valor = dto.valor();
        p.status = dto.status() == null ? "RASCUNHO" : dto.status();
        p.emendaId = dto.emendaId();
        p.persist();

        PlanoTrabalhoHistorico h = new PlanoTrabalhoHistorico();
        h.planoTrabalhoId = p.id;
        h.acao = "CREATE";
        h.usuario = usuario;
        h.persist();

        return toDto(p);
    }

    @Transactional
    public PlanoTrabalhoDTO update(String id, PlanoTrabalhoDTO dto, String usuario) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        if (p == null) return null;
        // Prevent changes when plan is finalized
        if ("APROVADO".equals(p.status) || "FECHADO".equals(p.status)) {
            throw new IllegalArgumentException("Não é possível atualizar um plano que já foi aprovado ou encerrado.");
        }
        p.titulo = dto.titulo();
        p.descricao = dto.descricao();
        p.valor = dto.valor();
        p.status = dto.status();

        PlanoTrabalhoHistorico h = new PlanoTrabalhoHistorico();
        h.planoTrabalhoId = p.id;
        h.acao = "UPDATE";
        h.usuario = usuario;
        h.persist();

        return toDto(p);
    }

    @Transactional
    public boolean delete(String id, String usuario) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        if (p == null) return false;
        p.delete();

        PlanoTrabalhoHistorico h = new PlanoTrabalhoHistorico();
        h.planoTrabalhoId = id;
        h.acao = "DELETE";
        h.usuario = usuario;
        h.persist();

        return true;
    }

    @Transactional
    public PlanoTrabalhoDTO aprovar(String id, String motivo, String usuario) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        if (p == null) return null;
        p.status = "APROVADO";

        PlanoTrabalhoHistorico h = new PlanoTrabalhoHistorico();
        h.planoTrabalhoId = p.id;
        h.acao = "APROVAR";
        h.motivo = motivo;
        h.usuario = usuario;
        h.persist();

        return toDto(p);
    }

    @Transactional
    public PlanoTrabalhoDTO reprovar(String id, String motivo, String usuario) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        if (p == null) return null;
        p.status = "REPROVADO";

        PlanoTrabalhoHistorico h = new PlanoTrabalhoHistorico();
        h.planoTrabalhoId = p.id;
        h.acao = "REPROVAR";
        h.motivo = motivo;
        h.usuario = usuario;
        h.persist();

        return toDto(p);
    }

    @Transactional
    public PlanoTrabalhoDTO enviarParaAprovacao(String id, String usuario) {
        PlanoTrabalho p = PlanoTrabalho.findById(id);
        if (p == null) return null;

        // 1) metas exist
        List<MetaDTO> metas = metaService.listByPlano(p.id);
        if (metas == null || metas.isEmpty()) {
            throw new IllegalArgumentException("O plano deve conter ao menos 1 meta antes de enviar para aprovação.");
        }

        // 2) each meta must have items
        for (MetaDTO m : metas) {
            var items = itemService.listByMeta(m.id());
            if (items == null || items.isEmpty()) {
                throw new IllegalArgumentException("A meta '" + (m.titulo() == null ? m.id() : m.titulo()) + "' deve ter ao menos 1 item.");
            }
        }

        // 3) total metas >= emenda value (if exists)
        BigDecimal total = metas.stream().map(md -> md.valor() == null ? BigDecimal.ZERO : md.valor()).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (p.emendaId != null && !p.emendaId.isBlank()) {
            Emenda em = emendaRepository.findById(p.emendaId);
            if (em != null && em.value != null) {
                if (total.compareTo(em.value) < 0) {
                    throw new IllegalArgumentException("Total do plano (" + total + ") é menor que o valor da emenda (" + em.value + ").");
                }
            }
        }

        p.status = "ENVIADO";

        PlanoTrabalhoHistorico h = new PlanoTrabalhoHistorico();
        h.planoTrabalhoId = p.id;
        h.acao = "ENVIAR_PARA_APROVACAO";
        h.usuario = usuario;
        h.persist();

        return toDto(p);
    }

    public boolean existsByEmendaId(String emendaId) {
        if (emendaId == null || emendaId.isBlank()) return false;
        PlanoTrabalho existing = PlanoTrabalho.find("emendaId", emendaId).firstResult();
        return existing != null;
    }

    private PlanoTrabalhoDTO toDto(PlanoTrabalho p) {
        // Enrich with emenda data if linked
        String emendaCodigo = null;
        BigDecimal emendaValor = null;
        if (p.emendaId != null && !p.emendaId.isBlank()) {
            Emenda em = emendaRepository.findById(p.emendaId);
            if (em != null) {
                emendaCodigo = em.officialCode;
                emendaValor  = em.value;
            }
        }
        return new PlanoTrabalhoDTO(
            p.id, p.titulo, p.descricao,
            p.emendaId, emendaCodigo, emendaValor,
            p.instituicaoId, p.valor, p.status,
            p.createTime, p.updateTime
        );
    }
}
