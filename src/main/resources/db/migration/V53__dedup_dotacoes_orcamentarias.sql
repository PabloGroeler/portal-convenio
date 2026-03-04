-- Remove duplicate dotacoes_orcamentarias rows keeping only the one with the lowest id per codigo_reduzido
DELETE FROM dotacoes_orcamentarias
WHERE id NOT IN (
    SELECT MIN(id)
    FROM dotacoes_orcamentarias
    GROUP BY codigo_reduzido
);

