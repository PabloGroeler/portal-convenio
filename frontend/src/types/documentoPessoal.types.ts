/**
 * Types para Documentos Pessoais
 */

export interface DocumentoPessoalDTO {
  id: string;
  dirigenteId: string;
  tipoDocumento: string;
  nomeOriginal: string;
  tipoMime: string;
  tamanhoBytes: number;
  numeroDocumento?: string;
  dataEmissao?: string;
  dataValidade?: string;
  descricao?: string;
  dataUpload: string;
  usuarioUpload?: string;
  statusDocumento: string;
  observacoes?: string;
  motivoReprovacao?: string;
  dataAprovacao?: string;
  dataReprovacao?: string;
}

export interface UploadDocumentoRequest {
  dirigenteId: string;
  tipoDocumento: string;
  file: File;
  numeroDocumento?: string;
  dataEmissao?: string;
  dataValidade?: string;
  descricao?: string;
}
