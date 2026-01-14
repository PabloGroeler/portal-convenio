// src/services/authService.ts
import api from './api';

export interface User {
  id: number;
  email: string;
  name: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  try {
    // Backend expects { username, password }
    const payload = { username: credentials.email, password: credentials.password };
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
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};