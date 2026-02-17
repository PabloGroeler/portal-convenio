package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logs_auditoria", indexes = {
    @Index(name = "idx_audit_usuario", columnList = "usuario_id"),
    @Index(name = "idx_audit_data", columnList = "data_hora"),
    @Index(name = "idx_audit_acao", columnList = "acao"),
    @Index(name = "idx_audit_entidade", columnList = "entidade")
})
public class AuditLog extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "data_hora", nullable = false)
    public LocalDateTime dataHora;

    @Column(name = "origem", length = 50)
    public String origem; // 'APPLICATION' ou 'DATABASE_TRIGGER'

    @Column(name = "usuario_id")
    public Long usuarioId;

    @Column(name = "usuario_nome", length = 200)
    public String usuarioNome;

    @Column(name = "usuario_email", length = 200)
    public String usuarioEmail;

    @Column(name = "ip_origem", length = 45)
    public String ipOrigem;

    @Column(name = "acao", nullable = false, length = 50)
    public String acao; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, UPLOAD, DOWNLOAD, EXPORT, etc.

    @Column(name = "entidade", length = 100)
    public String entidade; // Nome da tabela/entidade afetada

    @Column(name = "registro_id", length = 100)
    public String registroId; // ID do registro afetado

    @Column(name = "detalhes", columnDefinition = "TEXT")
    public String detalhes; // Descrição da ação

    @Column(name = "valores_anteriores", columnDefinition = "TEXT")
    public String valoresAnteriores; // JSON com valores antes da alteração

    @Column(name = "valores_novos", columnDefinition = "TEXT")
    public String valoresNovos; // JSON com valores após a alteração

    @Column(name = "resultado", length = 20)
    public String resultado; // SUCESSO, FALHA, ERRO

    @Column(name = "mensagem_erro", columnDefinition = "TEXT")
    public String mensagemErro; // Mensagem de erro se falhou

    @Column(name = "user_agent", length = 500)
    public String userAgent;

    @Column(name = "sessao_id", length = 100)
    public String sessaoId;

    @Column(name = "duracao_ms")
    public Long duracaoMs; // Duração da operação em milissegundos

    @PrePersist
    public void prePersist() {
        if (dataHora == null) {
            dataHora = LocalDateTime.now();
        }
        if (origem == null) {
            origem = "APPLICATION";
        }
        if (resultado == null) {
            resultado = "SUCESSO";
        }
    }
}
