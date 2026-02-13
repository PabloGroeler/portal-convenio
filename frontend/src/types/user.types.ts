// Types for userService - separate file to avoid cache issues

/**
 * User roles matching backend enum UserRole
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERADOR = 'OPERADOR',
  GESTOR = 'GESTOR',
  ANALISTA = 'ANALISTA',
  JURIDICO = 'JURIDICO'
}

/**
 * User status matching backend enum UserStatus
 */
export enum UserStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  BLOQUEADO = 'BLOQUEADO',
  PENDENTE = 'PENDENTE'
}

/**
 * User entity with role-based access control fields
 */
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role?: UserRole;
  status?: UserStatus;
  instituicoes?: string[];
}

// Explicit export to ensure module recognition
export type { User as UserType };

/**
 * Permissions/actions available in the system
 */
export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',

  // Emendas
  VIEW_EMENDAS = 'VIEW_EMENDAS',
  CREATE_EMENDA = 'CREATE_EMENDA',
  EDIT_EMENDA = 'EDIT_EMENDA',
  DELETE_EMENDA = 'DELETE_EMENDA',
  APPROVE_EMENDA = 'APPROVE_EMENDA',
  REJECT_EMENDA = 'REJECT_EMENDA',
  RETURN_EMENDA = 'RETURN_EMENDA',
  SYNC_EXTERNAL_EMENDAS = 'SYNC_EXTERNAL_EMENDAS',

  // Instituições
  VIEW_INSTITUTIONS = 'VIEW_INSTITUTIONS',
  CREATE_INSTITUTION = 'CREATE_INSTITUTION',
  EDIT_INSTITUTION = 'EDIT_INSTITUTION',
  DELETE_INSTITUTION = 'DELETE_INSTITUTION',
  MANAGE_INSTITUTION_DOCS = 'MANAGE_INSTITUTION_DOCS',
  MANAGE_INSTITUTION_DIRIGENTES = 'MANAGE_INSTITUTION_DIRIGENTES',
  APPROVE_INSTITUTION = 'APPROVE_INSTITUTION',

  // Parlamentares
  VIEW_COUNCILORS = 'VIEW_COUNCILORS',
  CREATE_COUNCILOR = 'CREATE_COUNCILOR',
  EDIT_COUNCILOR = 'EDIT_COUNCILOR',
  DELETE_COUNCILOR = 'DELETE_COUNCILOR',

  // Users
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USER = 'CREATE_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',
  APPROVE_USER = 'APPROVE_USER',

  // Reports
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',

  // System
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',

  // Profile
  VIEW_PROFILE = 'VIEW_PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
}

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions

  [UserRole.OPERADOR]: [
    Permission.VIEW_DASHBOARD,
    // Can manage their own institution data directly
    Permission.EDIT_INSTITUTION,
    Permission.MANAGE_INSTITUTION_DOCS,
    Permission.MANAGE_INSTITUTION_DIRIGENTES,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.GESTOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.CREATE_EMENDA,
    Permission.EDIT_EMENDA,
    Permission.APPROVE_EMENDA,
    Permission.REJECT_EMENDA,
    Permission.RETURN_EMENDA,
    Permission.VIEW_INSTITUTIONS,
    Permission.CREATE_INSTITUTION,
    Permission.EDIT_INSTITUTION,
    Permission.MANAGE_INSTITUTION_DOCS,
    Permission.MANAGE_INSTITUTION_DIRIGENTES,
    Permission.APPROVE_INSTITUTION,
    Permission.VIEW_COUNCILORS,
    Permission.CREATE_COUNCILOR,
    Permission.EDIT_COUNCILOR,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.ANALISTA]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.APPROVE_EMENDA,
    Permission.REJECT_EMENDA,
    Permission.RETURN_EMENDA,
    Permission.VIEW_INSTITUTIONS,
    Permission.APPROVE_INSTITUTION,
    Permission.VIEW_COUNCILORS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.JURIDICO]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.APPROVE_EMENDA,
    Permission.REJECT_EMENDA,
    Permission.RETURN_EMENDA,
    Permission.VIEW_INSTITUTIONS,
    Permission.APPROVE_INSTITUTION,
    Permission.MANAGE_INSTITUTION_DOCS,
    Permission.VIEW_COUNCILORS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],
};

/**
 * Route paths and their required permissions
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard': [Permission.VIEW_DASHBOARD],
  '/dashboard/emendas': [Permission.VIEW_EMENDAS],
  '/dashboard/instituicoes': [Permission.VIEW_INSTITUTIONS],
  '/dashboard/cadastro-dados-institucionais': [Permission.EDIT_INSTITUTION], // Changed from VIEW_INSTITUTIONS
  '/dashboard/cadastro-dirigente': [Permission.MANAGE_INSTITUTION_DIRIGENTES],
  '/dashboard/diretoria': [Permission.MANAGE_INSTITUTION_DIRIGENTES],
  '/dashboard/parlamentares': [Permission.VIEW_COUNCILORS],
  '/dashboard/usuarios': [Permission.VIEW_USERS],
  '/dashboard/profile': [Permission.VIEW_PROFILE],
  '/emendas': [Permission.VIEW_EMENDAS],
  '/painel/emendas': [Permission.VIEW_EMENDAS],
};


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

export interface EmendaResumida {
  id: string;
  codigoOficial: string;
  valor: number;
  descricao: string;
  status: string;
  instituicaoNome: string;
  parlamentarNome: string;
  dataCriacao: string;
  categoria: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

