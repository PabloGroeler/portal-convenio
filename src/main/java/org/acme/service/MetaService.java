package org.acme.service;

import org.acme.dto.MetaDTO;
import org.acme.entity.Meta;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class MetaService {

    public List<MetaDTO> listByPlano(String planoId) {
        return Meta.find("planoTrabalhoId", planoId).stream()
                .map(o -> (Meta)o)
                .map(m -> toDto(m))
                .collect(Collectors.toList());
    }

    @Transactional
    public MetaDTO create(MetaDTO dto) {
        Meta m = new Meta();
        m.planoTrabalhoId = dto.planoTrabalhoId();
        m.titulo = dto.titulo();
        m.descricao = dto.descricao();
        m.valor = dto.valor();
        m.persist();
        return toDto(m);
    }

    @Transactional
    public MetaDTO update(String id, MetaDTO dto) {
        Meta m = Meta.findById(id);
        if (m == null) return null;
        m.titulo = dto.titulo();
        m.descricao = dto.descricao();
        m.valor = dto.valor();
        return toDto(m);
    }

    @Transactional
    public boolean delete(String id) {
        Meta m = Meta.findById(id);
        if (m == null) return false;
        m.delete();
        return true;
    }

    private MetaDTO toDto(Meta m) {
        return new MetaDTO(m.id, m.planoTrabalhoId, m.titulo, m.descricao, m.valor, m.createTime, m.updateTime);
    }
}
