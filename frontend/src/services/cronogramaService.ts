import api from './api';

export type Cronograma = {
  id?: string;
  metaId: string;
  dataPrevista?: string; // ISO date
  atividade?: string;
  createTime?: string;
  updateTime?: string;
};

const base = '/cronograma';

export const listByMeta = async (metaId: string): Promise<Cronograma[]> => {
  const res = await api.get(`${base}/meta/${metaId}`);
  return res.data;
};

export const create = async (payload: Cronograma): Promise<Cronograma> => {
  const res = await api.post(base, payload);
  return res.data;
};

export const update = async (id: string, payload: Cronograma): Promise<Cronograma> => {
  const res = await api.put(`${base}/${id}`, payload);
  return res.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default { listByMeta, create, update, remove };
