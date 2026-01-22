import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import emendaService from '../services/emendaService';

const HomePage = () => {
  const { data: emendas, isLoading, error } = useQuery({
    queryKey: ['latestEmendas'],
    queryFn: async () => {
      const all = await emendaService.list();
      // Return only the latest 6 emendas (2 rows of 3)
      return all.slice(0, 6);
    },
  });

  return (
    <div className="space-y-8">
      <section className="bg-blue-50 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Bem-vindo ao Portal de Convênios
        </h1>
        <p className="text-center text-lg text-gray-700">
          Acesse e gerencie emendas parlamentares e convênios.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Últimas Emendas</h2>
          <Link
            to="/painel/emendas"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver todas as emendas →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600">Erro ao carregar as emendas.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emendas?.map((emenda) => (
              <div
                key={emenda.id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">
                      {emenda.officialCode || `Emenda #${emenda.id?.substring(0, 8)}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (emenda.status === 'Aprovada' || emenda.status === 'APROVADA' || emenda.status === 'APROVADO' || emenda.status === 'Aprovado' || emenda.status === 'Aprovada pelo Gestor') ? 'bg-emerald-100 text-emerald-800' :
                      (emenda.status === 'Rejeitada' || emenda.status === 'REJEITADA' || emenda.status === 'REJEITADO' || emenda.status === 'Rejeitado') ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {emenda.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Valor: {emenda.value ? `R$ ${emenda.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                  </p>
                  {emenda.classification && (
                    <p className="text-gray-600 text-sm mb-3">
                      Classificação: {emenda.classification}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      {emenda.date ? new Date(emenda.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </span>
                    <Link
                      to={`/painel/emendas`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;