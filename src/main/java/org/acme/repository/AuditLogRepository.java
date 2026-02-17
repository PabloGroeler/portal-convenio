package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class AuditLogRepository implements PanacheRepositoryBase<AuditLog, Long> {

    /**
     * Busca logs por origem (APPLICATION ou DATABASE_TRIGGER)
     */
    public List<AuditLog> findByOrigem(String origem) {
        return find("origem", origem).list();
    }

    /**
     * Busca logs por usuário
     */
    public List<AuditLog> findByUsuarioId(Long usuarioId) {
        return find("usuarioId", usuarioId).list();
    }

    /**
     * Busca logs por entidade e registro
     */
    public List<AuditLog> findByEntidadeAndRegistro(String entidade, String registroId) {
        return find("entidade = ?1 and registroId = ?2", entidade, registroId).list();
    }

    /**
     * Busca logs por período
     */
    public List<AuditLog> findByPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return find("dataHora between ?1 and ?2", inicio, fim).list();
    }

    /**
     * Busca logs por ação
     */
    public List<AuditLog> findByAcao(String acao) {
        return find("acao", acao).list();
    }

    /**
     * Busca operações diretas no banco (via triggers)
     */
    public List<AuditLog> findOperacoesDirectas() {
        return find("origem = 'DATABASE_TRIGGER' order by dataHora desc").list();
    }

    /**
     * Busca alertas de deleção (via triggers)
     */
    public List<AuditLog> findAlertasDelecao() {
        return find("acao = 'DELETE' and origem = 'DATABASE_TRIGGER' order by dataHora desc").list();
    }

    /**
     * Busca logs recentes (últimas N horas)
     */
    public List<AuditLog> findRecentes(int horas) {
        LocalDateTime inicio = LocalDateTime.now().minusHours(horas);
        return find("dataHora >= ?1 order by dataHora desc", inicio).list();
    }

    /**
     * Conta logs por origem
     */
    public long countByOrigem(String origem) {
        return count("origem", origem);
    }

    /**
     * Conta logs por ação
     */
    public long countByAcao(String acao) {
        return count("acao", acao);
    }
}
