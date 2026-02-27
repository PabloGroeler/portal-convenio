import api from './api';

export type PrestacaoConta = {
  id?: string;
  planoTrabalhoId: string;
  valorExecutado?: number;
  observacoes?: string;
  createTime?: string;
  updateTime?: string;
};

const base = '/prestacao-contas';

export const listByPlano = async (planoId: string): Promise<PrestacaoConta[]> => {
  const res = await api.get(`${base}/plano/${planoId}`);
  return res.data;
};

export const create = async (payload: PrestacaoConta): Promise<PrestacaoConta> => {
  const res = await api.post(base, payload);
  return res.data;
};

export const update = async (id: string, payload: PrestacaoConta): Promise<PrestacaoConta> => {
  const res = await api.put(`${base}/${id}`, payload);
  return res.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default { listByPlano, create, update, remove };
