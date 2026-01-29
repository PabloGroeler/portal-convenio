package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.TipoEmenda;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class TipoEmendaRepository implements PanacheRepository<TipoEmenda> {

    public List<TipoEmenda> listAtivosOrdenado() {
        return find("ativo = true order by ordem asc, nome asc").list();
    }

    public Optional<TipoEmenda> findAtivoByCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) return Optional.empty();
        return find("codigo = ?1 and ativo = true", codigo).firstResultOptional();
    }
}
