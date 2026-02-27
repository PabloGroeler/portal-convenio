package org.acme.service;

import org.acme.dto.PrestacaoContaDTO;
import org.acme.entity.PrestacaoConta;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PrestacaoContaService {

    public List<PrestacaoContaDTO> listByPlano(String planoId) {
        return PrestacaoConta.find("planoTrabalhoId", planoId).stream()
                .map(o -> (PrestacaoConta)o)
                .map(pc -> toDto(pc))
                .collect(Collectors.toList());
    }

    @Transactional
    public PrestacaoContaDTO create(PrestacaoContaDTO dto) {
        PrestacaoConta pc = new PrestacaoConta();
        pc.planoTrabalhoId = dto.planoTrabalhoId();
        pc.valorExecutado = dto.valorExecutado();
        pc.observacoes = dto.observacoes();
        pc.persist();
        return toDto(pc);
    }

    @Transactional
    public PrestacaoContaDTO update(String id, PrestacaoContaDTO dto) {
        PrestacaoConta pc = PrestacaoConta.findById(id);
        if (pc == null) return null;
        pc.valorExecutado = dto.valorExecutado();
        pc.observacoes = dto.observacoes();
        return toDto(pc);
    }

    @Transactional
    public boolean delete(String id) {
        PrestacaoConta pc = PrestacaoConta.findById(id);
        if (pc == null) return false;
        pc.delete();
        return true;
    }

    private PrestacaoContaDTO toDto(PrestacaoConta pc) {
        return new PrestacaoContaDTO(pc.id, pc.planoTrabalhoId, pc.valorExecutado, pc.observacoes, pc.createTime, pc.updateTime);
    }
}
