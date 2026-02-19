import api from './api';
import type { Dirigente } from '../types/dirigente.types';

export const dirigenteService = {
  // Criar novo dirigente
  criar: async (dirigente: Dirigente): Promise<Dirigente> => {
    const { data } = await api.post('/dirigentes', dirigente);
    return data;
  },

  // Listar dirigentes de uma instituição
  listar: async (instituicaoId: string, apenasAtivos: boolean = false): Promise<Dirigente[]> => {
    const { data } = await api.get(`/dirigentes/instituicao/${instituicaoId}`, {
      params: { apenasAtivos }
    });
    return data;
  },

  // Buscar dirigente por ID
  buscarPorId: async (id: string): Promise<Dirigente> => {
    const { data } = await api.get(`/dirigentes/${id}`);
    return data;
  },

  // Alias para buscarPorId (compatibilidade)
  obter: async (id: string): Promise<Dirigente> => {
    console.log('[dirigenteService] obter() chamado com ID:', id);
    const { data } = await api.get(`/dirigentes/${id}`);
    console.log('[dirigenteService] obter() retornou:', data);
    return data;
  },

  // Atualizar dirigente
  atualizar: async (id: string, dirigente: Dirigente): Promise<Dirigente> => {
    const { data } = await api.put(`/dirigentes/${id}`, dirigente);
    return data;
  },

  // Inativar dirigente
  inativar: async (id: string, dataTermino: string, motivo: string): Promise<void> => {
    await api.post(`/dirigentes/${id}/inativar`, {
      dataTermino,
      motivo
    });
  },

  // Verificar avisos de cargos obrigatórios
  verificarAvisos: async (instituicaoId: string): Promise<{ avisos: string[]; temAvisos: boolean }> => {
    const { data } = await api.get(`/dirigentes/instituicao/${instituicaoId}/avisos`);
    return data;
  }
};

export default dirigenteService;

