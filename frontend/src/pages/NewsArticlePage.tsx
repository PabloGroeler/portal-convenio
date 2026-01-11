import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNewsById } from '../services/newsService';

const NewsArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: () => getNewsById(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Erro ao carregar a notícia.</div>;
  }

  if (!article) {
    return <div>Notícia não encontrada.</div>;
  }

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        <p className="text-gray-500">
          Publicado em {new Date(article.createdAt).toLocaleDateString('pt-BR')}
        </p>
      </header>
      <div className="prose max-w-none">
        <p>{article.content}</p>
      </div>
    </article>
  );
};

export default NewsArticlePage;