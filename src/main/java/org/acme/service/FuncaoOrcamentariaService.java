package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.acme.entity.FuncaoOrcamentaria;
import org.acme.repository.FuncaoOrcamentariaRepository;

import java.util.List;

@ApplicationScoped
public class FuncaoOrcamentariaService {

    @Inject
    FuncaoOrcamentariaRepository repository;

    public List<FuncaoOrcamentaria> listAll() {
        return repository.listAllAtivos();
    }

    public FuncaoOrcamentaria findByCodigo(String codigo) {
        return repository.findByCodigo(codigo);
    }
}

