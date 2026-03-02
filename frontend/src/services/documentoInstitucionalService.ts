import api from './api';

export interface DocumentoInstitucional {
  id: string;
  idInstituicao: string;
  nomeArquivo: string;
  nomeOriginal: string;
  tipoDocumento: string;
  tipoMime: string;
  tamanhoBytes: number;
  descricao?: string;
  caminhoArquivo: string;
  dataUpload: string;
  usuarioUpload?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  statusDocumento: string;
  observacoes?: string;
  motivoReprovacao?: string;
  dataAprovacao?: string;
  dataReprovacao?: string;
  numeroDocumento?: string;
  dataEmissao?: string;
  dataValidade?: string;
}

export const documentoInstitucionalService = {
  // Listar documentos de uma instituição
  listar: async (idInstituicao: string): Promise<DocumentoInstitucional[]> => {
    const { data } = await api.get(`/documentos-institucionais/instituicao/${idInstituicao}`);
    return data;
  },

  // Upload de documento
  upload: async (formData: FormData): Promise<DocumentoInstitucional> => {
    const { data } = await api.post('/documentos-institucionais/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Deletar documento
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/documentos-institucionais/${id}`);
  },

  // Aprovar documento (para gestores)
  aprovar: async (id: string, observacoes?: string): Promise<DocumentoInstitucional> => {
    const { data } = await api.post(`/documentos-institucionais/${id}/aprovar`, { observacoes });
    return data;
  },

  // Reprovar documento (para gestores)
  reprovar: async (id: string, motivo: string): Promise<DocumentoInstitucional> => {
    const { data } = await api.post(`/documentos-institucionais/${id}/reprovar`, { motivo });
    return data;
  },

  // URLs for direct browser access (view inline / force download)
  viewUrl: (id: string): string => {
    const base = (api.defaults.baseURL ?? '/api').replace(/\/$/, '');
    return `${base}/documentos-institucionais/${id}/view`;
  },

  downloadUrl: (id: string): string => {
    const base = (api.defaults.baseURL ?? '/api').replace(/\/$/, '');
    return `${base}/documentos-institucionais/${id}/download`;
  },
};

export default documentoInstitucionalService;
