import api from './api';

export interface TipoDocumentoConfig {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  descricao?: string;
  ativo: boolean;
  numeroDocumentoObrigatorio: boolean;
  dataEmissaoObrigatoria: boolean;
  dataValidadeObrigatoria: boolean;
  ordem: number;
}

const tipoDocumentoConfigService = {
  listar: async (): Promise<TipoDocumentoConfig[]> => {
    const { data } = await api.get<TipoDocumentoConfig[]>('/tipos-documento-config');
    return data;
  },

  buscarPorCodigo: async (codigo: string): Promise<TipoDocumentoConfig> => {
    const { data } = await api.get<TipoDocumentoConfig>(`/tipos-documento-config/${codigo}`);
    return data;
  },

  listarPorCategoria: async (categoria: string): Promise<TipoDocumentoConfig[]> => {
    const { data } = await api.get<TipoDocumentoConfig[]>(`/tipos-documento-config/categoria/${categoria}`);
    return data;
  },

  atualizar: async (codigo: string, config: Partial<TipoDocumentoConfig>): Promise<TipoDocumentoConfig> => {
    const { data } = await api.put<TipoDocumentoConfig>(`/tipos-documento-config/${codigo}`, config);
    return data;
  },
};

export default tipoDocumentoConfigService;
