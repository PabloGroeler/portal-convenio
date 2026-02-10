// src/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission, ROLE_PERMISSIONS, UserRole } from '../types/user.types';

/**
 * Hook to check if user has specific permission(s)
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const userPermissions = useMemo(() => {
    if (!user || !user.role) return [];
    return ROLE_PERMISSIONS[user.role as UserRole] || [];
  }, [user]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => userPermissions.includes(p));
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => userPermissions.includes(p));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has ANY of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => user?.role === role);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN;
  };

  return {
    userPermissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    userRole: user?.role,
  };
};
