package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.FuncaoOrcamentaria;

import java.util.List;

@ApplicationScoped
public class FuncaoOrcamentariaRepository implements PanacheRepository<FuncaoOrcamentaria> {

    public List<FuncaoOrcamentaria> listAllAtivos() {
        return find("ativo = true", Sort.by("codigo")).list();
    }

    public FuncaoOrcamentaria findByCodigo(String codigo) {
        return find("codigo", codigo).firstResult();
    }
}


