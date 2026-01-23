import React, { useEffect, useState } from 'react';
import councilorService from '../services/councilorService';
import type { CouncilorDTO } from '../services/councilorService';

const CouncilorsPage: React.FC = () => {
  const [councilors, setCouncilors] = useState<CouncilorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CouncilorDTO>>({
    councilorId: '',
    fullName: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCouncilors();
  }, []);

  const fetchCouncilors = async () => {
    try {
      const data = await councilorService.list();
      setCouncilors(data);
    } catch (err) {
      console.error('Error fetching councilors:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      councilorId: '',
      fullName: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (councilor: CouncilorDTO) => {
    setEditingId(councilor.id || null);
    setFormData({
      councilorId: councilor.councilorId,
      fullName: councilor.fullName,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await councilorService.update(editingId, formData);
      } else {
        await councilorService.create(formData);
      }
      setShowModal(false);
      fetchCouncilors();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar vereador');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este vereador?')) {
      try {
        await councilorService.delete(id);
        fetchCouncilors();
      } catch (err) {
        alert('Erro ao excluir vereador');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vereadores</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Novo Vereador
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {councilors.map((councilor) => (
                <tr key={councilor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {councilor.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(councilor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(councilor.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Editar Vereador' : 'Novo Vereador'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Vereador *
                </label>
                <input
                  type="text"
                  required
                  value={formData.councilorId}
                  onChange={(e) => setFormData({ ...formData, councilorId: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: VER001"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome completo do vereador"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partido Político
                </label>
                <input
                  type="text"
                  value={formData.politicalParty}
                  onChange={(e) => setFormData({ ...formData, politicalParty: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: PT, PSDB, MDB, etc."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouncilorsPage;

