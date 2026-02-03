package org.acme.service;

import io.quarkus.logging.Log;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Email service para envio de notificações aos usuários.
 * Utiliza Quarkus Mailer para envio de emails.
 *
 * Para desenvolvimento: usa mock (apenas logs)
 * Para produção: configurar SMTP nas application.properties
 */
@ApplicationScoped
public class EmailService {

    @Inject
    Mailer mailer;

    /**
     * Envia email de boas-vindas para novo usuário registrado.
     *
     * @param toEmail Email do destinatário
     * @param userName Nome do usuário
     */
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            String subject = "Bem-vindo ao Portal de Emendas";
            String body = buildWelcomeEmailBody(userName);

            mailer.send(Mail.withText(toEmail, subject, body));

            Log.infof("Email de boas-vindas enviado para %s", toEmail);
        } catch (Exception e) {
            Log.errorf("Erro ao enviar email de boas-vindas para %s: %s", toEmail, e.getMessage());
            // Não lançar exceção para não bloquear o registro do usuário
        }
    }

    /**
     * Envia email notificando que o cadastro foi aprovado.
     *
     * @param toEmail Email do destinatário
     * @param userName Nome do usuário
     */
    public void sendApprovalEmail(String toEmail, String userName) {
        try {
            String subject = "Cadastro Aprovado - Portal de Emendas";
            String body = buildApprovalEmailBody(userName);

            mailer.send(Mail.withText(toEmail, subject, body));

            Log.infof("Email de aprovação enviado para %s", toEmail);
        } catch (Exception e) {
            Log.errorf("Erro ao enviar email de aprovação para %s: %s", toEmail, e.getMessage());
        }
    }

    /**
     * Envia email notificando que o cadastro foi rejeitado.
     *
     * @param toEmail Email do destinatário
     * @param userName Nome do usuário
     * @param reason Motivo da rejeição
     */
    public void sendRejectionEmail(String toEmail, String userName, String reason) {
        try {
            String subject = "Cadastro Não Aprovado - Portal de Emendas";
            String body = buildRejectionEmailBody(userName, reason);

            mailer.send(Mail.withText(toEmail, subject, body));

            Log.infof("Email de rejeição enviado para %s", toEmail);
        } catch (Exception e) {
            Log.errorf("Erro ao enviar email de rejeição para %s: %s", toEmail, e.getMessage());
        }
    }

    private String buildWelcomeEmailBody(String userName) {
        return String.format("""
            Olá %s,
            
            Seu cadastro foi realizado com sucesso no Portal de Emendas!
            
            Seu cadastro está aguardando aprovação do administrador.
            Você receberá um email quando seu cadastro for aprovado.
            
            Atenciosamente,
            Equipe Portal de Emendas
            """, userName);
    }

    private String buildApprovalEmailBody(String userName) {
        return String.format("""
            Olá %s,
            
            Seu cadastro foi aprovado no Portal de Emendas!
            
            Você já pode acessar o sistema usando suas credenciais.
            
            Acesse: http://localhost:3000/login
            
            Atenciosamente,
            Equipe Portal de Emendas
            """, userName);
    }

    private String buildRejectionEmailBody(String userName, String reason) {
        return String.format("""
            Olá %s,
            
            Infelizmente seu cadastro não foi aprovado no Portal de Emendas.
            
            Motivo: %s
            
            Entre em contato com o administrador para mais informações.
            
            Atenciosamente,
            Equipe Portal de Emendas
            """, userName, reason != null ? reason : "Não especificado");
    }
}

