import api from './api';

const base = '/admin/parlamentar-limites';

const listAll = () => api.get(base);
const listByParlamentar = (parlamentarId: string) => api.get(`${base}/parlamentar/${parlamentarId}`);
const create = (payload: {parlamentarId: string; ano: number; valorAnual: number}) => api.post(base, payload);
const update = (id: number, payload: {valorAnual: number}) => api.put(`${base}/${id}`, payload);
const remove = (id: number) => api.delete(`${base}/${id}`);

export default { listAll, listByParlamentar, create, update, remove };
