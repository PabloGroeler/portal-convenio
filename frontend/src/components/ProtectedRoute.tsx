// Protected route wrapper with permission-based access control
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Permission, ROUTE_PERMISSIONS } from '../types/user.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermissions, requiredRoles }) => {
  const { isAuthenticated, hasAnyPermission, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-based guard
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = String(user?.role ?? '').toUpperCase();
    if (!requiredRoles.map(r => r.toUpperCase()).includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check route-based permissions if defined
  const routePermissions = ROUTE_PERMISSIONS[location.pathname] || requiredPermissions;

  if (routePermissions && routePermissions.length > 0 && hasAnyPermission) {
    if (!hasAnyPermission(routePermissions)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
            <div className="text-red-500 text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

