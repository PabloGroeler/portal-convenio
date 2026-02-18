package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.DocumentoInstitucionalDTO;
import org.acme.entity.DocumentoInstitucional;
import org.acme.repository.DocumentoInstitucionalRepository;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class DocumentoInstitucionalService {

    @Inject
    DocumentoInstitucionalRepository repository;

    // Diretório base para armazenar arquivos (pode ser configurado via application.properties)
    private static final String UPLOAD_DIR = System.getProperty("user.home") + "/uploads/documentos-institucionais";

    public List<DocumentoInstitucionalDTO> listarPorInstituicao(String idInstituicao) {
        return repository.findByInstituicao(idInstituicao).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentoInstitucionalDTO upload(
            String idInstituicao,
            String nomeOriginal,
            String tipoDocumento,
            String tipoMime,
            String descricao,
            InputStream fileInputStream,
            long tamanhoBytes,
            String usuarioUpload
    ) throws IOException {
        // Criar diretório se não existir
        Path uploadPath = Paths.get(UPLOAD_DIR, idInstituicao);
        Files.createDirectories(uploadPath);

        // Gerar nome único para o arquivo
        String extensao = obterExtensao(nomeOriginal);
        String nomeArquivo = UUID.randomUUID() + extensao;
        Path filePath = uploadPath.resolve(nomeArquivo);

        // Salvar arquivo no disco
        Files.copy(fileInputStream, filePath, StandardCopyOption.REPLACE_EXISTING);

        // Criar entidade
        DocumentoInstitucional documento = new DocumentoInstitucional();
        documento.setId(UUID.randomUUID().toString());
        documento.setIdInstituicao(idInstituicao);
        documento.setNomeArquivo(nomeArquivo);
        documento.setNomeOriginal(nomeOriginal);
        documento.setTipoDocumento(tipoDocumento);
        documento.setTipoMime(tipoMime);
        documento.setTamanhoBytes(tamanhoBytes);
        documento.setDescricao(descricao);
        documento.setCaminhoArquivo(idInstituicao + "/" + nomeArquivo);
        documento.setDataUpload(LocalDateTime.now());
        documento.setUsuarioUpload(usuarioUpload);

        repository.persist(documento);

        return toDTO(documento);
    }

    @Transactional
    public void deletar(String id) throws IOException {
        DocumentoInstitucional documento = repository.findById(id);
        if (documento != null) {
            // Deletar arquivo físico
            Path filePath = Paths.get(UPLOAD_DIR, documento.getCaminhoArquivo());
            Files.deleteIfExists(filePath);

            // Deletar do banco
            repository.deleteByDocumentoId(id);
        }
    }

    public File obterArquivo(String id) {
        DocumentoInstitucional documento = repository.findById(id);
        if (documento == null) {
            return null;
        }
        Path filePath = Paths.get(UPLOAD_DIR, documento.getCaminhoArquivo());
        return filePath.toFile();
    }

    public DocumentoInstitucional obterDocumento(String id) {
        return repository.findById(id);
    }

    @Transactional
    public DocumentoInstitucionalDTO aprovarDocumento(String id, String observacoes) {
        DocumentoInstitucional documento = repository.findById(id);
        if (documento == null) {
            throw new RuntimeException("Documento não encontrado: " + id);
        }

        // Validar se o documento já está aprovado
        if ("APROVADO".equals(documento.getStatusDocumento())) {
            throw new RuntimeException("Documento já está aprovado");
        }

        // Validar se o documento está reprovado (não pode aprovar um documento reprovado)
        if ("REPROVADO".equals(documento.getStatusDocumento())) {
            throw new RuntimeException("Não é possível aprovar um documento que foi reprovado. O documento precisa ser reenviado.");
        }

        documento.setStatusDocumento("APROVADO");
        documento.setObservacoes(observacoes);
        documento.setDataAprovacao(LocalDateTime.now());
        // Limpar campos de reprovação caso existam
        documento.setMotivoReprovacao(null);
        documento.setDataReprovacao(null);
        repository.persist(documento);

        return toDTO(documento);
    }

    @Transactional
    public DocumentoInstitucionalDTO reprovarDocumento(String id, String motivo) {
        DocumentoInstitucional documento = repository.findById(id);
        if (documento == null) {
            throw new RuntimeException("Documento não encontrado: " + id);
        }

        // Validar se o documento já está reprovado
        if ("REPROVADO".equals(documento.getStatusDocumento())) {
            throw new RuntimeException("Documento já está reprovado");
        }

        // Validar se o documento está aprovado (não pode reprovar um documento aprovado)
        if ("APROVADO".equals(documento.getStatusDocumento())) {
            throw new RuntimeException("Não é possível reprovar um documento que foi aprovado. Se necessário, solicite novo envio.");
        }

        documento.setStatusDocumento("REPROVADO");
        documento.setMotivoReprovacao(motivo);
        documento.setDataReprovacao(LocalDateTime.now());
        // Limpar campos de aprovação caso existam
        documento.setObservacoes(null);
        documento.setDataAprovacao(null);
        repository.persist(documento);

        return toDTO(documento);
    }

    private String obterExtensao(String nomeArquivo) {
        int lastDot = nomeArquivo.lastIndexOf('.');
        return lastDot > 0 ? nomeArquivo.substring(lastDot) : "";
    }

    private DocumentoInstitucionalDTO toDTO(DocumentoInstitucional entity) {
        DocumentoInstitucionalDTO dto = new DocumentoInstitucionalDTO();
        dto.setId(entity.getId());
        dto.setIdInstituicao(entity.getIdInstituicao());
        dto.setNomeArquivo(entity.getNomeArquivo());
        dto.setNomeOriginal(entity.getNomeOriginal());
        dto.setTipoDocumento(entity.getTipoDocumento());
        dto.setTipoMime(entity.getTipoMime());
        dto.setTamanhoBytes(entity.getTamanhoBytes());
        dto.setDescricao(entity.getDescricao());
        dto.setDataUpload(entity.getDataUpload());
        dto.setUsuarioUpload(entity.getUsuarioUpload());
        dto.setStatusDocumento(entity.getStatusDocumento());
        dto.setObservacoes(entity.getObservacoes());
        dto.setMotivoReprovacao(entity.getMotivoReprovacao());
        dto.setDataAprovacao(entity.getDataAprovacao());
        dto.setDataReprovacao(entity.getDataReprovacao());
        dto.setNumeroDocumento(entity.getNumeroDocumento());
        dto.setDataEmissao(entity.getDataEmissao());
        dto.setDataValidade(entity.getDataValidade());
        return dto;
    }
}

