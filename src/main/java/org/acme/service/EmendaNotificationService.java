package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.acme.entity.Institution;
import org.acme.entity.User;
import org.acme.entity.UsuarioInstituicao;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável por coletar os destinatários corretos e
 * disparar e-mails de notificação após cada atualização de emenda ou instituição.
 *
 * Regras de destinatários:
 *   EMENDA — mudança de status via executarAcao():
 *     • Usuários vinculados à instituição da emenda (OPERADOR)
 *     • Usuários do perfil responsável pela PRÓXIMA etapa
 *     • ADMIN e GESTOR sempre recebem
 *
 *   EMENDA — atualização de dados via update():
 *     • Usuários vinculados à instituição da emenda
 *     • ADMIN e GESTOR
 *
 *   INSTITUIÇÃO — atualização via update():
 *     • Usuários vinculados à instituição
 *     • ADMIN e GESTOR
 */
@ApplicationScoped
public class EmendaNotificationService {

    private static final Logger LOG = Logger.getLogger(EmendaNotificationService.class);

    @Inject
    EmailService emailService;

    @Inject
    InstitutionService institutionService;

    // ── Mapeamento: novoStatus → perfil responsável pela próxima ação ──────────
    private static final java.util.Map<String, User.UserRole> STATUS_PROXIMO_PERFIL =
        java.util.Map.ofEntries(
            java.util.Map.entry("Recebido",                                   User.UserRole.ORCAMENTO),
            java.util.Map.entry("Em análise de admissibilidade",              User.UserRole.ORCAMENTO),
            java.util.Map.entry("Admissibilidade aprovada",                   User.UserRole.SECRETARIA),
            java.util.Map.entry("Em análise de demanda",                      User.UserRole.SECRETARIA),
            java.util.Map.entry("Análise de demanda aprovada",                User.UserRole.CONVENIOS),
            java.util.Map.entry("Em análise documental",                      User.UserRole.CONVENIOS),
            java.util.Map.entry("Análise documental aprovada",                User.UserRole.JURIDICO),
            java.util.Map.entry("Devolvida ao legislativo",                   User.UserRole.ORCAMENTO),
            java.util.Map.entry("Devolvida por incompatibilidade de demanda", User.UserRole.ORCAMENTO),
            java.util.Map.entry("Devolvida por inviabilidade documental",     User.UserRole.ORCAMENTO),
            java.util.Map.entry("Iniciado",                                   User.UserRole.OPERADOR),
            java.util.Map.entry("Em execução",                                User.UserRole.OPERADOR),
            java.util.Map.entry("Devolvido",                                  User.UserRole.OPERADOR),
            java.util.Map.entry("Concluído",                                  User.UserRole.OPERADOR)
        );

    /**
     * Chamado após executarAcao() — mudança de status da emenda.
     */
    public void notificarMudancaStatus(
            String emendaId,
            String officialCode,
            String institutionId,
            String statusAnterior,
            String novoStatus,
            String observacao,
            String usuarioAtor) {

        List<String> destinatarios = coletarDestinatarios(institutionId, novoStatus);
        if (destinatarios.isEmpty()) return;

        String subject = String.format("[Portal de Emendas] Emenda %s — Status atualizado: %s",
                officialCode != null ? officialCode : emendaId, novoStatus);

        String body = emailService.buildEmendaStatusBody(
                officialCode != null ? officialCode : emendaId,
                institutionId,
                statusAnterior,
                novoStatus,
                observacao,
                usuarioAtor);

        enviarParaTodos(destinatarios, subject, body, "notificarMudancaStatus emenda=" + emendaId);
    }

    /**
     * Chamado após update() — atualização de dados da emenda.
     */
    public void notificarAtualizacaoDados(
            String emendaId,
            String officialCode,
            String institutionId,
            String statusAtual,
            String usuarioAtor) {

        List<String> destinatarios = coletarDestinatarios(institutionId, null);
        if (destinatarios.isEmpty()) return;

        String subject = String.format("[Portal de Emendas] Emenda %s — Dados atualizados",
                officialCode != null ? officialCode : emendaId);

        String body = emailService.buildEmendaDadosBody(
                officialCode != null ? officialCode : emendaId,
                institutionId,
                statusAtual,
                usuarioAtor);

        enviarParaTodos(destinatarios, subject, body, "notificarAtualizacaoDados emenda=" + emendaId);
    }

    /**
     * Chamado após InstitutionService.update() — atualização de dados da instituição.
     */
    public void notificarAtualizacaoInstituicao(
            String institutionId,
            String razaoSocial,
            String usuarioAtor) {

        List<String> destinatarios = coletarDestinatarios(institutionId, null);
        if (destinatarios.isEmpty()) return;

        String subject = String.format("[Portal de Emendas] Instituição '%s' — Dados atualizados", razaoSocial);
        String body = emailService.buildInstituicaoBody(razaoSocial, institutionId, usuarioAtor);

        enviarParaTodos(destinatarios, subject, body, "notificarAtualizacaoInstituicao inst=" + institutionId);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    /**
     * Coleta e-mails únicos dos destinatários relevantes para o evento.
     *
     * @param institutionId ID da instituição vinculada (pode ser null)
     * @param novoStatus    novo status (null = só coleta admins + inst)
     */
    private List<String> coletarDestinatarios(String institutionId, String novoStatus) {
        List<String> emails = new ArrayList<>();

        // 1) ADMIN e GESTOR sempre recebem
        List<User> admins = User.find("role in (?1, ?2) and status = ?3",
                User.UserRole.ADMIN, User.UserRole.GESTOR, User.UserStatus.ATIVO).list();
        admins.stream()
              .filter(u -> u.email != null && !u.email.isBlank())
              .forEach(u -> emails.add(u.email));

        // 2) Usuários vinculados à instituição (OPERADOR)
        if (institutionId != null && !institutionId.isBlank()) {
            List<UsuarioInstituicao> vinculos = UsuarioInstituicao.findByInstituicao(institutionId);
            vinculos.stream()
                    .map(v -> User.<User>findById(v.usuarioId))
                    .filter(u -> u != null && u.status == User.UserStatus.ATIVO
                              && u.email != null && !u.email.isBlank())
                    .forEach(u -> emails.add(u.email));
        }

        // 3) Perfil responsável pela próxima etapa
        if (novoStatus != null) {
            User.UserRole proximoPerfil = STATUS_PROXIMO_PERFIL.get(novoStatus);
            if (proximoPerfil != null) {
                List<User> perfil = User.find("role = ?1 and status = ?2",
                        proximoPerfil, User.UserStatus.ATIVO).list();
                perfil.stream()
                      .filter(u -> u.email != null && !u.email.isBlank())
                      .forEach(u -> emails.add(u.email));
            }
        }

        // Deduplica mantendo ordem
        return emails.stream().distinct().collect(Collectors.toList());
    }

    private void enviarParaTodos(List<String> emails, String subject, String body, String ctx) {
        for (String email : emails) {
            try {
                emailService.sendHtmlNotification(email, subject, body);
            } catch (Exception e) {
                LOG.warnf("Falha ao enviar notificação [%s] para %s: %s", ctx, email, e.getMessage());
            }
        }
        LOG.infof("Notificação [%s] enviada para %d destinatário(s)", ctx, emails.size());
    }
}

