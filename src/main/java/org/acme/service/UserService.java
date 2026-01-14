package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.acme.dto.RegisterRequest;
import org.acme.entity.User;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class UserService {

    @Transactional
    public User register(RegisterRequest request) {
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

        return user;
    }
}