import api from './api';
import type { User } from './authService';
import type { InstituicaoDetalhada, RegisterPayload, EmendaResumida } from '../types/user.types';

// Re-export types
export type { User, InstituicaoDetalhada, RegisterPayload, EmendaResumida };

export const register = async (payload: any): Promise<User> => {
  const { data } = await api.post('/users/register', payload);
  return data;
};

export const vincularInstituicao = async (instituicaoId: string): Promise<User> => {
  const { data } = await api.post(`/users/vincular-instituicao?instituicaoId=${instituicaoId}`);

  // Atualizar localStorage com novo usuário
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = { ...currentUser, ...data };
  localStorage.setItem('user', JSON.stringify(updatedUser));

  return data;
};

export const desvincularInstituicao = async (instituicaoId: string): Promise<User> => {
  const { data } = await api.delete(`/users/desvincular-instituicao?instituicaoId=${instituicaoId}`);

  // Atualizar localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = { ...currentUser, ...data };
  localStorage.setItem('user', JSON.stringify(updatedUser));

  return data;
};

export const getMinhasInstituicoes = async (): Promise<string[]> => {
  const { data } = await api.get('/users/minhas-instituicoes');
  return data;
};

export const getCurrentUserData = async (): Promise<User> => {
  const { data } = await api.get('/users/me');

  // Atualizar localStorage
  localStorage.setItem('user', JSON.stringify(data));

  return data;
};

export const getMinhasInstituicoesDetalhadas = async (): Promise<InstituicaoDetalhada[]> => {
  const { data } = await api.get('/users/minhas-instituicoes-detalhadas');
  return data;
};

export const getMinhasEmendas = async (): Promise<EmendaResumida[]> => {
  const { data } = await api.get('/users/minhas-emendas');
  return data;
};

