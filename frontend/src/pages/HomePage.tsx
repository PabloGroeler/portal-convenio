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
    </div>
  );
};

export default HomePage;