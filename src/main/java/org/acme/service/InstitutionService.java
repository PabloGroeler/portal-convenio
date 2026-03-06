package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.Institution;
import org.acme.repository.InstitutionRepository;
import org.acme.repository.EmendaRepository;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class InstitutionService {

    @Inject
    InstitutionRepository institutionRepository;

    @Inject
    EmendaRepository emendaRepository;

    @Inject
    EmendaNotificationService notificationService;

    public List<Institution> listAll() {
        return institutionRepository.listAllOrdered();
    }

    /**
     * Retorna instituições visíveis para o usuário com base no seu perfil:
     *  ADMIN / GESTOR     → todas
     *  OPERADOR           → apenas as vinculadas ao usuário
     *  ORCAMENTO /
     *  SECRETARIA /
     *  CONVENIOS /
     *  JURIDICO           → todas as que possuem ao menos uma emenda
     *                       (filtragem fina de emendas já acontece em EmendaService)
     */
    public List<Institution> listForUser(String username) {
        org.acme.entity.User caller = org.acme.entity.User.findByUsername(username);
        if (caller == null) return listAll();

        org.acme.entity.User.UserRole role = caller.role;

        // ADMIN e GESTOR veem tudo
        if (role == org.acme.entity.User.UserRole.ADMIN ||
            role == org.acme.entity.User.UserRole.GESTOR) {
            return listAll();
        }

        // OPERADOR: apenas instituições às quais está vinculado
        if (role == org.acme.entity.User.UserRole.OPERADOR) {
            java.util.List<org.acme.entity.UsuarioInstituicao> vinculos =
                org.acme.entity.UsuarioInstituicao.findByUsuario(caller.id);
            if (vinculos.isEmpty()) return java.util.Collections.emptyList();
            java.util.Set<String> instIds = vinculos.stream()
                .map(v -> v.instituicaoId)
                .collect(java.util.stream.Collectors.toSet());
            return listAll().stream()
                .filter(i -> instIds.contains(i.institutionId))
                .collect(java.util.stream.Collectors.toList());
        }

        // Workflow roles: instituições que aparecem em alguma emenda do sistema
        java.util.Set<String> instIdsComEmenda = emendaRepository.listAll().stream()
            .filter(em -> em.institutionId != null && !em.institutionId.isBlank())
            .map(em -> em.institutionId)
            .collect(java.util.stream.Collectors.toSet());

        if (instIdsComEmenda.isEmpty()) return java.util.Collections.emptyList();

        return listAll().stream()
            .filter(i -> instIdsComEmenda.contains(i.institutionId))
            .collect(java.util.stream.Collectors.toList());
    }

    public Institution findById(String id) {
        if (id == null || id.isBlank()) return null;
        return institutionRepository.findById(id);
    }

    public Institution findByInstitutionId(String institutionId) {
        return institutionRepository.findByInstitutionId(institutionId);
    }

    public Institution findByCnpj(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) return null;
        return institutionRepository.findByCnpj(cnpj);
    }

    @Transactional
    public Institution create(Institution institution) {
        institution.createTime = OffsetDateTime.now();
        institution.updateTime = OffsetDateTime.now();
        institutionRepository.persist(institution);
        institutionRepository.flush();
        return institution;
    }

    /**
     * Cria uma nova instituição OU atualiza uma existente se o CNPJ já estiver cadastrado.
     * Este método implementa a lógica "upsert" para evitar duplicatas de CNPJ.
     */
    @Transactional
    public Institution createOrUpdate(Institution institution) {
        // Normalizar CNPJ (apenas dígitos)
        String cnpjNormalizado = institution.cnpj != null ? institution.cnpj.replaceAll("\\D", "") : null;

        if (cnpjNormalizado == null || cnpjNormalizado.length() != 14) {
            throw new IllegalArgumentException("CNPJ inválido - deve conter 14 dígitos");
        }

        // Buscar instituição existente por CNPJ
        Institution existing = findByCnpj(cnpjNormalizado);

        if (existing != null) {
            // UPDATE: Atualizar instituição existente
            applyUpdates(existing, institution);
            existing.updateTime = OffsetDateTime.now();
            return existing;
        }

        // CREATE: Criar nova instituição
        institution.cnpj = cnpjNormalizado;
        institution.createTime = OffsetDateTime.now();
        institution.updateTime = OffsetDateTime.now();
        institutionRepository.persist(institution);
        institutionRepository.flush();
        return institution;
    }

    @Transactional
    public Institution update(String id, Institution updated) {
        return update(id, updated, "sistema");
    }

    @Transactional
    public Institution update(String id, Institution updated, String usuarioAtor) {
        Institution existing = institutionRepository.findById(id);
        if (existing == null) return null;

        applyUpdates(existing, updated);
        existing.updateTime = OffsetDateTime.now();

        notificationService.notificarAtualizacaoInstituicao(
            existing.institutionId, existing.razaoSocial, usuarioAtor);

        return existing;
    }

    @Transactional
    public Institution updateStringId(String institutionId, Institution updated) {
        return updateStringId(institutionId, updated, "sistema");
    }

    @Transactional
    public Institution updateStringId(String institutionId, Institution updated, String usuarioAtor) {
        if (institutionId == null || institutionId.isBlank()) return null;
        Institution existing = institutionRepository.findByInstitutionId(institutionId);
        if (existing == null) return null;

        applyUpdates(existing, updated);
        existing.updateTime = OffsetDateTime.now();

        notificationService.notificarAtualizacaoInstituicao(
            existing.institutionId, existing.razaoSocial, usuarioAtor);

        return existing;
    }

    private void applyUpdates(Institution existing, Institution updated) {
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
        Institution existing = institutionRepository.findById(id);
        if (existing == null) return false;
        institutionRepository.delete(existing);
        return true;
    }
}
