import api from './api';

export interface SecretariaMunicipalDTO {
  secretariaId: string;
  nome: string;
  sigla?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  createTime?: string;
  updateTime?: string;
}

const secretariaMunicipalService = {
  list: async (): Promise<SecretariaMunicipalDTO[]> => {
    const res = await api.get('/secretarias-municipais');
    return res.data;
  },

  getById: async (id: string): Promise<SecretariaMunicipalDTO> => {
    const res = await api.get(`/secretarias-municipais/${encodeURIComponent(id)}`);
    return res.data;
  },

  create: async (payload: Partial<SecretariaMunicipalDTO>): Promise<SecretariaMunicipalDTO> => {
    const res = await api.post('/secretarias-municipais', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<SecretariaMunicipalDTO>): Promise<SecretariaMunicipalDTO> => {
    const res = await api.put(`/secretarias-municipais/${encodeURIComponent(id)}`, payload);
    return res.data;
  },

  setAtivo: async (id: string, ativo: boolean): Promise<SecretariaMunicipalDTO> => {
    const res = await api.patch(`/secretarias-municipais/${encodeURIComponent(id)}/ativo`, { ativo });
    return res.data;
  },
};

export default secretariaMunicipalService;

