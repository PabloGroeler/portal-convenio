package org.acme.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.acme.entity.TipoEmenda;
import org.acme.entity.User;
import org.acme.repository.TipoEmendaRepository;
import org.mindrot.jbcrypt.BCrypt;

import java.util.LinkedHashMap;
import java.util.Map;

@ApplicationScoped
public class Startup {

    @jakarta.inject.Inject
    TipoEmendaRepository tipoEmendaRepository;

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        // Check if admin user already exists
        if (User.count() == 0) {
            User admin = new User();
            admin.username = "admin";
            admin.email = "a@a.com";
            admin.password = BCrypt.hashpw("123", BCrypt.gensalt());
            admin.persist();
            System.out.println("Created admin user with email: admin@admin.com");
        }

        // Seed Tipos de Emenda (catalog) on startup (idempotent)
        // Equivalent to V5__seed_tipos_emenda.sql, but executed at runtime since Flyway isn't enabled.
        Map<String, TipoEmendaSeed> seeds = new LinkedHashMap<>();
        seeds.put("EMENDA_BANCADA", new TipoEmendaSeed("Emenda de Bancada", true, 10));
        seeds.put("EMENDA_COMISSAO", new TipoEmendaSeed("Emenda de Comissão", true, 20));
        seeds.put("EMENDA_PIX", new TipoEmendaSeed("Emenda Pix", true, 30));
        seeds.put("INDIVIDUAL_FINALIDADE_DEFINIDA", new TipoEmendaSeed("Emenda Individual – Transferências com Finalidade Definida", true, 40));
        seeds.put("INDIVIDUAL_TRANSFERENCIA_ESPECIAL", new TipoEmendaSeed("Emenda Individual – Transferências Especiais", true, 50));

        for (Map.Entry<String, TipoEmendaSeed> entry : seeds.entrySet()) {
            String codigo = entry.getKey();
            TipoEmendaSeed seed = entry.getValue();

            TipoEmenda existing = tipoEmendaRepository.find("codigo", codigo).firstResult();
            if (existing == null) {
                TipoEmenda t = new TipoEmenda();
                t.codigo = codigo;
                t.nome = seed.nome;
                t.ativo = seed.ativo;
                t.ordem = seed.ordem;
                tipoEmendaRepository.persist(t);
            } else {
                // Keep it aligned with the seed (like ON CONFLICT DO UPDATE)
                existing.nome = seed.nome;
                existing.ativo = seed.ativo;
                existing.ordem = seed.ordem;
                // createTime/updateTime handled by JPA callbacks
            }
        }
    }

    private record TipoEmendaSeed(String nome, boolean ativo, int ordem) {}
}
