export interface DocumentoInstitucional {
  id?: string;
  idInstituicao: string;
  nomeArquivo: string;
  nomeOriginal: string;
  tipoDocumento: string;
  tipoMime: string;
  tamanhoBytes: number;
  descricao?: string;
  dataUpload: string;
  usuarioUpload?: string;
}

export const TIPOS_DOCUMENTO = [
  'Estatuto Social',
  'Ata de Fundação',
  'Ata de Eleição',
  'Certidão de Regularidade',
  'Comprovante de Endereço',
  'CNPJ',
  'Inscrição Municipal',
  'Plano de Trabalho',
  'Relatório de Atividades',
  'Outro'
];

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (tipoMime: string): string => {
  if (tipoMime.includes('pdf')) return '📄';
  if (tipoMime.includes('image')) return '🖼️';
  if (tipoMime.includes('word') || tipoMime.includes('document')) return '📝';
  if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) return '📊';
  if (tipoMime.includes('zip') || tipoMime.includes('rar')) return '📦';
  return '📎';
};

