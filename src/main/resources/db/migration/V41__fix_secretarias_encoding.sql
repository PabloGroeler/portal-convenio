-- V41: Fix secretarias_municipais names — replace unicode-escaped with proper UTF-8 accented characters
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE ADMINISTRAÇÃO E MODERNIZAÇÃO' WHERE codigo = '03';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE FINANÇAS E ORÇAMENTO'         WHERE codigo = '04';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE OBRAS E SERVIÇOS URBANOS'      WHERE codigo = '07';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE SEGURANÇA E TRÂNSITO'           WHERE codigo = '08';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE MEIO AMBIENTE E DESENVOLVIMENTO SUSTENTÁVEL' WHERE codigo = '10';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE EDUCAÇÃO'                       WHERE codigo = '11';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE ASSISTÊNCIA SOCIAL'             WHERE codigo = '12';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE DESENVOLVIMENTO ECONÔMICO'      WHERE codigo = '13';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE SAÚDE'                          WHERE codigo = '14';
UPDATE secretarias_municipais SET nome = 'SECRETARIA DE GOVERNO E PLANEJAMENTO ESTRATÉGICO'       WHERE codigo = '17';
UPDATE secretarias_municipais SET nome = 'SECRETARIA MUNICIPAL DE PLANEJAMENTO URBANO E HABITAÇÃO' WHERE codigo = '21';
UPDATE secretarias_municipais SET nome = 'PROCURADORIA GERAL DO MUNICÍPIO'                        WHERE codigo = '22';

