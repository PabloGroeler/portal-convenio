package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.DocumentoInstitucionalDTO;
import org.acme.entity.DocumentoInstitucional;
import org.acme.repository.DocumentoInstitucionalRepository;
import org.jboss.logging.Logger;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
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

    private static final Logger log = Logger.getLogger(DocumentoInstitucionalService.class);

    @Inject
    DocumentoInstitucionalRepository repository;

    // Base dir from .env UPLOAD_DIR — subdir appended here
    private static final String BASE_DIR = System.getenv("UPLOAD_DIR") != null
            ? System.getenv("UPLOAD_DIR") + "/documentos-institucionais"
            : "/var/uploads/documentos-institucionais";

    // ── LIST ─────────────────────────────────────────────────────────────────

    public List<DocumentoInstitucionalDTO> listarPorInstituicao(String idInstituicao) {
        return repository.findByInstituicao(idInstituicao).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── UPLOAD ────────────────────────────────────────────────────────────────

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

        // Save file to disk
        Path dir = Paths.get(BASE_DIR, idInstituicao);
        Files.createDirectories(dir);

        String ext = extensao(nomeOriginal);
        String nomeArquivo = UUID.randomUUID() + ext;
        Path dest = dir.resolve(nomeArquivo);

        Files.copy(fileInputStream, dest, StandardCopyOption.REPLACE_EXISTING);
        log.infof("✅ Arquivo salvo: %s", dest);

        // Persist record
        DocumentoInstitucional doc = new DocumentoInstitucional();
        doc.setId(UUID.randomUUID().toString());
        doc.setIdInstituicao(idInstituicao);
        doc.setNomeArquivo(nomeArquivo);
        doc.setNomeOriginal(nomeOriginal);
        doc.setTipoDocumento(tipoDocumento);
        doc.setTipoMime(tipoMime);
        doc.setTamanhoBytes(tamanhoBytes);
        doc.setDescricao(descricao);
        doc.setCaminhoArquivo(idInstituicao + "/" + nomeArquivo);
        doc.setDataUpload(LocalDateTime.now());
        doc.setUsuarioUpload(usuarioUpload);
        doc.setStatusDocumento("PENDENTE");

        repository.persist(doc);
        return toDTO(doc);
    }

    // ── GET FILE ──────────────────────────────────────────────────────────────

    public File obterArquivo(String id) {
        DocumentoInstitucional doc = repository.findById(id);
        if (doc == null) {
            log.warnf("Documento não encontrado no banco: %s", id);
            return null;
        }
        Path p = Paths.get(BASE_DIR, doc.getCaminhoArquivo());
        log.infof("🔍 Buscando arquivo: %s (existe: %s)", p, p.toFile().exists());
        return p.toFile();
    }

    public DocumentoInstitucional obterDocumento(String id) {
        return repository.findById(id);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Transactional
    public void deletar(String id) throws IOException {
        DocumentoInstitucional doc = repository.findById(id);
        if (doc != null) {
            Path p = Paths.get(BASE_DIR, doc.getCaminhoArquivo());
            Files.deleteIfExists(p);
            repository.deleteByDocumentoId(id);
        }
    }

    // ── APPROVE / REJECT ─────────────────────────────────────────────────────

    @Transactional
    public DocumentoInstitucionalDTO aprovarDocumento(String id, String observacoes) {
        DocumentoInstitucional doc = repository.findById(id);
        if (doc == null) throw new RuntimeException("Documento não encontrado: " + id);
        doc.setStatusDocumento("APROVADO");
        doc.setObservacoes(observacoes);
        doc.setDataAprovacao(LocalDateTime.now());
        doc.setMotivoReprovacao(null);
        doc.setDataReprovacao(null);
        repository.persist(doc);
        return toDTO(doc);
    }

    @Transactional
    public DocumentoInstitucionalDTO reprovarDocumento(String id, String motivo) {
        DocumentoInstitucional doc = repository.findById(id);
        if (doc == null) throw new RuntimeException("Documento não encontrado: " + id);
        doc.setStatusDocumento("REPROVADO");
        doc.setMotivoReprovacao(motivo);
        doc.setDataReprovacao(LocalDateTime.now());
        doc.setObservacoes(null);
        doc.setDataAprovacao(null);
        repository.persist(doc);
        return toDTO(doc);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private String extensao(String nome) {
        int i = nome.lastIndexOf('.');
        return i > 0 ? nome.substring(i) : "";
    }

    private DocumentoInstitucionalDTO toDTO(DocumentoInstitucional e) {
        DocumentoInstitucionalDTO dto = new DocumentoInstitucionalDTO();
        dto.setId(e.getId());
        dto.setIdInstituicao(e.getIdInstituicao());
        dto.setNomeArquivo(e.getNomeArquivo());
        dto.setNomeOriginal(e.getNomeOriginal());
        dto.setTipoDocumento(e.getTipoDocumento());
        dto.setTipoMime(e.getTipoMime());
        dto.setTamanhoBytes(e.getTamanhoBytes());
        dto.setDescricao(e.getDescricao());
        dto.setDataUpload(e.getDataUpload());
        dto.setUsuarioUpload(e.getUsuarioUpload());
        dto.setStatusDocumento(e.getStatusDocumento());
        dto.setObservacoes(e.getObservacoes());
        dto.setMotivoReprovacao(e.getMotivoReprovacao());
        dto.setDataAprovacao(e.getDataAprovacao());
        dto.setDataReprovacao(e.getDataReprovacao());
        dto.setNumeroDocumento(e.getNumeroDocumento());
        dto.setDataEmissao(e.getDataEmissao());
        dto.setDataValidade(e.getDataValidade());
        return dto;
    }
}
