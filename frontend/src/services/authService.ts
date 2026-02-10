// src/services/authService.ts
import api from './api';
import type { User as UserType, UserRole, UserStatus } from '../types/user.types';

// Re-export User type for consumers
export type User = {
  id: number;
  username: string;
  email: string;
  name: string;
  role?: UserRole | string;
  status?: UserStatus | string;
  instituicoes?: string[];
};

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export const login = async (credentials: { document: string; password: string }): Promise<LoginResponse> => {
  try {
    // Backend expects { username: document, password }
    // Document can be CPF (11 digits) or CNPJ (14 digits) without formatting
    const payload = { username: credentials.document, password: credentials.password };
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  } catch (err) {
    // Re-throw axios errors so callers can handle them, but provide a clearer message
    console.error('authService.login error:', err);
    throw err;
  }
};

export const logout = async (): Promise<{ success: boolean }> => {
  // You might want to call your backend logout endpoint here
  // await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { success: true };
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  // Handle cases where `user` was stored as the string "undefined" or other invalid JSON
  try {
    const parsed = JSON.parse(userStr);
    if (parsed && typeof parsed === 'object') {
      return parsed as User;
    }
    return null;
  } catch (e) {
    console.warn('authService.getCurrentUser: failed to parse stored user, clearing invalid value', userStr, e);
    // clear the invalid value to avoid repeated errors
    localStorage.removeItem('user');
    return null;
  }
};