import api from './api';
import type { DocumentoPessoalDTO, UploadDocumentoRequest } from '../types/documentoPessoal.types';

// Re-export types for backward compatibility
export type { DocumentoPessoalDTO, UploadDocumentoRequest } from '../types/documentoPessoal.types';

// Service implementation
const documentoPessoalService = {
  /**
   * Upload de documento pessoal
   */
  async upload(request: UploadDocumentoRequest): Promise<DocumentoPessoalDTO> {
    const formData = new FormData();
    formData.append('dirigenteId', request.dirigenteId);
    formData.append('tipoDocumento', request.tipoDocumento);
    formData.append('file', request.file);

    if (request.numeroDocumento) {
      formData.append('numeroDocumento', request.numeroDocumento);
    }
    if (request.dataEmissao) {
      formData.append('dataEmissao', request.dataEmissao);
    }
    if (request.dataValidade) {
      formData.append('dataValidade', request.dataValidade);
    }
    if (request.descricao) {
      formData.append('descricao', request.descricao);
    }

    const response = await api.post('/documentos-pessoais/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Listar documentos de um dirigente
   */
  async listarPorDirigente(dirigenteId: string): Promise<DocumentoPessoalDTO[]> {
    const response = await api.get(`/documentos-pessoais/dirigente/${dirigenteId}`);
    return response.data;
  },

  /**
   * Download de documento
   */
  async download(id: string): Promise<Blob> {
    const response = await api.get(`/documentos-pessoais/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Aprovar documento
   */
  async aprovar(id: string, observacoes?: string): Promise<DocumentoPessoalDTO> {
    const response = await api.post(`/documentos-pessoais/${id}/aprovar`, {
      observacoes,
    });
    return response.data;
  },

  /**
   * Reprovar documento
   */
  async reprovar(id: string, motivo: string): Promise<DocumentoPessoalDTO> {
    const response = await api.post(`/documentos-pessoais/${id}/reprovar`, {
      motivo,
    });
    return response.data;
  },

  /**
   * Excluir documento
   */
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/documentos-pessoais/${id}`);
  },
};

// Named export
export { documentoPessoalService };

// Default export
export default documentoPessoalService;

// Force module reload - timestamp: 2026-02-19T14:05:00

