import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import institutionService from '../services/institutionService';
import type { InstitutionDTO } from '../services/institutionService';

const InstitutionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const data = await institutionService.list();
      setInstitutions(data);
    } catch (err) {
      console.error('Error fetching institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instituicao: InstitutionDTO) => {
    // Backend uses institutionId as the entity identifier.
    navigate(`/painel/cadastro-dados-institucionais?id=${encodeURIComponent(instituicao.institutionId)}`);
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (inst.razaoSocial ?? '').toLowerCase().includes(q) ||
      (inst.institutionId ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Instituições</h1>
        <button
          onClick={() => navigate('/painel/cadastro-dados-institucionais')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nova Instituição
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razão social..."
          className="w-full md:w-96 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
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
                  Razão Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstitutions.map((instituicao) => (
                <tr key={instituicao.institutionId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {instituicao.razaoSocial}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(instituicao)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstitutionsPage;

