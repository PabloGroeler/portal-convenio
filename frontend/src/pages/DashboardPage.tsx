import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>
            <p><strong>Nome:</strong> {user?.name || 'N/A'}</p>
            <p><strong>E-mail:</strong> {user?.email || 'N/A'}</p>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Ações Administrativas</h2>
            <div className="space-y-3">
              <Link
                to="/painel/convenios"
                className="block w-full text-left px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-lg shadow"
              >
                Gerenciar Convênios
              </Link>

              <Link
                to="/painel/news"
                className="block w-full text-left px-4 py-3 border rounded-lg"
              >
                Gerenciar Notícias
              </Link>

              <Link
                to="/painel/users"
                className="block w-full text-left px-4 py-3 border rounded-lg"
              >
                Gerenciar Usuários
              </Link>
            </div>
          </div>
        </div>

        <aside className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Atalhos Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/painel/convenios" className="text-blue-600 underline">Convênios</Link>
              </li>
              <li>
                <Link to="/painel/news" className="text-blue-600 underline">Notícias</Link>
              </li>
              <li>
                <Link to="/painel/users" className="text-blue-600 underline">Usuários</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;