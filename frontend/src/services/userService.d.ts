// Type declarations for userService
import { User, InstituicaoDetalhada } from './userService';

declare module './userService' {
  export interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    instituicoes?: string[];
  }

  export interface InstituicaoDetalhada {
    id: string;
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    emailInstitucional: string;
    telefone: string;
    cidade: string;
    uf: string;
    dataVinculo: string;
    ativo: boolean;
  }

  export function register(payload: any): Promise<User>;
  export function vincularInstituicao(instituicaoId: string): Promise<User>;
  export function desvincularInstituicao(instituicaoId: string): Promise<User>;
  export function getMinhasInstituicoes(): Promise<string[]>;
  export function getCurrentUserData(): Promise<User>;
  export function getMinhasInstituicoesDetalhadas(): Promise<InstituicaoDetalhada[]>;
}

