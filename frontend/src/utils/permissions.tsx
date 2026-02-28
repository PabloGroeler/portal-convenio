// src/utils/permissions.tsx
import React, { ReactNode } from 'react';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../types/user.types';

/**
 * Helper to check if a role has specific permission
 */
export const roleHasPermission = (role: UserRole | undefined, permission: Permission): boolean => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Helper to check if a role has any of the specified permissions
 */
export const roleHasAnyPermission = (role: UserRole | undefined, permissions: Permission[]): boolean => {
  if (!role) return false;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(p => rolePermissions.includes(p));
};

/**
 * Helper to check if a role has all of the specified permissions
 */
export const roleHasAllPermissions = (role: UserRole | undefined, permissions: Permission[]): boolean => {
  if (!role) return false;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.every(p => rolePermissions.includes(p));
};

/**
 * Helper to get all permissions for a role
 */
export const getRolePermissions = (role: UserRole | undefined): Permission[] => {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role is admin
 */
export const isAdminRole = (role: UserRole | undefined): boolean => {
  return role === UserRole.ADMIN;
};

/**
 * Props for PermissionGate component
 */
interface PermissionGateProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
  userRole?: UserRole;
}

/**
 * Component wrapper that shows/hides content based on permissions
 *
 * This is a standalone version that requires passing userRole as prop.
 * For automatic user role detection, use the PermissionGate from components folder.
 *
 * Usage:
 *
 * const { user } = useAuth();
 *
 * <PermissionGate
 *   permissions={[Permission.CREATE_EMENDA]}
 *   userRole={user?.role}
 * >
 *   <button>Create</button>
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  userRole,
}) => {
  // Check role-based access
  if (roles.length > 0) {
    if (!roles.includes(userRole as UserRole)) {
      return <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permissions.length > 0 && userRole) {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAccess = requireAll
      ? permissions.every(p => rolePermissions.includes(p))
      : permissions.some(p => rolePermissions.includes(p));

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * Get a user-friendly role label
 */
export const getRoleLabel = (role: UserRole | undefined): string => {
  if (!role) return 'Sem perfil';

  const labels: Record<UserRole, string> = {
    // Emenda workflow
    [UserRole.ADMIN]:      'Administrador',
    [UserRole.ORCAMENTO]:  'Orçamento',
    [UserRole.SECRETARIA]: 'Secretaria',
    [UserRole.CONVENIOS]:  'Convênios',
    // Institution / user management
    [UserRole.OPERADOR]:   'Operador',
    [UserRole.GESTOR]:     'Gestor',
    [UserRole.ANALISTA]:   'Analista',
    [UserRole.JURIDICO]:   'Jurídico',
  };

  return labels[role] || role;
};

/**
 * Get permission label
 */
export const getPermissionLabel = (permission: Permission): string => {
  const labels: Partial<Record<Permission, string>> = {
    [Permission.VIEW_DASHBOARD]: 'Ver Dashboard',
    [Permission.VIEW_EMENDAS]: 'Ver Emendas',
    [Permission.CREATE_EMENDA]: 'Criar Emenda',
    [Permission.EDIT_EMENDA]: 'Editar Emenda',
    [Permission.DELETE_EMENDA]: 'Excluir Emenda',
    [Permission.APPROVE_EMENDA]: 'Aprovar Emenda',
    [Permission.REJECT_EMENDA]: 'Reprovar Emenda',
    [Permission.RETURN_EMENDA]: 'Devolver Emenda',
    [Permission.VIEW_INSTITUTIONS]: 'Ver Instituições',
    [Permission.CREATE_INSTITUTION]: 'Criar Instituição',
    [Permission.EDIT_INSTITUTION]: 'Editar Instituição',
    [Permission.DELETE_INSTITUTION]: 'Excluir Instituição',
    [Permission.VIEW_COUNCILORS]: 'Ver Parlamentares',
    [Permission.CREATE_COUNCILOR]: 'Criar Parlamentar',
    [Permission.EDIT_COUNCILOR]: 'Editar Parlamentar',
    [Permission.DELETE_COUNCILOR]: 'Excluir Parlamentar',
    [Permission.VIEW_USERS]: 'Ver Usuários',
    [Permission.CREATE_USER]: 'Criar Usuário',
    [Permission.EDIT_USER]: 'Editar Usuário',
    [Permission.DELETE_USER]: 'Excluir Usuário',
    [Permission.APPROVE_USER]: 'Aprovar Usuário',
    [Permission.VIEW_REPORTS]: 'Ver Relatórios',
    [Permission.EXPORT_DATA]: 'Exportar Dados',
    [Permission.MANAGE_SYSTEM]: 'Gerenciar Sistema',
    [Permission.VIEW_PROFILE]: 'Ver Perfil',
    [Permission.EDIT_PROFILE]: 'Editar Perfil',
  };

  return labels[permission] || permission;
};
