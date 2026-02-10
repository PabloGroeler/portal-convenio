package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.dto.RegisterRequest;
import org.acme.dto.UserDTO;
import org.acme.entity.User;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class UserService {

    @Inject
    EmailService emailService;

    @Transactional
    public UserDTO register(RegisterRequest request) {
        if (request == null) {
            throw new RuntimeException("Request body is required");
        }
        if (request.username == null || request.username.isBlank()) {
            throw new RuntimeException("Username is required");
        }
        if (request.email == null || request.email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (request.password == null || request.password.isBlank()) {
            throw new RuntimeException("Password is required");
        }

        // Validate password strength
        validatePasswordStrength(request.password);

        // Check for duplicate username
        if (User.findByUsername(request.username) != null) {
            throw new RuntimeException("Username already exists");
        }

        // Check for duplicate email - REQUIREMENT: Não permitir cadastro com e-mail duplicado
        if (User.findByEmail(request.email) != null) {
            throw new RuntimeException("Email already in use");
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
            user.cpf = cpfDigits;
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
            user.cnpj = cnpjDigits;
        }

        // REQUIREMENT: Usuário deve iniciar com status PENDENTE
        user.status = User.UserStatus.PENDENTE;
        user.role = User.UserRole.OPERADOR; // Default role

        user.persist();
        user.flush();

        // REQUIREMENT: Após registro, enviar email
        emailService.sendWelcomeEmail(user.email, user.nomeCompleto);

        return new UserDTO(
            user.id,
            user.username,
            user.email,
            user.nomeCompleto,
            user.role.name(),    // Include role for RBAC
            user.status.name(),  // Include status
            java.util.Collections.emptyList() // Novo usuário sem instituições
        );
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
}