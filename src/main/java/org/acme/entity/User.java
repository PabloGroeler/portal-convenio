// src/main/java/org/acme/entity/User.java
package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

@Entity
@Table(name = "usuarios")
public class User extends PanacheEntity {

    public enum UserStatus {
        ATIVO,
        INATIVO,
        BLOQUEADO
    }

    public enum UserRole {
        ADMIN,
        OPERADOR,
        ANALISTA,
        JURIDICO
    }

    @NotBlank
    @Size(max = 200)
    @Column(name = "nome_completo", nullable = false, length = 200)
    public String nomeCompleto;

    // Store only digits. Validation + formatting handled in service/resource.
    // Nullable during registration - user can complete profile later
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    @Column(name = "cpf", length = 11, unique = true)
    public String cpf;

    @NotBlank
    @Email
    @Column(name = "email", unique = true, nullable = false)
    public String email;

    @Column(name = "telefone", length = 30)
    public String telefone;

    @Column(name = "cargo_funcao", length = 120)
    public String cargoFuncao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    public UserStatus status = UserStatus.ATIVO;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil", nullable = false, length = 30)
    public UserRole role = UserRole.OPERADOR;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(name = "nome_usuario", unique = true, nullable = false, length = 50)
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

    public static User findByCpf(String cpf) {
        return find("cpf", cpf).firstResult();
    }
}