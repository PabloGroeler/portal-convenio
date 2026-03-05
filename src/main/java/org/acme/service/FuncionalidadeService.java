package org.acme.service;

import org.acme.dto.FuncionalidadeDTO;
import org.acme.entity.Funcionalidade;
import org.acme.repository.FuncionalidadeRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class FuncionalidadeService {

    @Inject
    FuncionalidadeRepository repo;

    public List<FuncionalidadeDTO> listAll() {
        return repo.listAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<FuncionalidadeDTO> listActive() {
        return repo.listActive().stream().map(this::toDto).collect(Collectors.toList());
    }

    public FuncionalidadeDTO findById(Long id) {
        Funcionalidade f = repo.findById(id);
        return f == null ? null : toDto(f);
    }

    @Transactional
    public FuncionalidadeDTO create(String chave, String descricao, BigDecimal percentualSaude, BigDecimal percentualEducacao) {
        Funcionalidade f = new Funcionalidade();
        f.chave = chave;
        f.descricao = descricao;
        f.percentualSaude = percentualSaude != null ? percentualSaude : BigDecimal.ZERO;
        f.percentualEducacao = percentualEducacao != null ? percentualEducacao : BigDecimal.ZERO;
        f.ativo = true;
        f.createdAt = LocalDateTime.now();
        f.updatedAt = LocalDateTime.now();
        f.persist();
        return toDto(f);
    }

    @Transactional
    public FuncionalidadeDTO update(Long id, String descricao, BigDecimal percentualSaude, BigDecimal percentualEducacao, Boolean ativo) {
        Funcionalidade f = repo.findById(id);
        if (f == null) return null;
        f.descricao = descricao != null ? descricao : f.descricao;
        f.percentualSaude = percentualSaude != null ? percentualSaude : f.percentualSaude;
        f.percentualEducacao = percentualEducacao != null ? percentualEducacao : f.percentualEducacao;
        if (ativo != null) f.ativo = ativo;
        f.updatedAt = LocalDateTime.now();
        return toDto(f);
    }

    @Transactional
    public boolean delete(Long id) {
        Funcionalidade f = repo.findById(id);
        if (f == null) return false;
        f.delete();
        return true;
    }

    private FuncionalidadeDTO toDto(Funcionalidade f) {
        return new FuncionalidadeDTO(f.id, f.chave, f.descricao, f.percentualSaude, f.percentualEducacao, f.ativo, f.createdAt, f.updatedAt);
    }
}

