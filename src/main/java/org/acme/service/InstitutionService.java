package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Instituicao;
import org.acme.repository.InstitutionRepository;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class InstitutionService {

    @Inject
    InstitutionRepository institutionRepository;

    public List<Instituicao> listAll() {
        return institutionRepository.listAllOrdered();
    }

    public Instituicao findById(String id) {
        if (id == null || id.isBlank()) return null;
        return institutionRepository.findById(id);
    }

    public Instituicao findByInstitutionId(String institutionId) {
        return institutionRepository.findByInstitutionId(institutionId);
    }

    @Transactional
    public Instituicao create(Instituicao instituicao) {
        instituicao.dataCriacao = OffsetDateTime.now();
        instituicao.dataAtualizacao = OffsetDateTime.now();
        institutionRepository.persist(instituicao);
        institutionRepository.flush();
        return instituicao;
    }

    @Transactional
    public Instituicao update(String id, Instituicao updated) {
        Instituicao existing = institutionRepository.findById(id);
        if (existing == null) return null;

        applyUpdates(existing, updated);
        existing.dataAtualizacao = OffsetDateTime.now();

        return existing;
    }

    @Transactional
    public Instituicao updateStringId(String institutionId, Instituicao updated) {
        if (institutionId == null || institutionId.isBlank()) return null;
        Instituicao existing = institutionRepository.findByInstitutionId(institutionId);
        if (existing == null) return null;

        applyUpdates(existing, updated);
        existing.dataAtualizacao = OffsetDateTime.now();
        return existing;
    }

    private void applyUpdates(Instituicao existing, Instituicao updated) {
        // Important: do NOT overwrite the primary key unless explicitly required.
        if (updated.institutionId != null && !updated.institutionId.isBlank()) {
            existing.institutionId = updated.institutionId;
        }

        existing.razaoSocial = updated.razaoSocial;
        existing.nomeFantasia = updated.nomeFantasia;
        existing.cnpj = updated.cnpj;
        existing.inscricaoEstadual = updated.inscricaoEstadual;
        existing.inscricaoMunicipal = updated.inscricaoMunicipal;
        existing.dataFundacao = updated.dataFundacao;
        existing.areasAtuacao = updated.areasAtuacao != null ? updated.areasAtuacao : existing.areasAtuacao;

        existing.telefone = updated.telefone;
        existing.celular = updated.celular;
        existing.emailInstitucional = updated.emailInstitucional;
        existing.emailSecundario = updated.emailSecundario;
        existing.website = updated.website;

        existing.cep = updated.cep;
        existing.logradouro = updated.logradouro;
        existing.numero = updated.numero;
        existing.complemento = updated.complemento;
        existing.bairro = updated.bairro;
        existing.cidade = updated.cidade;
        existing.uf = updated.uf;
        existing.pontoReferencia = updated.pontoReferencia;

        existing.numeroRegistroConselhoMunicipal = updated.numeroRegistroConselhoMunicipal;
        existing.dataRegistroConselho = updated.dataRegistroConselho;
        existing.objetoSocial = updated.objetoSocial;
        existing.quantidadeBeneficiarios = updated.quantidadeBeneficiarios;
    }

    @Transactional
    public boolean delete(String id) {
        Instituicao existing = institutionRepository.findById(id);
        if (existing == null) return false;
        institutionRepository.delete(existing);
        return true;
    }
}
