package org.acme.dto;

import org.acme.entity.User;

import java.time.OffsetDateTime;

public record UserAdminDTO(
        Long id,
        String nomeCompleto,
        String cpf,
        String email,
        String telefone,
        String cargoFuncao,
        String status,
        String role,
        OffsetDateTime createTime,
        OffsetDateTime updateTime
) {
    public static UserAdminDTO fromEntity(User u) {
        return new UserAdminDTO(
                u.id,
                u.nomeCompleto,
                u.cpf,
                u.email,
                u.telefone,
                u.cargoFuncao,
                u.status != null ? u.status.name() : null,
                u.role != null ? u.role.name() : null,
                u.createTime,
                u.updateTime
        );
    }
}
