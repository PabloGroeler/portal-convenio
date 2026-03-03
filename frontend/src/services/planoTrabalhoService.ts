import api from './api';
import type { PlanoTrabalho } from '../types/planoTrabalho.types';

const service = {
  listAll: async (): Promise<PlanoTrabalho[]> => {
    const res = await api.get('/plano-trabalho');
    return res.data;
  },
  listByInstituicao: async (instituicaoId: string): Promise<PlanoTrabalho[]> => {
    const res = await api.get(`/plano-trabalho/instituicao/${instituicaoId}`);
    return res.data;
  },
  get: async (id: string): Promise<PlanoTrabalho> => {
    const res = await api.get(`/plano-trabalho/${id}`);
    return res.data;
  },
  getFull: async (id: string) => {
    const res = await api.get(`/plano-trabalho/full/${id}`);
    return res;
  },
  create: async (payload: Partial<PlanoTrabalho>) => {
    const res = await api.post('/plano-trabalho', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<PlanoTrabalho>) => {
    const res = await api.put(`/plano-trabalho/${id}`, payload);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/plano-trabalho/${id}`);
  },
  aprovar: async (id: string, motivo: string) => {
    const res = await api.post(`/plano-trabalho/${id}/aprovar`, { motivo });
    return res.data;
  },
  reprovar: async (id: string, motivo: string) => {
    const res = await api.post(`/plano-trabalho/${id}/reprovar`, { motivo });
    return res.data;
  }
}

export default service;
