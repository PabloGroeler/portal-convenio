import api from './api';
import type { DocumentoInstitucional } from '../types/documento.types';

export const documentoService = {
  // Listar documentos de uma instituição
  listar: async (idInstituicao: string): Promise<DocumentoInstitucional[]> => {
    const { data } = await api.get(`/documentos-institucionais/instituicao/${idInstituicao}`);
    return data;
  },

  // Upload de documento
  upload: async (
    idInstituicao: string,
    file: File,
    tipoDocumento: string,
    descricao: string,
    usuarioUpload?: string
  ): Promise<DocumentoInstitucional> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('idInstituicao', idInstituicao);
    formData.append('tipoDocumento', tipoDocumento);
    formData.append('descricao', descricao || '');
    if (usuarioUpload) {
      formData.append('usuarioUpload', usuarioUpload);
    }

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

  // Baixar documento
  downloadUrl: (id: string): string => {
    return `/api/api/documentos-institucionais/${id}/download`;
  },
};

export default documentoService;

