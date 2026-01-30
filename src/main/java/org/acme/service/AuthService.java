package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.acme.dto.LoginRequest;
import org.acme.entity.User;
import org.acme.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.acme.security.JwtUtil;
import io.jsonwebtoken.Claims;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    public String login(String usernameOrEmail, String password) {
        if (usernameOrEmail == null || password == null) return null;
        User user = User.findByUsername(usernameOrEmail);
        if (user == null) {
            user = User.findByEmail(usernameOrEmail);
        }
        if (user == null) return null;

        // Blocked users cannot authenticate
        if (user.status == User.UserStatus.BLOQUEADO) return null;

        if (!BCrypt.checkpw(password, user.password)) return null;
        // Generate JWT
        return JwtUtil.generateToken(user.username, user.id);
    }

    public void logout(String token) {
        // Stateless JWT — logout is a no-op. If you want token revocation, implement a blacklist here.
    }

    public String authenticate(LoginRequest request) {
        User user = User.findByUsername(request.username());
        if (user == null) {
            user = User.findByEmail(request.username());
        }
        if (user != null && BCrypt.checkpw(request.password(), user.password)) {
            return JwtUtil.generateToken(user.username, user.id);
        }
        throw new SecurityException("Invalid credentials");
    }

    public boolean isTokenValid(String token) {
        if (token == null) return false;
        try {
            Claims claims = JwtUtil.parseToken(token);
            return !JwtUtil.isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }
}
