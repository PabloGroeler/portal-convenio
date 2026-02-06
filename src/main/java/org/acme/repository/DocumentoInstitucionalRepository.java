package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.DocumentoInstitucional;

import java.util.List;

@ApplicationScoped
public class DocumentoInstitucionalRepository implements PanacheRepositoryBase<DocumentoInstitucional, String> {

    public List<DocumentoInstitucional> findByInstituicao(String idInstituicao) {
        return list("idInstituicao = ?1 order by dataUpload desc", idInstituicao);
    }

    public List<DocumentoInstitucional> findByInstituicaoAndTipo(String idInstituicao, String tipoDocumento) {
        return list("idInstituicao = ?1 and tipoDocumento = ?2 order by dataUpload desc", idInstituicao, tipoDocumento);
    }

    public long deleteByDocumentoId(String id) {
        return delete("id", id);
    }
}

