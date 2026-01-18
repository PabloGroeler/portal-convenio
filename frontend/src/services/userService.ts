import api from './api';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post('/users/register', payload);
  return data;
};

export default { register };

