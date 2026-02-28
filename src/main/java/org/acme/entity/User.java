// src/main/java/org/acme/entity/User.java
package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

@Entity
@Table(name = "usuarios")
public class User extends PanacheEntityBase {

    @Id
    @SequenceGenerator(
        name = "usuarios_seq_gen",
        sequenceName = "usuarios_seq",
        allocationSize = 1
    )
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "usuarios_seq_gen"
    )
    public Long id;

    public enum UserStatus {
        ATIVO,
        INATIVO,
        BLOQUEADO,
        PENDENTE  // Usuário aguardando aprovação do administrador
    }

    public enum UserRole {
        ADMIN,
        OPERADOR,
        GESTOR,
        ANALISTA,
        JURIDICO,
        ORCAMENTO,
        SECRETARIA,
        CONVENIOS
    }

    @NotBlank
    @Size(max = 200)
    @Column(name = "nome_completo", nullable = false, length = 200)
    public String nomeCompleto;

    // Documento: CPF (11 digits) or CNPJ (14 digits) - store only digits
    // Validation + formatting handled in service/resource
    @Pattern(regexp = "\\d{11,14}", message = "Documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)")
    @Column(name = "documento", length = 14, unique = true)
    public String documento;

    @NotBlank
    @Email
    @Column(name = "email", unique = true, nullable = false)
    public String email;

    @Column(name = "email_verificado", nullable = false)
    public Boolean emailVerified = false;

    @Column(name = "token_verificacao", length = 64)
    public String verificationToken;

    @Column(name = "token_verificacao_expira")
    public OffsetDateTime verificationTokenExpiry;

    @Column(name = "token_redefinir_senha", length = 64)
    public String passwordResetToken;

    @Column(name = "token_redefinir_senha_expira")
    public OffsetDateTime passwordResetTokenExpiry;

    @Column(name = "telefone", length = 30)
    public String telefone;

    @Column(name = "cargo_funcao", length = 120)
    public String cargoFuncao;

    /** Secretaria vinculada — obrigatório quando role = SECRETARIA */
    @Column(name = "secretaria", length = 300)
    public String secretaria;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    public UserStatus status = UserStatus.ATIVO;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil", nullable = false, length = 30)
    public UserRole role = UserRole.OPERADOR;

    @NotBlank
    @Size(min = 3, max = 256)
    @Column(name = "nome_usuario", unique = true, nullable = false, length = 256)
    public String username;

    @NotBlank
    @Size(min = 6)
    @Column(name = "senha", nullable = false)
    public String password;

    @Column(name = "data_criacao", nullable = false)
    public OffsetDateTime createTime;

    @Column(name = "data_atualizacao", nullable = false)
    public OffsetDateTime updateTime;

    @PrePersist
    public void onCreate() {
        if (createTime == null) {
            createTime = OffsetDateTime.now();
        }
        updateTime = OffsetDateTime.now();
        if (status == null) {
            status = UserStatus.ATIVO;
        }
        if (role == null) {
            role = UserRole.OPERADOR;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updateTime = OffsetDateTime.now();
    }

    public static User findByUsername(String username) {
        return find("username", username).firstResult();
    }

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }

    public static User findByDocumento(String documento) {
        return find("documento", documento).firstResult();
    }
}