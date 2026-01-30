import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardTopBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              aria-label="Início"
              className="inline-flex items-center justify-center h-12 w-12 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ring-offset-background"
              to="/dashboard"
            >
              <img
                alt="Sistema de Emendas"
                className="h-6 w-6 sm:h-7 sm:w-7"
                loading="lazy"
                src="/favicon.ico"
              />
            </Link>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Sistema de Emendas</h1>
            </div>
          </div>

          <nav aria-label="Navegação principal" className="flex items-center space-x-2 sm:space-x-4">
            <a
              href="/"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 px-4 py-3 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ring-offset-background inline-flex items-center"
            >
              Sair
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;

