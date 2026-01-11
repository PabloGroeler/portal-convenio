package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AuthService {

    private final Map<String, String> users = new ConcurrentHashMap<>();
    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    public AuthService() {
        users.put("user", "password");
    }

    public String login(String username, String password) {
        if (username == null || password == null) {
            return null;
        }
        String expectedPassword = users.get(username);
        if (expectedPassword == null || !expectedPassword.equals(password)) {
            return null;
        }
        String token = UUID.randomUUID().toString();
        tokens.put(token, username);
        return token;
    }

    public void logout(String token) {
        if (token == null) {
            return;
        }
        tokens.remove(token);
    }

    public boolean isTokenValid(String token) {
        return token != null && tokens.containsKey(token);
    }
}
