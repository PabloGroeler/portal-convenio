package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.acme.dto.RegisterRequest;
import org.acme.dto.UserDTO;
import org.acme.entity.User;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class UserService {

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

        if (User.findByUsername(request.username) != null) {
            throw new RuntimeException("Username already exists");
        }
        if (User.findByEmail(request.email) != null) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.username = request.username;
        user.email = request.email;
        user.password = BCrypt.hashpw(request.password, BCrypt.gensalt());

        // Fill required fields with default values for registration
        // nomeCompleto can be same as username initially, user can update later
        user.nomeCompleto = request.username;

        // CPF is nullable - user can complete profile later
        user.cpf = null;

        // Default values (status, role, timestamps) are set in @PrePersist
        user.persist();
        user.flush(); // Force flush to generate ID

        return new UserDTO(user.id, user.username, user.email);
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