package org.acme.dto;

public class UserAdminCreateRequest {
    public String nomeCompleto;
    public String cpf;
    public String email;
    public String telefone;
    public String cargoFuncao;
    public String status; // ATIVO | INATIVO | BLOQUEADO
    public String role;   // ADMIN | OPERADOR
    public String password;
}

