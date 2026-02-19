package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.DocumentoPessoal;

import java.util.List;

@ApplicationScoped
public class DocumentoPessoalRepository implements PanacheRepositoryBase<DocumentoPessoal, String> {

    /**
     * Buscar todos os documentos de um dirigente
     */
    public List<DocumentoPessoal> findByDirigente(String dirigenteId) {
        return list("dirigenteId = ?1 ORDER BY dataUpload DESC", dirigenteId);
    }

    /**
     * Buscar documentos por tipo de um dirigente específico
     */
    public List<DocumentoPessoal> findByDirigenteAndTipo(String dirigenteId, String tipoDocumento) {
        return list("dirigenteId = ?1 AND tipoDocumento = ?2 ORDER BY dataUpload DESC",
                    dirigenteId, tipoDocumento);
    }

    /**
     * Buscar documento por tipo (retorna o mais recente se houver múltiplos)
     */
    public DocumentoPessoal findByDirigenteAndTipoUnico(String dirigenteId, String tipoDocumento) {
        return find("dirigenteId = ?1 AND tipoDocumento = ?2 ORDER BY dataUpload DESC",
                    dirigenteId, tipoDocumento)
                .firstResult();
    }

    /**
     * Buscar documentos por status
     */
    public List<DocumentoPessoal> findByStatus(String statusDocumento) {
        return list("statusDocumento = ?1 ORDER BY dataUpload DESC", statusDocumento);
    }

    /**
     * Buscar documentos pendentes de um dirigente
     */
    public List<DocumentoPessoal> findPendentesByDirigente(String dirigenteId) {
        return list("dirigenteId = ?1 AND statusDocumento = 'PENDENTE' ORDER BY dataUpload DESC",
                    dirigenteId);
    }

    /**
     * Verificar se dirigente tem todos os documentos aprovados
     */
    public boolean hasAllDocumentosAprovados(String dirigenteId, List<String> tiposObrigatorios) {
        for (String tipo : tiposObrigatorios) {
            DocumentoPessoal doc = findByDirigenteAndTipoUnico(dirigenteId, tipo);
            if (doc == null || !"APROVADO".equals(doc.getStatusDocumento())) {
                return false;
            }
        }
        return true;
    }

    /**
     * Contar documentos por status de um dirigente
     */
    public long countByDirigenteAndStatus(String dirigenteId, String statusDocumento) {
        return count("dirigenteId = ?1 AND statusDocumento = ?2", dirigenteId, statusDocumento);
    }
}
