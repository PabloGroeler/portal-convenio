package org.acme.dto;

public record LoginResponse(boolean success, String token, UserDTO user) {
}
