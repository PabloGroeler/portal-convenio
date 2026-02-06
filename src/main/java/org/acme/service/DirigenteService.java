package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.acme.dto.DirigenteDTO;
import org.acme.entity.Dirigente;
import org.acme.repository.DirigenteRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@Slf4j
public class DirigenteService {

    @Inject
    DirigenteRepository dirigenteRepository;

    /**
     * RF-03.2 - Validar regras de negócio antes de salvar
     */
    @Transactional
    public Dirigente criarDirigente(DirigenteDTO dto) throws Exception {
        log.info("Criando dirigente: {}", dto.getNomeCompleto());

        // Validar CPF único
        Dirigente existente = dirigenteRepository.findByCpf(dto.getCpf());
        if (existente != null) {
            throw new Exception("CPF já cadastrado no sistema");
        }

        // Validar regras de cargo único (Presidente e Tesoureiro)
        if ("Presidente".equals(dto.getCargo()) && "Ativo".equals(dto.getStatusCargo())) {
            long count = dirigenteRepository.countCargoAtivoInInstituicao(dto.getInstituicaoId(), "Presidente");
            if (count > 0) {
                throw new Exception("Já existe um Presidente ativo para esta instituição");
            }
        }

        if ("Tesoureiro".equals(dto.getCargo()) && "Ativo".equals(dto.getStatusCargo())) {
            long count = dirigenteRepository.countCargoAtivoInInstituicao(dto.getInstituicaoId(), "Tesoureiro");
            if (count > 0) {
                throw new Exception("Já existe um Tesoureiro ativo para esta instituição");
            }
        }

        // Criar entidade
        Dirigente dirigente = new Dirigente();
        mapDtoToEntity(dto, dirigente);

        dirigenteRepository.persist(dirigente);
        log.info("Dirigente criado com sucesso: ID {}", dirigente.getId());

        return dirigente;
    }

    @Transactional
    public Dirigente atualizarDirigente(String id, DirigenteDTO dto) throws Exception {
        log.info("Atualizando dirigente: {}", id);

        Dirigente dirigente = dirigenteRepository.findById(id);
        if (dirigente == null) {
            throw new Exception("Dirigente não encontrado");
        }

        // Validar CPF único (exceto o próprio dirigente)
        Dirigente existenteCpf = dirigenteRepository.findByCpf(dto.getCpf());
        if (existenteCpf != null && !existenteCpf.getId().equals(id)) {
            throw new Exception("CPF já cadastrado para outro dirigente");
        }

        // Validar regras de cargo único se mudou para Ativo
        if ("Ativo".equals(dto.getStatusCargo()) && !dto.getCargo().equals(dirigente.getCargo())) {
            if ("Presidente".equals(dto.getCargo())) {
                long count = dirigenteRepository.countCargoAtivoInInstituicao(dto.getInstituicaoId(), "Presidente");
                if (count > 0) {
                    throw new Exception("Já existe um Presidente ativo para esta instituição");
                }
            }

            if ("Tesoureiro".equals(dto.getCargo())) {
                long count = dirigenteRepository.countCargoAtivoInInstituicao(dto.getInstituicaoId(), "Tesoureiro");
                if (count > 0) {
                    throw new Exception("Já existe um Tesoureiro ativo para esta instituição");
                }
            }
        }

        mapDtoToEntity(dto, dirigente);
        dirigenteRepository.persist(dirigente);

        log.info("Dirigente atualizado com sucesso: {}", id);
        return dirigente;
    }

    @Transactional
    public void inativarDirigente(String id, LocalDate dataTermino, String motivo) throws Exception {
        log.info("Inativando dirigente: {}", id);

        Dirigente dirigente = dirigenteRepository.findById(id);
        if (dirigente == null) {
            throw new Exception("Dirigente não encontrado");
        }

        if (dataTermino == null) {
            throw new Exception("Data de término é obrigatória para inativar dirigente");
        }

        if (motivo == null || motivo.trim().isEmpty()) {
            throw new Exception("Motivo da inativação é obrigatório");
        }

        dirigente.setStatusCargo("Inativo");
        dirigente.setDataTerminoCargo(dataTermino);
        dirigente.setMotivoInativacao(motivo);

        dirigenteRepository.persist(dirigente);
        log.info("Dirigente inativado com sucesso: {}", id);
    }

    public List<DirigenteDTO> listarPorInstituicao(String instituicaoId) {
        List<Dirigente> dirigentes = dirigenteRepository.findByInstituicao(instituicaoId);
        return dirigentes.stream().map(this::mapEntityToDto).collect(Collectors.toList());
    }

    public List<DirigenteDTO> listarAtivosPorInstituicao(String instituicaoId) {
        List<Dirigente> dirigentes = dirigenteRepository.findAtivosByInstituicao(instituicaoId);
        return dirigentes.stream().map(this::mapEntityToDto).collect(Collectors.toList());
    }

    public DirigenteDTO buscarPorId(String id) {
        Dirigente dirigente = dirigenteRepository.findById(id);
        return dirigente != null ? mapEntityToDto(dirigente) : null;
    }

    /**
     * Verificar cargos obrigatórios não preenchidos
     */
    public List<String> verificarCargosObrigatorios(String instituicaoId) {
        List<String> avisos = new java.util.ArrayList<>();

        long presidentes = dirigenteRepository.countCargoAtivoInInstituicao(instituicaoId, "Presidente");
        if (presidentes == 0) {
            avisos.add("A instituição não possui um Presidente ativo");
        }

        long tesoureiros = dirigenteRepository.countCargoAtivoInInstituicao(instituicaoId, "Tesoureiro");
        if (tesoureiros == 0) {
            avisos.add("A instituição não possui um Tesoureiro ativo");
        }

        return avisos;
    }

    private void mapDtoToEntity(DirigenteDTO dto, Dirigente entity) {
        // Dados Pessoais
        entity.setInstituicaoId(dto.getInstituicaoId());
        entity.setNomeCompleto(dto.getNomeCompleto());
        entity.setNomeSocial(dto.getNomeSocial());
        entity.setCpf(dto.getCpf());
        entity.setRg(dto.getRg());
        entity.setOrgaoExpedidor(dto.getOrgaoExpedidor());
        entity.setUfOrgaoExpedidor(dto.getUfOrgaoExpedidor());
        entity.setDataExpedicao(dto.getDataExpedicao());
        entity.setDataNascimento(dto.getDataNascimento());
        entity.setSexo(dto.getSexo());
        entity.setNacionalidade(dto.getNacionalidade());
        entity.setEstadoCivil(dto.getEstadoCivil());

        // Cargo
        entity.setCargo(dto.getCargo());
        entity.setDataInicioCargo(dto.getDataInicioCargo());
        entity.setDataTerminoCargo(dto.getDataTerminoCargo());
        entity.setStatusCargo(dto.getStatusCargo() != null ? dto.getStatusCargo() : "Ativo");
        entity.setMotivoInativacao(dto.getMotivoInativacao());

        // Contato
        entity.setTelefone(dto.getTelefone());
        entity.setCelular(dto.getCelular());
        entity.setEmail(dto.getEmail());

        // Endereço
        entity.setCep(dto.getCep());
        entity.setLogradouro(dto.getLogradouro());
        entity.setNumero(dto.getNumero());
        entity.setComplemento(dto.getComplemento());
        entity.setBairro(dto.getBairro());
        entity.setCidade(dto.getCidade());
        entity.setUf(dto.getUf());
    }

    private DirigenteDTO mapEntityToDto(Dirigente entity) {
        DirigenteDTO dto = new DirigenteDTO();
        dto.setId(entity.getId());
        dto.setInstituicaoId(entity.getInstituicaoId());

        // Dados Pessoais
        dto.setNomeCompleto(entity.getNomeCompleto());
        dto.setNomeSocial(entity.getNomeSocial());
        dto.setCpf(entity.getCpf());
        dto.setRg(entity.getRg());
        dto.setOrgaoExpedidor(entity.getOrgaoExpedidor());
        dto.setUfOrgaoExpedidor(entity.getUfOrgaoExpedidor());
        dto.setDataExpedicao(entity.getDataExpedicao());
        dto.setDataNascimento(entity.getDataNascimento());
        dto.setSexo(entity.getSexo());
        dto.setNacionalidade(entity.getNacionalidade());
        dto.setEstadoCivil(entity.getEstadoCivil());

        // Cargo
        dto.setCargo(entity.getCargo());
        dto.setDataInicioCargo(entity.getDataInicioCargo());
        dto.setDataTerminoCargo(entity.getDataTerminoCargo());
        dto.setStatusCargo(entity.getStatusCargo());
        dto.setMotivoInativacao(entity.getMotivoInativacao());

        // Contato
        dto.setTelefone(entity.getTelefone());
        dto.setCelular(entity.getCelular());
        dto.setEmail(entity.getEmail());

        // Endereço
        dto.setCep(entity.getCep());
        dto.setLogradouro(entity.getLogradouro());
        dto.setNumero(entity.getNumero());
        dto.setComplemento(entity.getComplemento());
        dto.setBairro(entity.getBairro());
        dto.setCidade(entity.getCidade());
        dto.setUf(entity.getUf());

        return dto;
    }
}

