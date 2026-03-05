import api from './api';

const base = '/admin/funcionalidades';

const listAll = () => api.get(base);
const create = (payload: any) => api.post(base, payload);
const update = (id: number, payload: any) => api.put(`${base}/${id}`, payload);
const remove = (id: number) => api.delete(`${base}/${id}`);

export default { listAll, create, update, remove };
