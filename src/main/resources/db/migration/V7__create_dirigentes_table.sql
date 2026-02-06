-- Criar tabela de dirigentes
CREATE TABLE IF NOT EXISTS dirigentes (
    id VARCHAR(36) PRIMARY KEY,
    id_instituicao VARCHAR(100) NOT NULL,

    -- Dados Pessoais
    nome_completo VARCHAR(200) NOT NULL,
    nome_social VARCHAR(200),
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(20) NOT NULL,
    orgao_expedidor VARCHAR(20) NOT NULL,
    uf_orgao_expedidor VARCHAR(2) NOT NULL,
    data_expedicao DATE NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(50) NOT NULL,
    nacionalidade VARCHAR(100) NOT NULL,
    estado_civil VARCHAR(50) NOT NULL,

    -- Cargo
    cargo VARCHAR(100) NOT NULL,
    data_inicio_cargo DATE NOT NULL,
    data_termino_cargo DATE,
    status_cargo VARCHAR(20) NOT NULL DEFAULT 'Ativo',
    motivo_inativacao VARCHAR(500),

    -- Contato
    telefone VARCHAR(20) NOT NULL,
    celular VARCHAR(20),
    email VARCHAR(200) NOT NULL,

    -- Endereço
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,

    -- Auditoria
    data_criacao TIMESTAMP WITH TIME ZONE,
    data_atualizacao TIMESTAMP WITH TIME ZONE,

    -- Foreign Key
    CONSTRAINT fk_dirigente_instituicao FOREIGN KEY (id_instituicao) REFERENCES instituicoes(id_instituicao)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dirigentes_instituicao ON dirigentes(id_instituicao);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dirigentes_cpf ON dirigentes(cpf);
CREATE INDEX IF NOT EXISTS idx_dirigentes_cargo_status ON dirigentes(cargo, status_cargo);

-- Comentários
COMMENT ON TABLE dirigentes IS 'Tabela de dirigentes das instituições (OSC)';
COMMENT ON COLUMN dirigentes.id IS 'ID único do dirigente (UUID)';
COMMENT ON COLUMN dirigentes.status_cargo IS 'Status no cargo: Ativo ou Inativo';
COMMENT ON COLUMN dirigentes.cargo IS 'Cargo: Presidente, Vice-Presidente, Secretário, Tesoureiro, Conselheiro Fiscal, Outro';

