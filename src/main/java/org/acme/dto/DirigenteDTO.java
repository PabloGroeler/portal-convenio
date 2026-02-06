package org.acme.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DirigenteDTO {
    private String id;
    private String instituicaoId;

    // Dados Pessoais
    private String nomeCompleto;
    private String nomeSocial;
    private String cpf;
    private String rg;
    private String orgaoExpedidor;
    private String ufOrgaoExpedidor;
    private LocalDate dataExpedicao;
    private LocalDate dataNascimento;
    private String sexo;
    private String nacionalidade;
    private String estadoCivil;

    // Cargo
    private String cargo;
    private LocalDate dataInicioCargo;
    private LocalDate dataTerminoCargo;
    private String statusCargo;
    private String motivoInativacao;

    // Contato
    private String telefone;
    private String celular;
    private String email;

    // Endereço
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;
}

