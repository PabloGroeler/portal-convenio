import api from './api';

export interface EmendaDTO {
  id?: string;
  numeroEmenda?: number;
  exercicio?: number;
  idParlamentar?: string;
  councilorName?: string; // From Councilor entity
  councilorPoliticalParty?: string; // From Councilor entity
  codigoOficial?: string;
  data?: string;
  valor?: number;
  classificacao?: string;
  esfera?: string;
  existeConvenio?: boolean;
  numeroConvenio?: string;
  anoConvenio?: number;
  categoria?: string;
  /** Legacy field (keep for backward compatibility). */
  situacao?: string;
  /** Canonical status used by the UI (lifecycle). */
  statusCicloVida?: string;
  statusFederal?: string;
  idInstituicao?: string;
  institutionName?: string; // From Institution entity
  linkAssinado?: string;
  anexos?: string[];
  descricao?: string;
  objetoDetalhado?: string;
  previsaoConclusao?: string;
  justificativa?: string;
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
    const response = await api.get('/emendas/with-details');
    return response.data;
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
