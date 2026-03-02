import api from './api';

export type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'PENDENTE';
export type UserRole = 'ADMIN' | 'OPERADOR' | 'GESTOR' | 'JURIDICO' | 'ANALISTA' | 'ORCAMENTO' | 'SECRETARIA' | 'CONVENIOS';

export interface UserAdminDTO {
  id: number;
  nomeCompleto: string;
  documento?: string | null;
  email: string;
  telefone?: string | null;
  cargoFuncao?: string | null;
  secretaria?: string | null;
  status: UserStatus;
  role: UserRole;
  createTime?: string;
  updateTime?: string;
}

export interface UserAdminCreateRequest {
  nomeCompleto: string;
  documento?: string;
  email: string;
  telefone?: string;
  cargoFuncao?: string;
  secretaria?: string;
  status?: UserStatus;
  role?: UserRole;
  password: string;
}

export interface UserAdminUpdateRequest {
  nomeCompleto?: string;
  documento?: string;
  email?: string;
  telefone?: string;
  cargoFuncao?: string;
  secretaria?: string;
  status?: UserStatus;
  role?: UserRole;
  password?: string;
}

const userAdminService = {
  list: async (): Promise<UserAdminDTO[]> => {
    const { data } = await api.get<UserAdminDTO[]>('/admin/users');
    return data;
  },

  get: async (id: number): Promise<UserAdminDTO> => {
    const { data } = await api.get<UserAdminDTO>(`/admin/users/${id}`);
    return data;
  },

  create: async (payload: UserAdminCreateRequest): Promise<UserAdminDTO> => {
    const { data } = await api.post<UserAdminDTO>('/admin/users', payload);
    return data;
  },

  update: async (id: number, payload: UserAdminUpdateRequest): Promise<UserAdminDTO> => {
    const { data } = await api.put<UserAdminDTO>(`/admin/users/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

export default userAdminService;
