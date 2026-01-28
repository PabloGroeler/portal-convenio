import api from './api';

export interface CouncilorDTO {
  councilorId: string;
  fullName: string;
  politicalParty?: string;
}

const councilorService = {
  list: async (): Promise<CouncilorDTO[]> => {
    const response = await api.get('/councilors');
    return response.data;
  },

  getByCouncilorId: async (councilorId: string): Promise<CouncilorDTO> => {
    const response = await api.get(`/councilors/by-councilor-id/${encodeURIComponent(councilorId)}`);
    return response.data;
  },

  create: async (councilor: Partial<CouncilorDTO>): Promise<CouncilorDTO> => {
    const response = await api.post('/councilors', councilor);
    return response.data;
  },

  update: async (councilorId: string, councilor: Partial<CouncilorDTO>): Promise<CouncilorDTO> => {
    const response = await api.put(`/councilors/${encodeURIComponent(councilorId)}`, councilor);
    return response.data;
  },

  delete: async (councilorId: string): Promise<void> => {
    await api.delete(`/councilors/${encodeURIComponent(councilorId)}`);
  },
};

export type { CouncilorDTO };
export { councilorService };
export default councilorService;
