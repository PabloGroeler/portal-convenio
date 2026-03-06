import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types/user.types';
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
  const { logout, user, hasPermission, hasAnyPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if user has access to any Gestão items
  const hasGestaoAccess = hasAnyPermission([
    Permission.VIEW_EMENDAS,
    Permission.VIEW_INSTITUTIONS,
    Permission.VIEW_COUNCILORS,
  ]);

  console.log('[DashboardLayout] Gestão access check:', {
    user: user?.email,
    userRole: user?.role,
    hasGestaoAccess,
    checkingPermissions: [
      Permission.VIEW_EMENDAS,
      Permission.VIEW_INSTITUTIONS,
      Permission.VIEW_COUNCILORS
    ]
  });

  // Check if user has access to Usuários section
  const hasUsuariosAccess = hasPermission(Permission.VIEW_USERS);

  // Individual permission checks for menu items
  const canViewEmendas = hasPermission(Permission.VIEW_EMENDAS);
  const canViewInstitutions = hasPermission(Permission.VIEW_INSTITUTIONS);
  const canViewCouncilors = hasPermission(Permission.VIEW_COUNCILORS);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - Fixed Position */}
        <aside className="fixed left-0 top-0 h-screen w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col z-40">
          <div className="h-16 px-4 flex items-center border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="favicon.ico"
                alt="SIGEM"
                className="h-8 w-8 object-contain"
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E";
                }}
              />
              <div className="leading-tight">
                <div className="text-sm font-bold text-gray-900">SIGEM</div>
                <div className="text-xs text-gray-500 truncate max-w-[200px]">Gestão de Emendas Municipais</div>
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
                  <span>Área de Trabalho</span>
                </NavLink>
              </li>

              {/* Workflow — somente ADMIN */}
              {String(user?.role ?? '').toUpperCase() === 'ADMIN' && (
              <li>
                <NavLink
                  to="/dashboard/workflow"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
                  }
                >
                  <svg className={iconBase} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                  </svg>
                  <span>Fluxo de Tramitação</span>
                </NavLink>
              </li>
              )}

              {/* Gestão (collapsible) - Only show if user has access to at least one item */}
              {hasGestaoAccess && (
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
                    {canViewEmendas && (
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
                    )}
                    {canViewInstitutions && (
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
                    )}
                    {canViewCouncilors && (
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
                    )}
                  </ul>
                )}
              </li>
              )}

              {/* Usuários (collapsible) - Only show if user has VIEW_USERS permission */}
              {hasUsuariosAccess && (
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
                    <span>Administrador</span>
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
                        <span>Usuários</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/tipos-documento-config"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">D</span>
                        <span>Tipos de Documentos</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/admin/parlamentar-limites"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">L</span>
                        <span>Limites Parlamentares</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/admin/funcionalidades"
                        className={({ isActive }) =>
                          `${linkBase} ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'}`
                        }
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">F</span>
                        <span>Funcionalidades</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>
              )}
            </ul>
          </nav>

          <div className="mt-auto p-4 border-t border-gray-200 bg-white shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded bg-gray-900 text-white text-sm font-medium hover:bg-black"
            >
              Sair
            </button>
          </div>
        </aside>

        {/* Main content - Add left margin to account for fixed sidebar */}
        <main className="flex-1 min-w-0 ml-72">
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

