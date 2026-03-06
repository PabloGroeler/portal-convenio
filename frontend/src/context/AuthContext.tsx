// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';
import type { User } from '../services/authService';
import { Permission, ROLE_PERMISSIONS, UserRole } from '../types/user.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (document: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // Seed auth state from storage so refresh keeps the session.
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    // On refresh, restore user from localStorage if present.
    // If a token exists but user is missing, keep isAuthenticated true and let pages load; UI can still work.
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else if (localStorage.getItem('token')) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (document: string, password: string) => {
    try {
      const response = await loginService({ document, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    logoutService();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const getUserPermissions = useCallback((): Permission[] => {
    if (!user || !user.role) {
      console.log('[AuthContext] getUserPermissions: No user or role', { user });
      return [];
    }

    // Handle both enum and string types for role
    const roleString = typeof user.role === 'string' ? user.role : String(user.role);
    const userRole = UserRole[roleString as keyof typeof UserRole];

    if (!userRole) {
      console.error('[AuthContext] getUserPermissions: Invalid role', {
        rawRole: user.role,
        roleString,
        availableRoles: Object.keys(UserRole)
      });
      return [];
    }

    const permissions = ROLE_PERMISSIONS[userRole] || [];
    console.log('[AuthContext] getUserPermissions:', {
      rawRole: user.role,
      roleString,
      userRole,
      permissionsCount: permissions.length,
      permissions: permissions.map(p => p.toString())
    });
    return permissions;
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  }, [getUserPermissions]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!permissions || permissions.length === 0) return true;
    const userPerms = getUserPermissions();
    const hasAny = permissions.some(p => userPerms.includes(p));
    console.log('[AuthContext] hasAnyPermission:', {
      checking: permissions.map(p => p.toString()),
      userHas: userPerms.map(p => p.toString()),
      result: hasAny
    });
    return hasAny;
  }, [getUserPermissions]);

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user || !user.role) return false;
    return String(user.role).toUpperCase() === String(role).toUpperCase();
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    if (!user || !user.role) return false;
    return user.role === UserRole.ADMIN;
  }, [user]);

  const contextValue = {
    isAuthenticated,
    user,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAdmin,
  };


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};