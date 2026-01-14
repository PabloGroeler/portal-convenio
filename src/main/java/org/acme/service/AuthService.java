package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.acme.dto.LoginRequest;
import org.acme.entity.User;
import org.acme.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    private final Map<String, String> users = new ConcurrentHashMap<>();
    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    public AuthService() {
        users.put("user", "password");
    }

    public String login(String username, String password) {
        return "token";
//        if (username == null || password == null) {
//            return null;
//        }
//        String expectedPassword = users.get(username);
//        if (expectedPassword == null || !expectedPassword.equals(password)) {
//            return null;
//        }
//        String token = UUID.randomUUID().toString();
//        tokens.put(token, username);
//        return token;
    }

    public void logout(String token) {
        if (token == null) {
            return;
        }
        tokens.remove(token);
    }


    public String authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.username());
        if (user != null && BCrypt.checkpw(request.password(), user.password)) {
            return "dummy-token"; // Replace with JWT token
        }
        throw new SecurityException("Invalid credentials");
    }

    public boolean isTokenValid(String token) {
        return token != null && tokens.containsKey(token);
    }
}
