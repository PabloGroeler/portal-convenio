import api from './api';

export interface EmendaDTO {
  id?: string;
  numeroEmenda?: number; // Task-10
  exercicio?: number; // Task-10
  councilorId?: string;
  councilorName?: string; // From Councilor entity
  councilorPoliticalParty?: string; // From Councilor entity
  officialCode?: string;
  date?: string;
  value?: number;
  classification?: string;
  esfera?: string;
  existeConvenio?: boolean;
  numeroConvenio?: string;
  anoConvenio?: number;
  category?: string;
  /** Legacy field (keep for backward compatibility). */
  status?: string;
  /** Canonical status used by the UI (lifecycle). */
  statusCicloVida?: string;
  institutionId?: string;
  institutionName?: string; // From Institution entity
  signedLink?: string;
  attachments?: string[];
  description?: string;
  objectDetail?: string;
  previsaoConclusao?: string; // Task-10
  justificativa?: string; // Task-10
}

export interface EmendaAcaoDTO {
  acao: 'APROVAR' | 'DEVOLVER' | 'REPROVAR' | 'SOLICITAR_APROVACAO' | 'AGUARDAR_DETALHAMENTO';
  observacao?: string;
  usuario?: string;
}

export interface EmendaHistoricoDTO {
  id: number;
  emendaId: string;
  acao: string;
  statusAnterior?: string;
  statusNovo?: string;
  observacao?: string;
  usuario?: string;
  dataHora: string;
}

export const emendaService = {
  list: async (): Promise<EmendaDTO[]> => {
    const response = await api.get('/emendas');
    return response.data;
  },

  listWithDetails: async (): Promise<EmendaDTO[]> => {
    console.log('[emendaService] Calling GET /emendas/with-details');
    try {
      const response = await api.get('/emendas/with-details');
      console.log('[emendaService] Response status:', response.status);
      console.log('[emendaService] Response data:', response.data);
      console.log('[emendaService] Data type:', typeof response.data);
      console.log('[emendaService] Is array:', Array.isArray(response.data));
      console.log('[emendaService] Data length:', response.data?.length);
      return response.data;
    } catch (error: any) {
      console.error('[emendaService] Error fetching emendas:', error);
      console.error('[emendaService] Error response:', error.response);
      console.error('[emendaService] Error message:', error.message);
      throw error;
    }
  },

  getById: async (id: string): Promise<EmendaDTO> => {
    const response = await api.get(`/emendas/${id}`);
    return response.data;
  },

  getByIdWithDetails: async (id: string): Promise<EmendaDTO> => {
    const response = await api.get(`/emendas/${id}/with-details`);
    return response.data;
  },

  create: async (emenda: Partial<EmendaDTO>): Promise<EmendaDTO> => {
    const response = await api.post('/emendas', emenda);
    return response.data;
  },

  update: async (id: string, emenda: Partial<EmendaDTO>): Promise<EmendaDTO> => {
    const response = await api.put(`/emendas/${id}`, emenda);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/emendas/${id}`);
  },

  executarAcao: async (id: string, acao: EmendaAcaoDTO): Promise<EmendaDTO> => {
    const response = await api.post(`/emendas/${id}/acao`, acao);
    return response.data;
  },

  getHistorico: async (id: string): Promise<EmendaHistoricoDTO[]> => {
    const response = await api.get(`/emendas/${id}/historico`);
    return response.data;
  },
};

export default emendaService;
