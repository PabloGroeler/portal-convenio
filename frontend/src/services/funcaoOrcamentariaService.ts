import api from './api';

export interface FuncaoOrcamentariaDTO {
  id: number;
  codigo: string;
  descricao: string;
  ativo: boolean;
}

export const funcaoOrcamentariaService = {
  list: async (): Promise<FuncaoOrcamentariaDTO[]> => {
    const response = await api.get('/funcoes-orcamentarias');
    return response.data;
  },
};

export default funcaoOrcamentariaService;

