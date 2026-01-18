import api from './api';

export interface EmendaDTO {
  id?: number;
  name: string;
  code?: string;
  year?: number;
  value?: number;
  status?: string;
  description?: string;
  institution?: string;
  parlamentar?: string;
  hasDetail?: boolean;
  legalName?: string;
  cnpj?: string;
  category?: string;
  link?: string;
  contactEmail?: string;
  contactPhone?: string;
  createTime?: string;
  updateTime?: string;
}

export interface EmendaAcaoDTO {
  acao: 'APROVAR' | 'DEVOLVER' | 'REPROVAR' | 'SOLICITAR_APROVACAO';
  observacao?: string;
  usuario?: string;
}

export interface EmendaHistoricoDTO {
  id: number;
  emendaId: number;
  acao: string;
  statusAnterior?: string;
  statusNovo?: string;
  observacao?: string;
  usuario?: string;
  dataHora: string;
}

export const emendaService = {
  async list(): Promise<EmendaDTO[]> {
    const response = await api.get('/emendas');
    return response.data;
  },

  async getById(id: number): Promise<EmendaDTO> {
    const response = await api.get(`/emendas/${id}`);
    return response.data;
  },

  async create(emenda: EmendaDTO): Promise<EmendaDTO> {
    const response = await api.post('/emendas', emenda);
    return response.data;
  },

  async update(id: number, emenda: EmendaDTO): Promise<EmendaDTO> {
    const response = await api.put(`/emendas/${id}`, emenda);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/emendas/${id}`);
  },

  async executarAcao(id: number, acao: EmendaAcaoDTO): Promise<EmendaDTO> {
    const response = await api.post(`/emendas/${id}/acao`, acao);
    return response.data;
  },

  async getHistorico(id: number): Promise<EmendaHistoricoDTO[]> {
    const response = await api.get(`/emendas/${id}/historico`);
    return response.data;
  },
};

export default emendaService;

