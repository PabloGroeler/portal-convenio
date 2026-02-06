package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.SecurityContext;
import org.acme.entity.*;
import org.acme.dto.AlterarStatusDTO;
import org.acme.repository.InstitutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class StatusOSCService {

    private static final Logger LOG = LoggerFactory.getLogger(StatusOSCService.class);

    @Inject
    SecurityContext securityContext;

    @Inject
    InstitutionRepository institutionRepository;

    @Inject
    EntityManager entityManager;

    // Lista de documentos obrigatórios
    private static final List<String> DOCUMENTOS_OBRIGATORIOS = List.of(
        "CARTAO_CNPJ",
        "ESTATUTO_SOCIAL",
        "ALVARA_FUNCIONAMENTO",
        "ATA_ELEICAO_DIRETORIA",
        "COMPROVANTE_INSCRICAO_CONSELHO",
        "COMPROVANTE_ENDERECO_INSTITUICAO",
        "CERTIDAO_TRIBUTOS_FEDERAIS",
        "CERTIFICADO_FGTS",
        "CERTIDAO_DEBITOS_TRABALHISTAS",
        "CERTIDAO_DEBITOS_MUNICIPAIS",
        "CERTIDAO_TCE_INSTITUICAO"
    );

    /**
     * RF-02.3 - Calcula o status automático baseado em documentos
     */
    public StatusOSC calcularStatusAutomatico(Institution instituicao) {
        LOG.debug("Calculando status automático para instituição: {}", instituicao.institutionId);

        // Buscar documentos da instituição usando EntityManager
        List<DocumentoInstitucional> documentos = entityManager
            .createQuery("SELECT d FROM DocumentoInstitucional d WHERE d.idInstituicao = :idInstituicao", DocumentoInstitucional.class)
            .setParameter("idInstituicao", instituicao.institutionId)
            .getResultList();

        boolean temDocumentos = !documentos.isEmpty();

        // Contar documentos obrigatórios
        long obrigatoriosEnviados = documentos.stream()
            .filter(d -> DOCUMENTOS_OBRIGATORIOS.contains(d.getTipoDocumento()))
            .count();

        boolean todosObrigatoriosEnviados = obrigatoriosEnviados == DOCUMENTOS_OBRIGATORIOS.size();

        StatusOSC statusAtual = instituicao.statusOSC != null ? instituicao.statusOSC : StatusOSC.EM_CADASTRO;

        LOG.debug("Status atual: {}, Tem documentos: {}, Obrigatórios enviados: {}/{}",
                  statusAtual, temDocumentos, obrigatoriosEnviados, DOCUMENTOS_OBRIGATORIOS.size());

        // Status terminal - não muda automaticamente
        if (statusAtual == StatusOSC.APROVADO ||
            statusAtual == StatusOSC.SUSPENSA ||
            statusAtual == StatusOSC.INATIVA) {
            LOG.debug("Status terminal, mantendo: {}", statusAtual);
            return statusAtual;
        }

        // REPROVADO - mantém até operador agir
        if (statusAtual == StatusOSC.REPROVADO) {
            LOG.debug("Status REPROVADO, mantendo até correção");
            return statusAtual;
        }

        // Lógica automática
        if (!temDocumentos) {
            LOG.debug("Sem documentos, status: EM_CADASTRO");
            return StatusOSC.EM_CADASTRO;
        }

        if (temDocumentos && !todosObrigatoriosEnviados) {
            LOG.debug("Documentos incompletos, faltam: {}", DOCUMENTOS_OBRIGATORIOS.size() - obrigatoriosEnviados);
            return StatusOSC.DOCUMENTOS_INCOMPLETOS;
        }

        if (todosObrigatoriosEnviados) {
            LOG.debug("Todos obrigatórios enviados, status: EM_ANALISE");
            return StatusOSC.EM_ANALISE;
        }

        return statusAtual;
    }

    /**
     * Altera o status manualmente com validação e histórico
     */
    @Transactional
    public Institution alterarStatus(String instituicaoId, AlterarStatusDTO dto) {
        LOG.info("Alterando status da instituição {} para {}", instituicaoId, dto.getNovoStatus());

        Institution instituicao = institutionRepository.findById(instituicaoId);
        if (instituicao == null) {
            throw new IllegalArgumentException("Instituição não encontrada: " + instituicaoId);
        }

        StatusOSC statusAtual = instituicao.statusOSC != null ? instituicao.statusOSC : StatusOSC.EM_CADASTRO;
        StatusOSC novoStatus = dto.getNovoStatus();

        // Validar transição
        if (!isTransicaoValida(statusAtual, novoStatus)) {
            String msg = String.format("Transição inválida de %s para %s", statusAtual, novoStatus);
            LOG.warn(msg);
            throw new IllegalArgumentException(msg);
        }

        // Validar justificativa obrigatória
        if ((novoStatus == StatusOSC.SUSPENSA || novoStatus == StatusOSC.REPROVADO)
            && (dto.getJustificativa() == null || dto.getJustificativa().trim().isEmpty())) {
            throw new IllegalArgumentException("Justificativa obrigatória para status " + novoStatus);
        }

        // Registrar no histórico
        registrarHistorico(instituicao, statusAtual, novoStatus, dto);

        // Atualizar instituição
        instituicao.statusOSC = novoStatus;
        if (novoStatus == StatusOSC.SUSPENSA) {
            instituicao.justificativaSuspensao = dto.getJustificativa();
        } else {
            instituicao.justificativaSuspensao = null;
        }
        entityManager.merge(instituicao);

        LOG.info("Status alterado com sucesso: {} -> {}", statusAtual, novoStatus);
        return instituicao;
    }

    /**
     * Valida se a transição de status é permitida
     */
    private boolean isTransicaoValida(StatusOSC de, StatusOSC para) {
        return switch (de) {
            case EM_CADASTRO -> para == StatusOSC.DOCUMENTOS_INCOMPLETOS || para == StatusOSC.INATIVA;
            case DOCUMENTOS_INCOMPLETOS -> para == StatusOSC.EM_ANALISE || para == StatusOSC.INATIVA;
            case EM_ANALISE -> para == StatusOSC.APROVADO || para == StatusOSC.REPROVADO
                            || para == StatusOSC.SUSPENSA || para == StatusOSC.INATIVA;
            case APROVADO -> para == StatusOSC.SUSPENSA || para == StatusOSC.INATIVA;
            case REPROVADO -> para == StatusOSC.DOCUMENTOS_INCOMPLETOS
                           || para == StatusOSC.EM_ANALISE || para == StatusOSC.INATIVA;
            case SUSPENSA -> para == StatusOSC.EM_ANALISE || para == StatusOSC.APROVADO
                          || para == StatusOSC.INATIVA;
            case INATIVA -> false; // Status terminal
        };
    }

    /**
     * Registra alteração no histórico
     * Nota: Não precisa de @Transactional porque é chamado por métodos já transacionais
     */
    private void registrarHistorico(Institution instituicao, StatusOSC statusAnterior,
                                   StatusOSC statusNovo, AlterarStatusDTO dto) {
        StatusHistorico historico = new StatusHistorico();
        historico.instituicaoId = instituicao.institutionId;
        historico.statusAnterior = statusAnterior;
        historico.statusNovo = statusNovo;
        historico.dataAlteracao = LocalDateTime.now();
        historico.usuarioResponsavel = getCurrentUser();
        historico.justificativa = dto.getJustificativa();
        historico.observacoes = dto.getObservacoes();
        historico.persist();

        LOG.debug("Histórico registrado: {} -> {} por {}", statusAnterior, statusNovo, historico.usuarioResponsavel);
    }

    /**
     * Busca histórico de alterações de status
     */
    public List<StatusHistorico> buscarHistorico(String instituicaoId) {
        return entityManager
            .createQuery("SELECT h FROM StatusHistorico h WHERE h.instituicaoId = :instituicaoId ORDER BY h.dataAlteracao DESC", StatusHistorico.class)
            .setParameter("instituicaoId", instituicaoId)
            .getResultList();
    }

    /**
     * Atualiza status automaticamente após alteração de documentos
     */
    @Transactional
    public void atualizarStatusAutomatico(String instituicaoId) {
        LOG.debug("Atualizando status automaticamente para instituição: {}", instituicaoId);

        Institution instituicao = institutionRepository.findById(instituicaoId);
        if (instituicao == null) {
            LOG.warn("Instituição não encontrada: {}", instituicaoId);
            return;
        }

        StatusOSC statusAtual = instituicao.statusOSC != null ? instituicao.statusOSC : StatusOSC.EM_CADASTRO;
        StatusOSC statusCalculado = calcularStatusAutomatico(instituicao);

        if (statusAtual != statusCalculado) {
            LOG.info("Status mudou automaticamente: {} -> {}", statusAtual, statusCalculado);

            // Registrar no histórico
            AlterarStatusDTO dto = new AlterarStatusDTO();
            dto.setNovoStatus(statusCalculado);
            dto.setObservacoes("Atualização automática baseada em documentos");

            registrarHistorico(instituicao, statusAtual, statusCalculado, dto);

            instituicao.statusOSC = statusCalculado;
            entityManager.merge(instituicao);
        } else {
            LOG.debug("Status permanece o mesmo: {}", statusAtual);
        }
    }

    /**
     * Obtém o usuário atual do contexto de segurança
     */
    private String getCurrentUser() {
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            return securityContext.getUserPrincipal().getName();
        }
        return "sistema";
    }
}

