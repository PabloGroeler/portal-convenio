import api from './api';

export interface CouncilorDTO {
  id?: number;
  councilorId: string;
  fullName: string;
  politicalParty?: string;
}

const councilorService = {
  list: async (): Promise<CouncilorDTO[]> => {
    const response = await api.get('/councilors');
    return response.data;
  },

  getById: async (id: number): Promise<CouncilorDTO> => {
    const response = await api.get(`/councilors/${id}`);
    return response.data;
  },

  getByCouncilorId: async (councilorId: string): Promise<CouncilorDTO> => {
    const response = await api.get(`/councilors/by-councilor-id/${councilorId}`);
    return response.data;
  },

  create: async (councilor: Partial<CouncilorDTO>): Promise<CouncilorDTO> => {
    const response = await api.post('/councilors', councilor);
    return response.data;
  },

  update: async (id: number, councilor: Partial<CouncilorDTO>): Promise<CouncilorDTO> => {
    const response = await api.put(`/councilors/${id}`, councilor);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/councilors/${id}`);
  },
};

export type { CouncilorDTO };
export { councilorService };
export default councilorService;
