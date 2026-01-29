import api from './api';

export interface TipoEmendaDTO {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  createTime?: string;
  updateTime?: string;
}

export const tipoEmendaService = {
  list: async (): Promise<TipoEmendaDTO[]> => {
    // Prefer /tipos-emenda (JIRA 2). If your proxy only forwards /api, you can switch to '/tipos-emenda' server-side.
    // With baseURL '/api', this will call '/api/tipos-emenda' which is also supported.
    const response = await api.get('/tipos-emenda');
    return response.data;
  },
};

export default tipoEmendaService;

