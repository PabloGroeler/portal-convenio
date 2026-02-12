import api from './api';
import type { DocumentoInstitucional } from '../types/documentoInstitucional.types';

export const documentoInstitucionalService = {
  // Listar documentos de uma instituição
  listar: async (idInstituicao: string): Promise<DocumentoInstitucional[]> => {
    const { data } = await api.get(`/documentos-institucionais/instituicao/${idInstituicao}`);
    return data;
  },

  // Obter um documento específico
  obter: async (id: string): Promise<DocumentoInstitucional> => {
    const { data } = await api.get(`/documentos-institucionais/${id}`);
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

  // Atualizar informações do documento (não o arquivo)
  atualizar: async (id: string, documento: Partial<DocumentoInstitucional>): Promise<DocumentoInstitucional> => {
    const { data } = await api.put(`/documentos-institucionais/${id}`, documento);
    return data;
  },

  // Deletar documento
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/documentos-institucionais/${id}`);
  },

  // Baixar documento
  downloadUrl: (id: string): string => {
    return `/api/documentos-institucionais/${id}/download`;
  },

  // Visualizar documento inline (para PDFs e imagens)
  viewUrl: (id: string): string => {
    return `/api/documentos-institucionais/${id}/view`;
  },

  // Alias for backward compatibility
  visualizarUrl: (id: string): string => {
    return `/api/documentos-institucionais/${id}/view`;
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

  // Obter dashboard de documentos
  getDashboard: async (idInstituicao: string) => {
    const { data } = await api.get(`/documentos-institucionais/instituicao/${idInstituicao}/dashboard`);
    return data;
  },
};

export default documentoInstitucionalService;

