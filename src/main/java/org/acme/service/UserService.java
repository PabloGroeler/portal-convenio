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
        if (request.nomeUsuario == null || request.nomeUsuario.isBlank()) {
            throw new RuntimeException("Username is required");
        }
        if (request.email == null || request.email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (request.senha == null || request.senha.isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (User.findByUsername(request.nomeUsuario) != null) {
            throw new RuntimeException("Username already exists");
        }
        if (User.findByEmail(request.email) != null) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.nomeUsuario = request.nomeUsuario;
        user.email = request.email;
        user.senha = BCrypt.hashpw(request.senha, BCrypt.gensalt());
        user.persist();

        return new UserDTO(user.id, user.nomeUsuario, user.email);
    }
}