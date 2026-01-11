import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getLatestNews } from '../services/newsService';

const HomePage = () => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['latestNews'],
    queryFn: getLatestNews,
  });

  return (
    <div className="space-y-8">
      <section className="bg-blue-50 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Bem-vindo ao Portal do Governo de Mato Grosso
        </h1>
        <p className="text-center text-lg text-gray-700">
          Acesse serviços, informações e notícias do governo do estado.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Últimas Notícias</h2>
          <Link
            to="/news"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver todas as notícias →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600">Erro ao carregar as notícias.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news?.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <Link
                      to={`/news/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ler mais
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