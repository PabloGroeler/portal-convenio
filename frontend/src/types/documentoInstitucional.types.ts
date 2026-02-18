export interface DocumentoInstitucional {
  id?: string;
  idInstituicao: string;
  tipoDocumento: TipoDocumentoInstitucional;
  nomeArquivo: string;
  nomeOriginal: string;
  tamanhoBytes: number;
  dataUpload: string;
  usuarioUpload?: string;
  dataEmissao?: string;
  dataValidade?: string;
  numeroDocumento?: string;
  statusDocumento: StatusDocumento;
  observacoes?: string;
  motivoReprovacao?: string;
}

export type TipoDocumentoInstitucional =
  // Documentos Institucionais
  | 'CARTAO_CNPJ'
  | 'ESTATUTO_SOCIAL'
  | 'ALVARA_FUNCIONAMENTO'
  | 'DECLARACAO_UTILIDADE_PUBLICA'
  | 'ATA_ELEICAO_DIRETORIA'
  | 'COMPROVANTE_INSCRICAO_CONSELHO'
  | 'COMPROVANTE_ENDERECO_INSTITUICAO'
  // Certidões Negativas da Instituição
  | 'CERTIDAO_TRIBUTOS_FEDERAIS'
  | 'CERTIDAO_TRIBUTOS_ESTADUAIS_PGE'
  | 'CERTIFICADO_FGTS'
  | 'CERTIDAO_DEBITOS_TRABALHISTAS'
  | 'CERTIDAO_DEBITOS_MUNICIPAIS'
  | 'CERTIDAO_TCE_INSTITUICAO'
  // Documentos de Dirigente
  | 'RG_DIRIGENTE'
  | 'CPF_DIRIGENTE'
  | 'COMPROVANTE_ENDERECO_DIRIGENTE'
  | 'CERTIDAO_TCE_DIRIGENTE';

export type StatusDocumento =
  | 'PENDENTE_ENVIO'
  | 'ENVIADO'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'REPROVADO'
  | 'VENCIDO'
  | 'SUBSTITUIDO';

export const TIPOS_DOCUMENTO_LABELS: Record<TipoDocumentoInstitucional, string> = {
  // Documentos Institucionais
  CARTAO_CNPJ: 'Cartão do CNPJ',
  ESTATUTO_SOCIAL: 'Estatuto Social',
  ALVARA_FUNCIONAMENTO: 'Alvará de Funcionamento',
  DECLARACAO_UTILIDADE_PUBLICA: 'Declaração de Utilidade Pública Municipal',
  ATA_ELEICAO_DIRETORIA: 'Ata da Última Eleição de Diretoria',
  COMPROVANTE_INSCRICAO_CONSELHO: 'Comprovante de Inscrição no Conselho Municipal',
  COMPROVANTE_ENDERECO_INSTITUICAO: 'Comprovante de Endereço',
  // Certidões Negativas da Instituição
  CERTIDAO_TRIBUTOS_FEDERAIS: 'Certidão Negativa de Tributos Federais',
  CERTIDAO_TRIBUTOS_ESTADUAIS_PGE: 'Certidão Negativa de Tributos Estaduais – PGE',
  CERTIFICADO_FGTS: 'Certificado de Regularidade do FGTS',
  CERTIDAO_DEBITOS_TRABALHISTAS: 'Certidão Negativa de Débitos Trabalhistas',
  CERTIDAO_DEBITOS_MUNICIPAIS: 'Certidão Negativa de Débitos Municipais',
  CERTIDAO_TCE_INSTITUICAO: 'Certidão Negativa do TCE/MT - Instituição',
  // Documentos Pessoais
  RG_DIRIGENTE: 'RG',
  CPF_DIRIGENTE: 'CPF',
  COMPROVANTE_ENDERECO_DIRIGENTE: 'Comprovante de Endereço',
  CERTIDAO_TCE_DIRIGENTE: 'Certidão Negativa do TCE/MT - Pessoa Física',
};

export const STATUS_DOCUMENTO_LABELS: Record<StatusDocumento, string> = {
  PENDENTE_ENVIO: 'Em Análise',
  ENVIADO: 'Enviado',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  VENCIDO: 'Vencido',
  SUBSTITUIDO: 'Substituído',
};

export const STATUS_DOCUMENTO_COLORS: Record<StatusDocumento, string> = {
  PENDENTE_ENVIO: 'bg-gray-100 text-gray-800 border-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-800 border-blue-200',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APROVADO: 'bg-green-100 text-green-800 border-green-200',
  REPROVADO: 'bg-red-100 text-red-800 border-red-200',
  VENCIDO: 'bg-orange-100 text-orange-800 border-orange-200',
  SUBSTITUIDO: 'bg-gray-100 text-gray-600 border-gray-300',
};

export const DOCUMENTOS_OBRIGATORIOS: TipoDocumentoInstitucional[] = [
  'CARTAO_CNPJ',
  'ESTATUTO_SOCIAL',
  'ALVARA_FUNCIONAMENTO',
  'ATA_ELEICAO_DIRETORIA',
  'COMPROVANTE_INSCRICAO_CONSELHO',
  'COMPROVANTE_ENDERECO_INSTITUICAO',
  'CERTIDAO_TRIBUTOS_FEDERAIS',
  'CERTIDAO_TRIBUTOS_ESTADUAIS_PGE',
  'CERTIFICADO_FGTS',
  'CERTIDAO_DEBITOS_TRABALHISTAS',
  'CERTIDAO_DEBITOS_MUNICIPAIS',
  'CERTIDAO_TCE_INSTITUICAO',
];

export const DOCUMENTOS_INSTITUICAO: TipoDocumentoInstitucional[] = [
  'CARTAO_CNPJ',
  'ESTATUTO_SOCIAL',
  'ALVARA_FUNCIONAMENTO',
  'DECLARACAO_UTILIDADE_PUBLICA',
  'ATA_ELEICAO_DIRETORIA',
  'COMPROVANTE_INSCRICAO_CONSELHO',
  'COMPROVANTE_ENDERECO_INSTITUICAO',
  'CERTIDAO_TRIBUTOS_FEDERAIS',
  'CERTIDAO_TRIBUTOS_ESTADUAIS_PGE',
  'CERTIFICADO_FGTS',
  'CERTIDAO_DEBITOS_TRABALHISTAS',
  'CERTIDAO_DEBITOS_MUNICIPAIS',
  'CERTIDAO_TCE_INSTITUICAO',
];

export const FORMATOS_ACEITOS = ['.pdf', '.jpg', '.jpeg', '.png'];
export const TAMANHO_MAXIMO_MB = 5;
export const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'pdf') return '📄';
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
  return '📎';
};

export const calcularDiasParaVencimento = (dataValidade: string): number => {
  const hoje = new Date();
  const vencimento = new Date(dataValidade);
  const diff = vencimento.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const verificarDocumentoVencido = (dataValidade?: string): boolean => {
  if (!dataValidade) return false;
  return calcularDiasParaVencimento(dataValidade) < 0;
};

export const verificarDocumentoProximoVencimento = (dataValidade?: string): number | null => {
  if (!dataValidade) return null;
  const dias = calcularDiasParaVencimento(dataValidade);
  if (dias >= 0 && dias <= 30) return dias;
  return null;
};

