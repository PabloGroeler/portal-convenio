import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Painel do Usuário</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informações do Usuário
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nome</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user?.name || 'N/A'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">E-mail</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user?.email || 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Ações</h2>
        <ul className="space-y-2">
          <li>
            <Link
              to="/painel/convenios"
              role="button"
              aria-label="Gerenciar Convênios"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-transform transform hover:-translate-y-0.5"
            >
              {/* Icon: briefcase/document-like */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path d="M6 2a2 2 0 00-2 2v2H3a1 1 0 000 2h14a1 1 0 100-2h-1V4a2 2 0 00-2-2H6z" />
                <path d="M3 10a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" />
              </svg>
              <span>Gerenciar Convênios</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;