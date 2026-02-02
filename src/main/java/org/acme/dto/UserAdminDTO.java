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
        String perfil,
        OffsetDateTime dataCriacao,
        OffsetDateTime dataAtualizacao
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
                u.perfil != null ? u.perfil.name() : null,
                u.dataCriacao,
                u.dataAtualizacao
        );
    }
}
