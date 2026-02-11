package org.acme.resource;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Path("/api/test-email")
public class EmailTestResource {

    @Inject
    Mailer mailer;

    @ConfigProperty(name = "quarkus.mailer.host")
    String smtpHost;

    @ConfigProperty(name = "quarkus.mailer.port")
    String smtpPort;

    @ConfigProperty(name = "quarkus.mailer.from")
    String smtpFrom;

    @ConfigProperty(name = "quarkus.mailer.username")
    String smtpUsername;

    @ConfigProperty(name = "quarkus.mailer.mock", defaultValue = "false")
    boolean mockMode;

    @GET
    @Path("/send")
    public Response sendTestEmail(@QueryParam("to") String recipient) {
        Map<String, Object> result = new HashMap<>();

        try {
            if (recipient == null || recipient.trim().isEmpty()) {
                result.put("success", false);
                result.put("error", "Recipient email is required. Use: /api/test-email/send?to=email@example.com");
                return Response.status(400).entity(result).build();
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            String emailBody = String.format(
                "Este é um email de teste do sistema Portal de Emendas.\n\n" +
                "Se você recebeu este email, a configuração SMTP está funcionando corretamente.\n\n" +
                "Configuração testada:\n" +
                "- Servidor: %s\n" +
                "- Porta: %s\n" +
                "- Remetente: %s\n" +
                "- Usuário: %s\n" +
                "- Modo Mock: %s\n" +
                "- Data/Hora: %s\n\n" +
                "---\n" +
                "Sistema Portal de Emendas\n" +
                "Câmara Municipal de Sinop",
                smtpHost, smtpPort, smtpFrom, smtpUsername, mockMode, timestamp
            );

            mailer.send(Mail.withText(
                recipient,
                "SMTP Test - Portal de Emendas",
                emailBody
            ));

            result.put("success", true);
            result.put("message", "✓ Email enviado com sucesso para: " + recipient);
            result.put("recipient", recipient);
            result.put("from", smtpFrom);
            result.put("server", smtpHost + ":" + smtpPort);
            result.put("mockMode", mockMode);
            result.put("timestamp", timestamp);

            if (mockMode) {
                result.put("warning", "ATENÇÃO: Modo MOCK está ativo. O email não foi realmente enviado. Verifique os logs do console.");
            }

            return Response.ok(result).build();

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Erro ao enviar email: " + e.getMessage());
            result.put("details", e.getClass().getSimpleName());
            result.put("server", smtpHost + ":" + smtpPort);
            result.put("from", smtpFrom);

            return Response.status(500).entity(result).build();
        }
    }

    @GET
    @Path("/config")
    public Response getEmailConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("host", smtpHost);
        config.put("port", smtpPort);
        config.put("from", smtpFrom);
        config.put("username", smtpUsername);
        config.put("mockMode", String.valueOf(mockMode));

        return Response.ok(config).build();
    }
}
