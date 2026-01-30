import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardTopBar from './DashboardTopBar';

const linkBase =
  'flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500';

const iconBase = 'h-5 w-5 text-gray-500';

const Caret: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    aria-hidden="true"
    className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

const DashboardLayout: React.FC = () => {
  const [gestaoOpen, setGestaoOpen] = useState(true);
  const [usuariosOpen, setUsuariosOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="h-16 px-4 flex items-center border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Aplicação" className="h-7 w-7" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-gray-900">Dashboard</div>
                <div className="text-xs text-gray-500 truncate max-w-[220px]">{user?.email ?? ''}</div>
              </div>
            </div>
          </div>

          <nav className="p-3 flex-1 overflow-y-auto" aria-label="Menu do dashboard">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
                  }
                >
                  <svg className={`${iconBase} ${'group-[.bg-gray-900]:text-white'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-10h8V3h-8v8z" />
                  </svg>
                  <span>Dashboard</span>
                </NavLink>
              </li>

              {/* Gestão (collapsible) */}
              <li>
                <button
                  type="button"
                  onClick={() => setGestaoOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-expanded={gestaoOpen}
                >
                  <span className="flex items-center gap-3">
                    <svg className={iconBase} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M4 4h16v4H4V4zm0 6h10v10H4V10zm12 0h4v10h-4V10z" />
                    </svg>
                    <span>Gestão</span>
                  </span>
                  <Caret open={gestaoOpen} />
                </button>

                {gestaoOpen && (
                  <ul className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1">
                    <li>
                      <NavLink
                        to="/dashboard/emendas"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">E</span>
                        <span>Emendas</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/instituicoes"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">I</span>
                        <span>Instituições</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/parlamentares"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">P</span>
                        <span>Parlamentares</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Usuários (collapsible) */}
              <li>
                <button
                  type="button"
                  onClick={() => setUsuariosOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-expanded={usuariosOpen}
                >
                  <span className="flex items-center gap-3">
                    <svg className={iconBase} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.95 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    <span>Usuários</span>
                  </span>
                  <Caret open={usuariosOpen} />
                </button>

                {usuariosOpen && (
                  <ul className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1">
                    <li>
                      <NavLink
                        to="/dashboard/usuarios"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">U</span>
                        <span>Gerenciar Usuários</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>

          <div className="mt-auto p-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded bg-gray-900 text-white text-sm font-medium hover:bg-black"
            >
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <DashboardTopBar />
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

