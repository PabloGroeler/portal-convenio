package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.SecretariaMunicipal;
import org.acme.repository.SecretariaMunicipalRepository;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class SecretariaMunicipalService {

    @Inject
    SecretariaMunicipalRepository repository;

    public List<SecretariaMunicipal> listAll() {
        return repository.listAllOrdered();
    }

    public SecretariaMunicipal findById(String id) {
        if (id == null) return null;
        return repository.findById(id);
    }

    @Transactional
    public SecretariaMunicipal create(SecretariaMunicipal s) {
        if (s.dataCriacao == null) {
            s.dataCriacao = OffsetDateTime.now();
        }
        s.dataAtualizacao = OffsetDateTime.now();
        repository.persist(s);
        return s;
    }

    @Transactional
    public SecretariaMunicipal update(String id, SecretariaMunicipal input) {
        SecretariaMunicipal existing = repository.findById(id);
        if (existing == null) return null;

        existing.nome = input.nome;
        existing.sigla = input.sigla;
        existing.email = input.email;
        existing.telefone = input.telefone;
        existing.dataAtualizacao = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public SecretariaMunicipal setAtivo(String id, boolean ativo) {
        SecretariaMunicipal existing = repository.findById(id);
        if (existing == null) return null;
        existing.ativo = ativo;
        existing.dataAtualizacao = OffsetDateTime.now();
        return existing;
    }
}

