import api from './api';

export interface InstitutionDTO {
  id?: string;
  institutionId: string;
  name: string;
}

const institutionService = {
  list: async (): Promise<InstitutionDTO[]> => {
    const response = await api.get('/institutions');
    return response.data;
  },

  getById: async (id: string): Promise<InstitutionDTO> => {
    const response = await api.get(`/institutions/${id}`);
    return response.data;
  },

  getByInstitutionId: async (institutionId: string): Promise<InstitutionDTO> => {
    const response = await api.get(`/institutions/by-institution-id/${institutionId}`);
    return response.data;
  },

  create: async (institution: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    const response = await api.post('/institutions', institution);
    return response.data;
  },

  update: async (id: string, institution: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    const response = await api.put(`/institutions/${id}`, institution);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/institutions/${id}`);
  },
};

export type { InstitutionDTO };
export { institutionService };
export default institutionService;

