package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.acme.dto.DocumentoPessoalDTO;
import org.acme.entity.DocumentoPessoal;
import org.acme.repository.DocumentoPessoalRepository;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
@Slf4j
public class DocumentoPessoalService {

    @Inject
    DocumentoPessoalRepository repository;

    private static final String UPLOAD_DIR = System.getenv("UPLOAD_DIR") != null
        ? System.getenv("UPLOAD_DIR") + "/documentos-pessoais"
        : "/data2/app-emendas/documentos-pessoais";

    @Transactional
    public DocumentoPessoalDTO upload(
        String dirigenteId,
        String tipoDocumento,
        String nomeOriginal,
        String tipoMime,
        InputStream fileInputStream,
        long tamanhoBytes,
        String usuarioUpload,
        String numeroDocumento,
        LocalDate dataEmissao,
        LocalDate dataValidade,
        String descricao
    ) throws IOException {

        log.info("📤 Upload de documento: dirigente={}, tipo={}", dirigenteId, tipoDocumento);

        // Criar diretório se não existir
        Path uploadPath = Paths.get(UPLOAD_DIR, dirigenteId);
        Files.createDirectories(uploadPath);

        // Gerar nome único para o arquivo
        String extensao = obterExtensao(nomeOriginal);
        String nomeArquivo = UUID.randomUUID().toString() + extensao;
        Path filePath = uploadPath.resolve(nomeArquivo);

        // Salvar arquivo
        Files.copy(fileInputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("✅ Arquivo salvo: {}", filePath);

        // Criar entidade
        DocumentoPessoal documento = new DocumentoPessoal();
        documento.setId(UUID.randomUUID().toString());
        documento.setDirigenteId(dirigenteId);
        documento.setTipoDocumento(tipoDocumento);
        documento.setNomeArquivo(nomeArquivo);
        documento.setNomeOriginal(nomeOriginal);
        documento.setTipoMime(tipoMime);
        documento.setTamanhoBytes(tamanhoBytes);
        documento.setCaminhoArquivo(dirigenteId + "/" + nomeArquivo);
        documento.setDataUpload(LocalDateTime.now());
        documento.setUsuarioUpload(usuarioUpload);
        documento.setStatusDocumento("PENDENTE");
        documento.setNumeroDocumento(numeroDocumento);
        documento.setDataEmissao(dataEmissao);
        documento.setDataValidade(dataValidade);
        documento.setDescricao(descricao);

        repository.persist(documento);
        log.info("✅ Documento registrado no banco: id={}", documento.getId());

        return DocumentoPessoalDTO.fromEntity(documento);
    }

    public List<DocumentoPessoalDTO> listarPorDirigente(String dirigenteId) {
        return repository.findByDirigente(dirigenteId)
            .stream()
            .map(DocumentoPessoalDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public File obterArquivo(String id) throws IOException {
        DocumentoPessoal doc = repository.findById(id);
        if (doc == null) {
            throw new FileNotFoundException("Documento não encontrado: " + id);
        }

        Path filePath = Paths.get(UPLOAD_DIR, doc.getCaminhoArquivo());
        File file = filePath.toFile();

        if (!file.exists()) {
            throw new FileNotFoundException("Arquivo físico não encontrado: " + filePath);
        }

        return file;
    }

    @Transactional
    public DocumentoPessoalDTO aprovar(String id, String observacoes, String usuarioAprovador) {
        DocumentoPessoal doc = repository.findById(id);
        if (doc == null) {
            throw new IllegalArgumentException("Documento não encontrado: " + id);
        }

        doc.setStatusDocumento("APROVADO");
        doc.setObservacoes(observacoes);
        doc.setDataAprovacao(LocalDateTime.now());
        doc.setUsuarioAprovador(usuarioAprovador);

        log.info("✅ Documento aprovado: id={} por {}", id, usuarioAprovador);

        return DocumentoPessoalDTO.fromEntity(doc);
    }

    @Transactional
    public DocumentoPessoalDTO reprovar(String id, String motivo, String usuarioReprovador) {
        DocumentoPessoal doc = repository.findById(id);
        if (doc == null) {
            throw new IllegalArgumentException("Documento não encontrado: " + id);
        }

        if (motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("Motivo da reprovação é obrigatório");
        }

        doc.setStatusDocumento("REPROVADO");
        doc.setMotivoReprovacao(motivo);
        doc.setDataReprovacao(LocalDateTime.now());
        doc.setUsuarioReprovador(usuarioReprovador);

        log.info("❌ Documento reprovado: id={} por {} - Motivo: {}", id, usuarioReprovador, motivo);

        return DocumentoPessoalDTO.fromEntity(doc);
    }

    @Transactional
    public void excluir(String id) throws IOException {
        DocumentoPessoal doc = repository.findById(id);
        if (doc == null) {
            throw new IllegalArgumentException("Documento não encontrado: " + id);
        }

        // Excluir arquivo físico
        Path filePath = Paths.get(UPLOAD_DIR, doc.getCaminhoArquivo());
        Files.deleteIfExists(filePath);

        // Excluir registro do banco
        repository.delete(doc);

        log.info("🗑️ Documento excluído: id={}", id);
    }

    private String obterExtensao(String nomeArquivo) {
        int lastDot = nomeArquivo.lastIndexOf('.');
        return lastDot > 0 ? nomeArquivo.substring(lastDot) : "";
    }
}
