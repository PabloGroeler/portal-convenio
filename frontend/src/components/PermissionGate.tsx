// src/components/PermissionGate.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission, UserRole } from '../types/user.types';

interface PermissionGateProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean; // If true, requires ALL permissions. If false (default), requires ANY
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions or roles
 *
 * Usage Examples:
 *
 * 1. Single permission check:
 * <PermissionGate permissions={[Permission.CREATE_EMENDA]}>
 *   <button>Create Emenda</button>
 * </PermissionGate>
 *
 * 2. Multiple permissions (requires ANY):
 * <PermissionGate permissions={[Permission.EDIT_EMENDA, Permission.DELETE_EMENDA]}>
 *   <div>Management Panel</div>
 * </PermissionGate>
 *
 * 3. Multiple permissions (requires ALL):
 * <PermissionGate
 *   permissions={[Permission.VIEW_EMENDAS, Permission.APPROVE_EMENDA]}
 *   requireAll={true}
 * >
 *   <button>Approve</button>
 * </PermissionGate>
 *
 * 4. Role-based check:
 * <PermissionGate roles={[UserRole.ADMIN, UserRole.ANALISTA]}>
 *   <AdminPanel />
 * </PermissionGate>
 *
 * 5. With fallback content:
 * <PermissionGate
 *   permissions={[Permission.EDIT_EMENDA]}
 *   fallback={<p>You don't have permission to edit</p>}
 * >
 *   <EditForm />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasAnyPermission, hasRole, user } = useAuth();

  // Check role-based access first
  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permissions.length > 0) {
    if (requireAll) {
      // User must have ALL permissions
      const userPermissions = user?.role
        ? require('../types/user.types').ROLE_PERMISSIONS[user.role] || []
        : [];

      const hasAllRequired = permissions.every(p => userPermissions.includes(p));

      if (!hasAllRequired) {
        return <>{fallback}</>;
      }
    } else {
      // User must have ANY permission (default behavior)
      if (!hasAnyPermission(permissions)) {
        return <>{fallback}</>;
      }
    }
  }

  return <>{children}</>;
};

export default PermissionGate;
