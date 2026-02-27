import api from './api';

export type Item = {
  id?: string;
  metaId: string;
  titulo?: string;
  descricao?: string;
  valor?: number;
  createTime?: string;
  updateTime?: string;
};

const base = '/item';

export const listByMeta = async (metaId: string): Promise<Item[]> => {
  const res = await api.get(`${base}/meta/${metaId}`);
  return res.data;
};

export const create = async (payload: Item): Promise<Item> => {
  const res = await api.post(base, payload);
  return res.data;
};

export const update = async (id: string, payload: Item): Promise<Item> => {
  const res = await api.put(`${base}/${id}`, payload);
  return res.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default { listByMeta, create, update, remove };
