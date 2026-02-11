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
     * Envia email de verificação com link para confirmar email.
     *
     * @param toEmail Email do destinatário
     * @param userName Nome do usuário
     * @param verificationLink Link para verificação de email
     */
    public void sendEmailVerification(String toEmail, String userName, String verificationLink) {
        try {
            String subject = "Verifique seu Email - Portal de Emendas";
            String body = buildVerificationEmailBody(userName, verificationLink);

            mailer.send(Mail.withHtml(toEmail, subject, body));

            Log.infof("Email de verificação enviado para %s", toEmail);
        } catch (Exception e) {
            Log.errorf("Erro ao enviar email de verificação para %s: %s", toEmail, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de verificação. Tente novamente mais tarde.");
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
            
            ✅ Seu email foi verificado com sucesso!
            
            Sua conta no Portal de Emendas está agora ATIVA e você já pode fazer login.
            
            Acesse: http://localhost:3000/login
            
            Use seu CPF/CNPJ e a senha cadastrada para acessar o sistema.
            
            Atenciosamente,
            Equipe Portal de Emendas
            """, userName);
    }

    private String buildVerificationEmailBody(String userName, String verificationLink) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 30px; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #7c3aed; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verifique seu Email</h1>
                    </div>
                    <div class="content">
                        <p>Olá <strong>%s</strong>,</p>
                        
                        <p>Obrigado por se registrar no Portal de Emendas!</p>
                        
                        <p>Para completar seu cadastro, por favor verifique seu endereço de email clicando no botão abaixo:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Verificar Email</a>
                        </div>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; color: #7c3aed;"><a href="%s">%s</a></p>
                        
                        <p><strong>Este link expira em 24 horas.</strong></p>
                        
                        <p>Se você não se registrou no Portal de Emendas, ignore este email.</p>
                        
                        <p>Atenciosamente,<br>Equipe Portal de Emendas</p>
                    </div>
                    <div class="footer">
                        <p>Portal de Emendas - Sistema de Gestão de Emendas Parlamentares</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName, verificationLink, verificationLink, verificationLink);
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

    /**
     * Envia email com link para redefinir senha.
     *
     * @param toEmail Email do destinatário
     * @param userName Nome do usuário
     * @param resetLink Link para redefinir senha
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        try {
            String subject = "Redefinir Senha - Portal de Emendas";
            String body = buildPasswordResetEmailBody(userName, resetLink);

            mailer.send(Mail.withHtml(toEmail, subject, body));

            Log.infof("Email de redefinição de senha enviado para %s", toEmail);
        } catch (Exception e) {
            Log.errorf("Erro ao enviar email de redefinição de senha para %s: %s", toEmail, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de redefinição de senha. Tente novamente mais tarde.");
        }
    }

    /**
     * Envia email confirmando que a senha foi alterada.
     *
     * @param toEmail Email do destinatário
     * @param userName Nome do usuário
     */
    public void sendPasswordChangedEmail(String toEmail, String userName) {
        try {
            String subject = "Senha Alterada - Portal de Emendas";
            String body = buildPasswordChangedEmailBody(userName);

            mailer.send(Mail.withText(toEmail, subject, body));

            Log.infof("Email de confirmação de alteração de senha enviado para %s", toEmail);
        } catch (Exception e) {
            Log.errorf("Erro ao enviar email de confirmação de alteração de senha para %s: %s", toEmail, e.getMessage());
        }
    }

    private String buildPasswordResetEmailBody(String userName, String resetLink) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 30px; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #7c3aed; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .warning { 
                        background-color: #fef3c7; 
                        border-left: 4px solid #f59e0b; 
                        padding: 15px; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Redefinir Senha</h1>
                    </div>
                    <div class="content">
                        <p>Olá <strong>%s</strong>,</p>
                        
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta no Portal de Emendas.</p>
                        
                        <p>Para criar uma nova senha, clique no botão abaixo:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Redefinir Senha</a>
                        </div>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; color: #7c3aed;"><a href="%s">%s</a></p>
                        
                        <div class="warning">
                            <p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
                            <ul style="margin: 10px 0 0 0;">
                                <li>Este link expira em <strong>1 hora</strong></li>
                                <li>Se você não solicitou esta redefinição, ignore este email</li>
                                <li>Sua senha atual permanecerá inalterada</li>
                            </ul>
                        </div>
                        
                        <p>Atenciosamente,<br>Equipe Portal de Emendas</p>
                    </div>
                    <div class="footer">
                        <p>Portal de Emendas - Sistema de Gestão de Emendas Parlamentares</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName, resetLink, resetLink, resetLink);
    }

    private String buildPasswordChangedEmailBody(String userName) {
        return String.format("""
            Olá %s,
            
            Sua senha foi alterada com sucesso no Portal de Emendas!
            
            Se você não realizou esta alteração, entre em contato com o administrador imediatamente.
            
            Data/Hora: %s
            
            Atenciosamente,
            Equipe Portal de Emendas
            """, userName, java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
    }
}

