import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Painel</h1>
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-800 rounded shadow hover:bg-gray-100"
          >
            Voltar para Home
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Emendas entry point */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Acesso rápido</h2>
            <p className="text-gray-600 mb-4">
              Use o painel para acessar e gerenciar as emendas.
            </p>

            <Link
              to="/painel/emendas"
              className="inline-flex items-center justify-center w-full px-5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-base font-semibold shadow"
            >
              Acessar Emendas
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Cadastros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link
                to="/painel/institutions"
                className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-center font-medium"
              >
                Instituições
              </Link>
              <Link
                to="/painel/councilors"
                className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-center font-medium"
              >
                Vereadores
              </Link>
              <Link
                to="/painel/convenios"
                className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-center font-medium"
              >
                Convênios
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar: user info */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Usuário</h2>
            <p className="text-sm text-gray-700"><strong>Nome:</strong> {user?.name || 'N/A'}</p>
            <p className="text-sm text-gray-700"><strong>E-mail:</strong> {user?.email || 'N/A'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;