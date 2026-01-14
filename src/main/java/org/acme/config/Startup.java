package org.acme.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.acme.entity.User;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class Startup {

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        // Check if admin user already exists
        if (User.count() == 0) {
            User admin = new User();
            admin.username = "admin";
            admin.email = "admin@admin.com";
            admin.password = BCrypt.hashpw("123", BCrypt.gensalt());
            admin.persist();
            System.out.println("Created admin user with email: admin@admin.com");
        }
    }
}
