// Types for Dirigente (diretoria management)

export interface Dirigente {
  id?: string;
  instituicaoId: string;

  // Dados Pessoais
  nomeCompleto: string;
  nomeSocial?: string;
  cpf: string;
  rg: string;
  orgaoExpedidor: string;
  ufOrgaoExpedidor: string;
  dataExpedicao: string;
  dataNascimento: string;
  sexo: string;
  nacionalidade: string;
  estadoCivil: string;

  // Cargo
  cargo: string;
  dataInicioCargo: string;
  dataTerminoCargo?: string;
  statusCargo: string;
  motivoInativacao?: string;

  // Contato
  telefone: string;
  celular?: string;
  email: string;

  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export const SEXO_OPTIONS = [
  'Masculino',
  'Feminino',
  'Outro',
  'Prefiro não informar'
];

export const ESTADO_CIVIL_OPTIONS = [
  'Solteiro',
  'Casado',
  'Divorciado',
  'Viúvo',
  'União Estável'
];

export const CARGO_OPTIONS = [
  'Presidente',
  'Vice-Presidente',
  'Secretário',
  'Tesoureiro',
  'Conselheiro Fiscal',
  'Outro'
];

export const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

