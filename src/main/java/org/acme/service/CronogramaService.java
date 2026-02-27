package org.acme.service;

import org.acme.dto.CronogramaDTO;
import org.acme.entity.Cronograma;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CronogramaService {

    public List<CronogramaDTO> listByMeta(String metaId) {
        return Cronograma.find("metaId", metaId).stream()
                .map(o -> (Cronograma)o)
                .map(c -> toDto(c))
                .collect(Collectors.toList());
    }

    @Transactional
    public CronogramaDTO create(CronogramaDTO dto) {
        Cronograma c = new Cronograma();
        c.metaId = dto.metaId();
        c.dataPrevista = dto.dataPrevista();
        c.atividade = dto.atividade();
        c.persist();
        return toDto(c);
    }

    @Transactional
    public CronogramaDTO update(String id, CronogramaDTO dto) {
        Cronograma c = Cronograma.findById(id);
        if (c == null) return null;
        c.dataPrevista = dto.dataPrevista();
        c.atividade = dto.atividade();
        return toDto(c);
    }

    @Transactional
    public boolean delete(String id) {
        Cronograma c = Cronograma.findById(id);
        if (c == null) return false;
        c.delete();
        return true;
    }

    private CronogramaDTO toDto(Cronograma c) {
        return new CronogramaDTO(c.id, c.metaId, c.dataPrevista, c.atividade, c.createTime, c.updateTime);
    }
}
