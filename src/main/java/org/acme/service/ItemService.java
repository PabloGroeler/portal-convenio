package org.acme.service;

import org.acme.dto.ItemDTO;
import org.acme.entity.Item;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ItemService {

    public List<ItemDTO> listByMeta(String metaId) {
        return Item.find("metaId", metaId).stream()
                .map(o -> (Item)o)
                .map(i -> toDto(i))
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemDTO create(ItemDTO dto) {
        Item it = new Item();
        it.metaId = dto.metaId();
        it.titulo = dto.titulo();
        it.descricao = dto.descricao();
        it.valor = dto.valor();
        it.periodo = dto.periodo();
        it.persist();
        return toDto(it);
    }

    @Transactional
    public ItemDTO update(String id, ItemDTO dto) {
        Item it = Item.findById(id);
        if (it == null) return null;
        it.titulo = dto.titulo();
        it.descricao = dto.descricao();
        it.valor = dto.valor();
        it.periodo = dto.periodo();
        return toDto(it);
    }

    @Transactional
    public boolean delete(String id) {
        Item it = Item.findById(id);
        if (it == null) return false;
        it.delete();
        return true;
    }

    private ItemDTO toDto(Item it) {
        return new ItemDTO(it.id, it.metaId, it.titulo, it.descricao, it.valor, it.periodo, it.createTime, it.updateTime);
    }
}
