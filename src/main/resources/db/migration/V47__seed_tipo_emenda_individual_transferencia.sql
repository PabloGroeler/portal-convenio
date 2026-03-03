-- V47: Seed "Emenda Individual - Transferência com Finalidade Definida"
-- This is the canonical Tipo de Emenda auto-filled when importing emendas
-- with status "Aprovada pelo Gestor" from the external API.

INSERT INTO tipos_emenda (codigo, nome, ativo, ordem, create_time, update_time)
VALUES (
    'EMENDA_INDIVIDUAL_TRANSFERENCIA_FINALIDADE_DEFINIDA',
    'Emenda Individual - Transferência com Finalidade Definida',
    TRUE,
    1,
    NOW(),
    NOW()
)
ON CONFLICT (codigo) DO UPDATE
    SET nome        = EXCLUDED.nome,
        ativo       = TRUE,
        update_time = NOW();

