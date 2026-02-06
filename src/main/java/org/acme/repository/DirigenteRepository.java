package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.Dirigente;

import java.util.List;

@ApplicationScoped
public class DirigenteRepository implements PanacheRepositoryBase<Dirigente, String> {

    public List<Dirigente> findByInstituicao(String instituicaoId) {
        return list("instituicaoId = ?1 order by dataCriacao desc", instituicaoId);
    }

    public List<Dirigente> findAtivosByInstituicao(String instituicaoId) {
        return list("instituicaoId = ?1 and statusCargo = 'Ativo' order by dataCriacao desc", instituicaoId);
    }

    public Dirigente findByCpf(String cpf) {
        return find("cpf", cpf).firstResult();
    }

    public List<Dirigente> findByCargoAtivoInInstituicao(String instituicaoId, String cargo) {
        return list("instituicaoId = ?1 and cargo = ?2 and statusCargo = 'Ativo'", instituicaoId, cargo);
    }

    public long countCargoAtivoInInstituicao(String instituicaoId, String cargo) {
        return count("instituicaoId = ?1 and cargo = ?2 and statusCargo = 'Ativo'", instituicaoId, cargo);
    }
}

