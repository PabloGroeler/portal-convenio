import api from './api';

export interface CouncilorDTO {
  idParlamentar: string;
  nomeCompleto: string;
  partidoPolitico?: string;
}

const councilorService = {
  list: async (): Promise<CouncilorDTO[]> => {
    const response = await api.get('/councilors');
    return response.data;
  },

  getByCouncilorId: async (idParlamentar: string): Promise<CouncilorDTO> => {
    const response = await api.get(`/councilors/by-parlamentar-id/${encodeURIComponent(idParlamentar)}`);
    return response.data;
  },

  create: async (parlamentar: Partial<CouncilorDTO>): Promise<CouncilorDTO> => {
    const response = await api.post('/councilors', parlamentar);
    return response.data;
  },

  update: async (idParlamentar: string, parlamentar: Partial<CouncilorDTO>): Promise<CouncilorDTO> => {
    const response = await api.put(`/councilors/${encodeURIComponent(idParlamentar)}`, parlamentar);
    return response.data;
  },

  delete: async (idParlamentar: string): Promise<void> => {
    await api.delete(`/councilors/${encodeURIComponent(idParlamentar)}`);
  },
};

export type { CouncilorDTO };
export { councilorService };
export default councilorService;
