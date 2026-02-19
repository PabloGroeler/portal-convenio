package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.RegisterRequest;
import org.acme.dto.UserDTO;
import org.acme.entity.User;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class UserService {

    @Inject
    EmailService emailService;

    @ConfigProperty(name = "frontend.base.url", defaultValue = "http://localhost:3000")
    String frontendBaseUrl;

    @Transactional
    public UserDTO register(RegisterRequest request) {
        if (request == null) {
            throw new RuntimeException("Corpo da requisição é obrigatório");
        }
        if (request.username == null || request.username.isBlank()) {
            throw new RuntimeException("Nome de usuário é obrigatório");
        }
        if (request.email == null || request.email.isBlank()) {
            throw new RuntimeException("Email é obrigatório");
        }
        if (request.password == null || request.password.isBlank()) {
            throw new RuntimeException("Senha é obrigatória");
        }

        // Validate password strength
        validatePasswordStrength(request.password);

        // Check for duplicate username
        if (User.findByUsername(request.username) != null) {
            throw new RuntimeException("Nome de usuário já existe");
        }

        // Check for duplicate email - REQUIREMENT: Não permitir cadastro com e-mail duplicado
        if (User.findByEmail(request.email) != null) {
            throw new RuntimeException("Email já está em uso");
        }

        User user = new User();
        user.username = request.username;
        user.email = request.email;
        user.password = BCrypt.hashpw(request.password, BCrypt.gensalt());

        // REQUIREMENT: Adicionar opção para informar CPF ou CNPJ
        user.nomeCompleto = request.nomeCompleto != null ? request.nomeCompleto : request.username;

        // User can provide either CPF (pessoa física) or CNPJ (pessoa jurídica), but not both
        if (request.cpf != null && !request.cpf.isBlank() && request.cnpj != null && !request.cnpj.isBlank()) {
            throw new RuntimeException("Informe apenas CPF ou CNPJ, não ambos");
        }

        // Set CPF if provided (11 digits without formatting)
        if (request.cpf != null && !request.cpf.isBlank()) {
            String cpfDigits = request.cpf.replaceAll("\\D", "");
            if (cpfDigits.length() != 11) {
                throw new RuntimeException("CPF deve conter 11 dígitos");
            }
            // Check for duplicate CPF
            if (User.find("cpf", cpfDigits).firstResult() != null) {
                throw new RuntimeException("CPF já cadastrado");
            }
            user.documento = cpfDigits;
        }

        // Set CNPJ if provided (14 digits without formatting)
        if (request.cnpj != null && !request.cnpj.isBlank()) {
            String cnpjDigits = request.cnpj.replaceAll("\\D", "");
            if (cnpjDigits.length() != 14) {
                throw new RuntimeException("CNPJ deve conter 14 dígitos");
            }
            // Check for duplicate CNPJ
            if (User.find("cnpj", cnpjDigits).firstResult() != null) {
                throw new RuntimeException("CNPJ já cadastrado");
            }
            user.documento = cnpjDigits;
        }

        // REQUIREMENT: Usuário deve iniciar com status PENDENTE
        user.status = User.UserStatus.PENDENTE;
        user.role = User.UserRole.OPERADOR; // Default role

        // Email verification: generate token
        user.emailVerified = false;
        user.verificationToken = generateVerificationToken();
        user.verificationTokenExpiry = java.time.OffsetDateTime.now().plusHours(24); // Token expires in 24 hours

        // Persist user - if this fails, transaction will rollback
        user.persist();

        // Create DTO to return - if this fails, transaction will rollback
        UserDTO userDTO = new UserDTO(
            user.id,
            user.username,
            user.email,
            user.nomeCompleto,
            user.role.name(),    // Include role for RBAC
            user.status.name(),  // Include status
            java.util.Collections.emptyList() // Novo usuário sem instituições
        );

        // IMPORTANT: Only send email AFTER all validations and persistence succeed
        // If any error occurred above, transaction rollbacks and email is NOT sent
        // This prevents sending verification emails for users that weren't actually created
        try {
            String verificationLink = buildVerificationLink(user.verificationToken);
            emailService.sendEmailVerification(user.email, user.nomeCompleto, verificationLink);
        } catch (Exception e) {
            // Log email error but don't fail the registration
            // User was created successfully, they can request a new verification email later
            System.err.println("Aviso: Usuário registrado com sucesso, mas o envio do email de verificação falhou: " + e.getMessage());
            // Don't throw - user is already created
        }

        return userDTO;
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new RuntimeException("Senha deve ter no mínimo 8 caracteres");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException("Senha deve conter pelo menos uma letra maiúscula");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new RuntimeException("Senha deve conter pelo menos uma letra minúscula");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException("Senha deve conter pelo menos um número");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new RuntimeException("Senha deve conter pelo menos um caractere especial");
        }
    }

    /**
     * Generate a secure random verification token (64 characters hex)
     */
    private String generateVerificationToken() {
        return java.util.UUID.randomUUID().toString().replace("-", "") +
               java.util.UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * Build verification link for email
     */
    private String buildVerificationLink(String token) {
        return frontendBaseUrl + "/verify-email?token=" + token;
    }

    /**
     * Request password reset - sends email with reset link
     */
    @Transactional
    public void requestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email é obrigatório");
        }

        User user = User.findByEmail(email);
        if (user == null) {
            // Don't reveal if email exists or not (security best practice)
            // Just return success but don't send email
            return;
        }

        // Generate password reset token
        String resetToken = generateVerificationToken();
        user.passwordResetToken = resetToken;
        user.passwordResetTokenExpiry = java.time.OffsetDateTime.now().plusHours(1); // Token expires in 1 hour
        user.persist();

        // Send password reset email
        String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.email, user.username, resetLink);
    }

    /**
     * Reset password with token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token é obrigatório");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Nova senha é obrigatória");
        }

        // Validate password strength
        validatePasswordStrength(newPassword);

        User user = User.find("passwordResetToken", token).firstResult();
        if (user == null) {
            throw new RuntimeException("Token de redefinição de senha inválido");
        }

        // Check if token expired
        if (user.passwordResetTokenExpiry.isBefore(java.time.OffsetDateTime.now())) {
            throw new RuntimeException("Token de redefinição de senha expirado");
        }

        // Update password
        user.password = BCrypt.hashpw(newPassword, BCrypt.gensalt());

        // Clear reset token
        user.passwordResetToken = null;
        user.passwordResetTokenExpiry = null;

        user.persist();

        // Send confirmation email
        emailService.sendPasswordChangedEmail(user.email, user.username);
    }

    /**
     * Verify email with token
     */
    @Transactional
    public void verifyEmail(String token) {
        User user = User.find("verificationToken", token).firstResult();

        if (user == null) {
            throw new RuntimeException("Token de verificação inválido");
        }

        if (user.verificationTokenExpiry.isBefore(java.time.OffsetDateTime.now())) {
            throw new RuntimeException("Token de verificação expirado");
        }

        if (user.emailVerified) {
            throw new RuntimeException("Email já verificado");
        }

        // Verify email
        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;

        // Change status from PENDENTE to ATIVO after email verification
        if (user.status == User.UserStatus.PENDENTE) {
            user.status = User.UserStatus.ATIVO;
        }

        user.persist();

        // Send welcome email after verification
        emailService.sendWelcomeEmail(user.email, user.nomeCompleto);
    }
}