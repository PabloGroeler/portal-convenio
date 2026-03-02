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

    public SecretariaMunicipal findById(Long id) {
        if (id == null) return null;
        return repository.findById(id);
    }

    @Transactional
    public SecretariaMunicipal create(SecretariaMunicipal s) {
        if (s.createTime == null) {
            s.createTime = OffsetDateTime.now();
        }
        s.updateTime = OffsetDateTime.now();
        repository.persist(s);
        return s;
    }

    @Transactional
    public SecretariaMunicipal update(Long id, SecretariaMunicipal input) {
        SecretariaMunicipal existing = repository.findById(id);
        if (existing == null) return null;

        existing.nome = input.nome;
        existing.codigo = input.codigo;
        existing.descricao = input.descricao;
        existing.updateTime = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public SecretariaMunicipal setAtivo(Long id, boolean ativo) {
        SecretariaMunicipal existing = repository.findById(id);
        if (existing == null) return null;
        existing.ativo = ativo;
        existing.updateTime = OffsetDateTime.now();
        return existing;
    }
}
