package org.acme.dto;

import java.util.List;

public record UserDTO(
    Long id,
    String username,
    String email,
    String name,
    String role,        // User role for RBAC (ADMIN, OPERADOR, ANALISTA, JURIDICO)
    String status,      // User status (ATIVO, INATIVO, BLOQUEADO, PENDENTE)
    List<String> instituicoes, // Lista de todas as instituições vinculadas
    String secretaria   // Secretaria vinculada (obrigatório para role=SECRETARIA)
) {}

