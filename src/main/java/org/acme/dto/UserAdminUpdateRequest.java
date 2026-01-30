package org.acme.dto;

public class UserAdminUpdateRequest {
    public String nomeCompleto;
    public String cpf;
    public String email;
    public String telefone;
    public String cargoFuncao;
    public String status; // ATIVO | INATIVO | BLOQUEADO
    public String role;   // ADMIN | OPERADOR
    public String password; // optional; when set, update password
}

