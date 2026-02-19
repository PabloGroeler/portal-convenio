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

    @Inject
    JwtUtil jwtUtil;

    public String login(String document, String password) {
        if (document == null || password == null) return null;

        // Find user by documento (CPF or CNPJ)
        User user = User.findByDocumento(document);

        if (user == null) return null;

        // Blocked or pending users cannot authenticate
        if (user.status == User.UserStatus.BLOQUEADO || user.status == User.UserStatus.PENDENTE) {
            return null;
        }

        if (!BCrypt.checkpw(password, user.password)) return null;
        // Generate JWT with role and status
        return jwtUtil.generateToken(
            user.username,
            user.id,
            user.role.name(),
            user.status.name()
        );
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
            return jwtUtil.generateToken(
                user.username,
                user.id,
                user.role.name(),
                user.status.name()
            );
        }
        throw new SecurityException("Invalid credentials");
    }

    public boolean isTokenValid(String token) {
        if (token == null) return false;
        try {
            Claims claims = jwtUtil.parseToken(token);
            return !jwtUtil.isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }
}
