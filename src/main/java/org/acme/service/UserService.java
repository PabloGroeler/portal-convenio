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
        user.persist();

        return new UserDTO(user.id, user.username, user.email);
    }
}