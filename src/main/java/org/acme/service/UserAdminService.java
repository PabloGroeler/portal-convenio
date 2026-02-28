package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.acme.dto.UserAdminDTO;
import org.acme.entity.User;
import org.acme.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;
import java.util.Locale;

@ApplicationScoped
public class UserAdminService {

    // Local request shapes (keeps service independent from IDE indexing glitches)
    public static class UserAdminCreateRequest {
        public String nomeCompleto;
        public String documento;
        public String email;
        public String telefone;
        public String cargoFuncao;
        public String secretaria;
        public String status;
        public String role;
        public String password;
    }

    public static class UserAdminUpdateRequest {
        public String nomeCompleto;
        public String documento;
        public String email;
        public String telefone;
        public String cargoFuncao;
        public String secretaria;
        public String status;
        public String role;
        public String password;
    }

    private final UserRepository userRepository;

    public UserAdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserAdminDTO> list() {
        return userRepository.findAll().list().stream().map(UserAdminDTO::fromEntity).toList();
    }

    public UserAdminDTO get(Long id) {
        User u = userRepository.findById(id);
        if (u == null) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        return UserAdminDTO.fromEntity(u);
    }

    @Transactional
    public UserAdminDTO create(UserAdminCreateRequest req) {
        if (req == null) throw new IllegalArgumentException("Body é obrigatório");

        String documento = normalizeDocumento(req.documento);
        if (documento.isBlank()) throw new IllegalArgumentException("Documento (CPF ou CNPJ) é obrigatório");

        // Validate documento length (11 for CPF, 14 for CNPJ)
        if (documento.length() != 11 && documento.length() != 14) {
            throw new IllegalArgumentException("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)");
        }

        if (User.findByDocumento(documento) != null) throw new IllegalArgumentException("Documento já cadastrado");
        if (req.email == null || req.email.isBlank()) throw new IllegalArgumentException("E-mail é obrigatório");
        if (User.findByEmail(req.email) != null) throw new IllegalArgumentException("E-mail já cadastrado");

        if (req.nomeCompleto == null || req.nomeCompleto.isBlank()) throw new IllegalArgumentException("Nome completo é obrigatório");
        if (req.password == null || req.password.isBlank()) throw new IllegalArgumentException("Senha é obrigatória");

        User u = new User();
        u.nomeCompleto = req.nomeCompleto.trim();
        u.documento = documento;
        u.email = req.email.trim().toLowerCase(Locale.ROOT);
        u.telefone = blankToNull(req.telefone);
        u.cargoFuncao = blankToNull(req.cargoFuncao);
        u.secretaria = blankToNull(req.secretaria);
        u.role = parseRole(req.role, User.UserRole.OPERADOR);

        // Keep username for auth compatibility. Use email as username by default.
        u.username = (req.email != null && !req.email.isBlank()) ? req.email.trim().toLowerCase(Locale.ROOT) : documento;
        if (User.findByUsername(u.username) != null) {
            // fallback to documento
            u.username = documento;
        }
        if (User.findByUsername(u.username) != null) {
            throw new IllegalArgumentException("Username já cadastrado");
        }

        u.password = BCrypt.hashpw(req.password, BCrypt.gensalt());
        userRepository.persist(u);
        return UserAdminDTO.fromEntity(u);
    }

    @Transactional
    public UserAdminDTO update(Long id, UserAdminUpdateRequest req) {
        if (req == null) throw new IllegalArgumentException("Body é obrigatório");
        User u = userRepository.findById(id);
        if (u == null) throw new IllegalArgumentException("Usuário não encontrado");

        if (req.nomeCompleto != null) u.nomeCompleto = req.nomeCompleto.trim();

        // Atualizar documento (CPF ou CNPJ)
        if (req.documento != null) {
            String documento = normalizeDocumento(req.documento);
            if (!documento.isEmpty()) {
                // Validate documento length
                if (documento.length() != 11 && documento.length() != 14) {
                    throw new IllegalArgumentException("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)");
                }

                User other = User.findByDocumento(documento);
                if (other != null && !other.id.equals(u.id)) {
                    throw new IllegalArgumentException("Documento já cadastrado");
                }
                u.documento = documento;
            } else {
                u.documento = null;
            }
        }

        if (req.email != null) {
            String email = req.email.trim().toLowerCase(Locale.ROOT);
            User other = User.findByEmail(email);
            if (other != null && !other.id.equals(u.id)) {
                throw new IllegalArgumentException("E-mail já cadastrado");
            }
            u.email = email;
        }

        if (req.telefone != null) u.telefone = blankToNull(req.telefone);
        if (req.cargoFuncao != null) u.cargoFuncao = blankToNull(req.cargoFuncao);
        if (req.secretaria != null) u.secretaria = blankToNull(req.secretaria);

        if (req.status != null) u.status = parseStatus(req.status, u.status);
        if (req.role != null) u.role = parseRole(req.role, u.role);

        if (req.password != null && !req.password.isBlank()) {
            u.password = BCrypt.hashpw(req.password, BCrypt.gensalt());
        }

        return UserAdminDTO.fromEntity(u);
    }

    @Transactional
    public void delete(Long id) {
        boolean deleted = userRepository.deleteById(id);
        if (!deleted) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
    }

    private static String normalizeDocumento(String documento) {
        if (documento == null || documento.isBlank()) return "";
        return documento.replaceAll("\\D", "");
    }

    private static String blankToNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isBlank() ? null : t;
    }

    private static User.UserStatus parseStatus(String v, User.UserStatus fallback) {
        if (v == null || v.isBlank()) return fallback;
        return User.UserStatus.valueOf(v.trim().toUpperCase(Locale.ROOT));
    }

    private static User.UserRole parseRole(String v, User.UserRole fallback) {
        if (v == null || v.isBlank()) return fallback;
        return User.UserRole.valueOf(v.trim().toUpperCase(Locale.ROOT));
    }
}
