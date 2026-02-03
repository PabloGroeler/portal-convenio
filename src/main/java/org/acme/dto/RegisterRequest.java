package org.acme.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 50)
    public String username;

    @NotBlank
    @Email
    public String email;

    @NotBlank
    @Size(min = 8)
    public String password;

    // Optional: Nome completo do usuário
    @Size(max = 200)
    public String nomeCompleto;

    // Optional: CPF do usuário (11 dígitos sem formatação)
    @Size(max = 11)
    public String cpf;

    // Optional: CNPJ do usuário (14 dígitos sem formatação) - para pessoa jurídica
    @Size(max = 14)
    public String cnpj;
}

