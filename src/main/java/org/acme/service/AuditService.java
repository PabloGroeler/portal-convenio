package org.acme.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.AuditLog;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

@ApplicationScoped
public class AuditService {

    private static final Logger log = Logger.getLogger(AuditService.class);

    @Inject
    ObjectMapper objectMapper;

    @Transactional
    public void logAcao(String acao, String entidade, String registroId, String detalhes,
                        Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = acao;
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = detalhes;
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
        } catch (Exception e) {
            log.error("Erro ao registrar log de auditoria", e);
        }
    }

    @Transactional
    public void logLogin(Long usuarioId, String usuarioNome, String usuarioEmail, String ipOrigem, boolean sucesso) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = sucesso ? "LOGIN" : "LOGIN_FALHA";
            auditLog.entidade = "Usuario";
            auditLog.registroId = usuarioId != null ? usuarioId.toString() : null;
            auditLog.detalhes = sucesso ? "Login realizado com sucesso" : "Tentativa de login falhou";
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.usuarioEmail = usuarioEmail;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = sucesso ? "SUCESSO" : "FALHA";
            auditLog.persist();
            log.info("✅ Audit log: " + (sucesso ? "LOGIN" : "LOGIN_FALHA") + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de login", e);
        }
    }

    @Transactional
    public void logLogout(Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "LOGOUT";
            auditLog.entidade = "Usuario";
            auditLog.registroId = usuarioId.toString();
            auditLog.detalhes = "Logout realizado";
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: LOGOUT - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de logout", e);
        }
    }

    @Transactional
    public void logCreate(String entidade, String registroId, Object valores,
                          Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "CREATE";
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Registro criado: " + entidade;

            if (valores != null) {
                try {
                    auditLog.valoresNovos = objectMapper.writeValueAsString(valores);
                } catch (Exception e) {
                    auditLog.valoresNovos = valores.toString();
                }
            }

            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: CREATE " + entidade + " - ID: " + registroId + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de criação", e);
        }
    }

    @Transactional
    public void logUpdate(String entidade, String registroId, Object valoresAntigos, Object valoresNovos,
                          Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "UPDATE";
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Registro atualizado: " + entidade;

            if (valoresAntigos != null) {
                try {
                    auditLog.valoresAnteriores = objectMapper.writeValueAsString(valoresAntigos);
                } catch (Exception e) {
                    auditLog.valoresAnteriores = valoresAntigos.toString();
                }
            }

            if (valoresNovos != null) {
                try {
                    auditLog.valoresNovos = objectMapper.writeValueAsString(valoresNovos);
                } catch (Exception e) {
                    auditLog.valoresNovos = valoresNovos.toString();
                }
            }

            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: UPDATE " + entidade + " - ID: " + registroId + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de atualização", e);
        }
    }

    @Transactional
    public void logDelete(String entidade, String registroId, Object valores,
                          Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "DELETE";
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Registro excluído: " + entidade;

            if (valores != null) {
                try {
                    auditLog.valoresAnteriores = objectMapper.writeValueAsString(valores);
                } catch (Exception e) {
                    auditLog.valoresAnteriores = valores.toString();
                }
            }

            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: DELETE " + entidade + " - ID: " + registroId + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de exclusão", e);
        }
    }

    @Transactional
    public void logUpload(String tipoDocumento, String fileName, Long fileSize,
                          Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "UPLOAD";
            auditLog.entidade = "Documento";
            auditLog.registroId = tipoDocumento;
            auditLog.detalhes = "Upload de arquivo: " + fileName + " (" + formatFileSize(fileSize) + ")";
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: UPLOAD " + fileName + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de upload", e);
        }
    }

    @Transactional
    public void logDownload(String tipoDocumento, String fileName,
                            Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "DOWNLOAD";
            auditLog.entidade = "Documento";
            auditLog.registroId = tipoDocumento;
            auditLog.detalhes = "Download de arquivo: " + fileName;
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: DOWNLOAD " + fileName + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de download", e);
        }
    }

    @Transactional
    public void logAcessoNegado(String recurso, String motivo, Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "ACESSO_NEGADO";
            auditLog.entidade = recurso;
            auditLog.detalhes = "Acesso negado: " + motivo;
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "FALHA";
            auditLog.persist();
            log.warn("⚠️ Audit log: ACESSO_NEGADO - Resource: " + recurso + " - User: " + usuarioNome + " - Reason: " + motivo);
        } catch (Exception e) {
            log.error("Erro ao registrar log de acesso negado", e);
        }
    }

    @Transactional
    public void logMudancaStatus(String entidade, String registroId, String statusAnterior, String statusNovo,
                                  Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "MUDANCA_STATUS";
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Status alterado de '" + statusAnterior + "' para '" + statusNovo + "'";
            auditLog.valoresAnteriores = statusAnterior;
            auditLog.valoresNovos = statusNovo;
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: MUDANCA_STATUS " + entidade + " - " + statusAnterior + " → " + statusNovo + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de mudança de status", e);
        }
    }

    @Transactional
    public void logAprovacao(String entidade, String registroId, String observacao,
                             Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "APROVACAO";
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Aprovação realizada" + (observacao != null ? ": " + observacao : "");
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: APROVACAO " + entidade + " - ID: " + registroId + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de aprovação", e);
        }
    }

    @Transactional
    public void logReprovacao(String entidade, String registroId, String motivo,
                              Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "REPROVACAO";
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Reprovação: " + motivo;
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: REPROVACAO " + entidade + " - ID: " + registroId + " - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de reprovação", e);
        }
    }

    @Transactional
    public void logExportacao(String tipoExportacao, int quantidadeRegistros,
                              Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = "EXPORT";
            auditLog.entidade = tipoExportacao;
            auditLog.detalhes = "Exportação de " + quantidadeRegistros + " registro(s)";
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "SUCESSO";
            auditLog.persist();
            log.info("✅ Audit log: EXPORT " + tipoExportacao + " - " + quantidadeRegistros + " records - User: " + usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar log de exportação", e);
        }
    }

    @Transactional
    public void logErro(String acao, String entidade, String registroId, String mensagemErro,
                        Long usuarioId, String usuarioNome, String ipOrigem) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.dataHora = LocalDateTime.now();
            auditLog.acao = acao;
            auditLog.entidade = entidade;
            auditLog.registroId = registroId;
            auditLog.detalhes = "Erro durante operação";
            auditLog.mensagemErro = mensagemErro;
            auditLog.usuarioId = usuarioId;
            auditLog.usuarioNome = usuarioNome;
            auditLog.ipOrigem = ipOrigem;
            auditLog.resultado = "ERRO";
            auditLog.persist();
            log.error("❌ Audit log: ERRO - " + acao + " " + entidade + " - User: " + usuarioNome + " - Error: " + mensagemErro);
        } catch (Exception e) {
            log.error("Erro ao registrar log de erro", e);
        }
    }

    private String formatFileSize(Long bytes) {
        if (bytes == null) return "unknown size";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
    }
}
