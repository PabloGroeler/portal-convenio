package org.acme.dto;

import java.util.List;

public record UserDTO(
    Long id,
    String username,
    String email,
    String name,
    List<String> instituicoes // Lista de todas as instituições vinculadas
) {}

