// Types for userService - separate file to avoid cache issues

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  instituicoes?: string[];
}

export interface InstituicaoDetalhada {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  emailInstitucional: string;
  telefone: string;
  cidade: string;
  uf: string;
  dataVinculo: string;
  ativo: boolean;
}

export interface EmendaResumida {
  id: string;
  codigoOficial: string;
  valor: number;
  descricao: string;
  status: string;
  instituicaoNome: string;
  parlamentarNome: string;
  dataCriacao: string;
  categoria: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

