// src/main/java/org/acme/entity/User.java
package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "app_user")
public class User extends PanacheEntity {

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(unique = true, nullable = false)
    public String username;

    @NotBlank
    @Email
    @Column(unique = true, nullable = false)
    public String email;

    @NotBlank
    @Size(min = 6)
    @Column(nullable = false)
    public String password;

    public static User findByUsername(String username) {
        return find("username", username).firstResult();
    }

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}