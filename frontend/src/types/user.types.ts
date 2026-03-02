// Types for userService - separate file to avoid cache issues

/**
 * User roles matching backend enum UserRole.
 *
 * Roles used in the emenda workflow:
 *   ADMIN     — full access
 *   ORCAMENTO — admissibilidade analysis
 *   SECRETARIA — demand analysis
 *   CONVENIOS  — documental analysis
 *
 * Roles used in the institution/user management:
 *   OPERADOR, GESTOR, ANALISTA, JURIDICO
 */
export enum UserRole {
  ADMIN     = 'ADMIN',
  ORCAMENTO = 'ORCAMENTO',
  SECRETARIA = 'SECRETARIA',
  CONVENIOS  = 'CONVENIOS',
  // --- institution / user management ---
  OPERADOR  = 'OPERADOR',
  GESTOR    = 'GESTOR',
  ANALISTA  = 'ANALISTA',
  JURIDICO  = 'JURIDICO',
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
  APPROVE_ADMISSIBILIDADE = 'APPROVE_ADMISSIBILIDADE',
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
 * Role-based permissions mapping.
 * Emenda workflow roles have precise permissions.
 * Legacy roles (OPERADOR/GESTOR/ANALISTA/JURIDICO) keep minimal permissions
 * so existing institution/user-management pages keep working.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ── Emenda workflow ──────────────────────────────────────────────────────
  [UserRole.ADMIN]: Object.values(Permission),

  [UserRole.ORCAMENTO]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.APPROVE_ADMISSIBILIDADE,
    Permission.VIEW_INSTITUTIONS,
    Permission.VIEW_COUNCILORS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.SECRETARIA]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.VIEW_INSTITUTIONS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.CONVENIOS]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.VIEW_INSTITUTIONS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // ── Institution / user management (legacy) ───────────────────────────────
  [UserRole.OPERADOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_INSTITUTION,
    Permission.MANAGE_INSTITUTION_DOCS,
    Permission.MANAGE_INSTITUTION_DIRIGENTES,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.GESTOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.VIEW_INSTITUTIONS,
    Permission.VIEW_COUNCILORS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.ANALISTA]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.VIEW_INSTITUTIONS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  [UserRole.JURIDICO]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.VIEW_INSTITUTIONS,
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

