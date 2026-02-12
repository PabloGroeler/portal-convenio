package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.acme.dto.TipoDocumentoConfigDTO;
import org.acme.entity.TipoDocumentoConfig;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class TipoDocumentoConfigService {

    public List<TipoDocumentoConfigDTO> listarAtivos() {
        return TipoDocumentoConfig.findAllAtivos()
                .stream()
                .map(TipoDocumentoConfigDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TipoDocumentoConfigDTO> listarPorCategoria(String categoria) {
        return TipoDocumentoConfig.findByCategoria(categoria)
                .stream()
                .map(TipoDocumentoConfigDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public TipoDocumentoConfigDTO buscarPorCodigo(String codigo) {
        TipoDocumentoConfig entity = TipoDocumentoConfig.findByCodigo(codigo);
        return TipoDocumentoConfigDTO.fromEntity(entity);
    }

    @Transactional
    public TipoDocumentoConfigDTO atualizar(String codigo, TipoDocumentoConfigDTO dto) {
        System.out.println("[TipoDocumentoConfigService] Atualizando config com codigo: " + codigo);
        System.out.println("[TipoDocumentoConfigService] DTO recebido: numeroObrig=" + dto.numeroDocumentoObrigatorio +
                         ", dataEmissaoObrig=" + dto.dataEmissaoObrigatoria +
                         ", dataValidadeObrig=" + dto.dataValidadeObrigatoria);

        TipoDocumentoConfig entity = TipoDocumentoConfig.findByCodigo(codigo);
        if (entity == null) {
            throw new RuntimeException("Tipo de documento não encontrado: " + codigo);
        }

        System.out.println("[TipoDocumentoConfigService] Entity encontrada: codigo=" + entity.codigo + ", nome=" + entity.nome);
        System.out.println("[TipoDocumentoConfigService] Valores antes: numeroObrig=" + entity.numeroDocumentoObrigatorio +
                         ", dataEmissaoObrig=" + entity.dataEmissaoObrigatoria +
                         ", dataValidadeObrig=" + entity.dataValidadeObrigatoria);

        entity.obrigatorio = dto.obrigatorio;
        entity.numeroDocumentoObrigatorio = dto.numeroDocumentoObrigatorio;
        entity.dataEmissaoObrigatoria = dto.dataEmissaoObrigatoria;
        entity.dataValidadeObrigatoria = dto.dataValidadeObrigatoria;
        entity.ativo = dto.ativo;
        if (dto.ordem != null) entity.ordem = dto.ordem;
        if (dto.descricao != null) entity.descricao = dto.descricao;
        if (dto.formatosAceitos != null) entity.formatosAceitos = dto.formatosAceitos;
        if (dto.tamanhoMaximoMb != null) entity.tamanhoMaximoMb = dto.tamanhoMaximoMb;

        System.out.println("[TipoDocumentoConfigService] Valores depois: numeroObrig=" + entity.numeroDocumentoObrigatorio +
                         ", dataEmissaoObrig=" + entity.dataEmissaoObrigatoria +
                         ", dataValidadeObrig=" + entity.dataValidadeObrigatoria);

        entity.persist();
        System.out.println("[TipoDocumentoConfigService] Entity persistida com sucesso");

        return TipoDocumentoConfigDTO.fromEntity(entity);
    }

    public void validarDocumento(String codigoTipo, String numeroDocumento,
                                  String dataEmissao, String dataValidade) {
        TipoDocumentoConfig config = TipoDocumentoConfig.findByCodigo(codigoTipo);
        if (config == null) throw new RuntimeException("Tipo de documento inválido");
        if (!config.ativo) throw new RuntimeException("Tipo de documento desativado");

        StringBuilder erros = new StringBuilder();
        if (config.numeroDocumentoObrigatorio && (numeroDocumento == null || numeroDocumento.isBlank())) {
            erros.append("Número do documento é obrigatório. ");
        }
        if (config.dataEmissaoObrigatoria && (dataEmissao == null || dataEmissao.isBlank())) {
            erros.append("Data de emissão é obrigatória. ");
        }
        if (config.dataValidadeObrigatoria && (dataValidade == null || dataValidade.isBlank())) {
            erros.append("Data de validade é obrigatória. ");
        }
        if (erros.length() > 0) throw new RuntimeException("Validação falhou: " + erros);
    }
}
