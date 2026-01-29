import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import secretariaMunicipalService, { type SecretariaMunicipalDTO } from '../services/secretariaMunicipalService';

const SecretariasMunicipaisPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SecretariaMunicipalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await secretariaMunicipalService.list();
      setItems(data);
    } catch (e) {
      console.error('Error fetching secretarias:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((s) => (showInactive ? true : s.ativo))
      .filter((s) => {
        if (!q) return true;
        return (
          (s.nome ?? '').toLowerCase().includes(q) ||
          (s.sigla ?? '').toLowerCase().includes(q) ||
          (s.email ?? '').toLowerCase().includes(q)
        );
      });
  }, [items, search, showInactive]);

  const handleToggleAtivo = async (s: SecretariaMunicipalDTO) => {
    try {
      const updated = await secretariaMunicipalService.setAtivo(s.secretariaId, !s.ativo);
      setItems((prev) => prev.map((p) => (p.secretariaId === s.secretariaId ? updated : p)));
    } catch (e) {
      console.error('Error toggling ativo:', e);
      alert('Erro ao alterar status.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Secretarias Municipais</h1>
        <button
          onClick={() => navigate('/painel/secretarias-municipais/novo')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nova Secretaria
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, sigla ou e-mail..."
          className="w-full md:w-96 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Mostrar inativas
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((s) => (
                <tr key={s.secretariaId} className={!s.ativo ? 'opacity-70' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.sigla || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.email || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={s.ativo ? 'text-emerald-700' : 'text-gray-500'}>
                      {s.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/painel/secretarias-municipais/editar?id=${encodeURIComponent(s.secretariaId)}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleAtivo(s)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      {s.ativo ? 'Inativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>
                    Nenhuma secretaria encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SecretariasMunicipaisPage;

