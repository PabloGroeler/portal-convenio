import api from './api';

export type Meta = {
  id?: string;
  planoTrabalhoId: string;
  titulo?: string;
  descricao?: string;
  valor?: number;
  periodo?: string;
  createTime?: string;
  updateTime?: string;
};

const base = '/meta';

export const listByPlano = async (planoId: string): Promise<Meta[]> => {
  const { data } = await api.get(`${base}/plano/${planoId}`);
  return data;
};

export const create = async (payload: Meta): Promise<Meta> => {
  const { data } = await api.post(base, payload);
  return data;
};

export const update = async (id: string, payload: Meta): Promise<Meta> => {
  const { data } = await api.put(`${base}/${id}`, payload);
  return data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default { listByPlano, create, update, remove };
