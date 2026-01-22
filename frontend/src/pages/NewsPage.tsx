import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getLatestNews } from '../services/newsService';

const NewsPage = () => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: getLatestNews,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notícias</h1>
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
                    {new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
    </div>
  );
};

export default NewsPage;