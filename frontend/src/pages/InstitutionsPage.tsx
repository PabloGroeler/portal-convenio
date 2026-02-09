import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import institutionService from '../services/institutionService';
import type { InstitutionDTO } from '../services/institutionService';
import { StatusOSC } from '../types/statusOSC.types';
import { StatusOSCBadge } from '../components/StatusOSCComponents';

const InstitutionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusOSC | 'TODOS'>('TODOS');

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

  const handleEdit = (institution: InstitutionDTO) => {
    // Backend uses institutionId as the entity identifier.
    navigate(`/dashboard/cadastro-dados-institucionais?id=${encodeURIComponent(institution.institutionId)}`);
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      (inst.razaoSocial ?? '').toLowerCase().includes(q) ||
      (inst.institutionId ?? '').toLowerCase().includes(q) ||
      (inst.cnpj ?? '').includes(q);

    const matchesStatus = statusFilter === 'TODOS' ||
      (inst.statusOSC || StatusOSC.EM_CADASTRO) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Instituições</h1>
        <button
          onClick={() => navigate('/dashboard/cadastro-dados-institucionais')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nova Instituição
        </button>
      </div>

      <div className="mb-4 flex gap-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razão social, CNPJ..."
          className="flex-1 min-w-[250px] px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusOSC | 'TODOS')}
          className="px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="TODOS">Todos os Status</option>
          <option value={StatusOSC.EM_CADASTRO}>Em Cadastro</option>
          <option value={StatusOSC.DOCUMENTOS_INCOMPLETOS}>Documentos Incompletos</option>
          <option value={StatusOSC.EM_ANALISE}>Em Análise</option>
          <option value={StatusOSC.APROVADO}>Aprovado</option>
          <option value={StatusOSC.REPROVADO}>Reprovado</option>
          <option value={StatusOSC.SUSPENSA}>Suspensa</option>
          <option value={StatusOSC.INATIVA}>Inativa</option>
        </select>
      </div>

      {/* Estatísticas rápidas */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="bg-white border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter('TODOS')}>
          <div className="text-2xl font-bold text-gray-900">{institutions.length}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-gray-50 border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(StatusOSC.EM_CADASTRO)}>
          <div className="text-2xl font-bold text-gray-700">
            {institutions.filter(i => (i.statusOSC || StatusOSC.EM_CADASTRO) === StatusOSC.EM_CADASTRO).length}
          </div>
          <div className="text-xs text-gray-600">Em Cadastro</div>
        </div>
        <div className="bg-yellow-50 border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(StatusOSC.DOCUMENTOS_INCOMPLETOS)}>
          <div className="text-2xl font-bold text-yellow-700">
            {institutions.filter(i => i.statusOSC === StatusOSC.DOCUMENTOS_INCOMPLETOS).length}
          </div>
          <div className="text-xs text-gray-600">Doc. Incompletos</div>
        </div>
        <div className="bg-blue-50 border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(StatusOSC.EM_ANALISE)}>
          <div className="text-2xl font-bold text-blue-700">
            {institutions.filter(i => i.statusOSC === StatusOSC.EM_ANALISE).length}
          </div>
          <div className="text-xs text-gray-600">Em Análise</div>
        </div>
        <div className="bg-green-50 border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(StatusOSC.APROVADO)}>
          <div className="text-2xl font-bold text-green-700">
            {institutions.filter(i => i.statusOSC === StatusOSC.APROVADO).length}
          </div>
          <div className="text-xs text-gray-600">Aprovadas</div>
        </div>
        <div className="bg-red-50 border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(StatusOSC.REPROVADO)}>
          <div className="text-2xl font-bold text-red-700">
            {institutions.filter(i => i.statusOSC === StatusOSC.REPROVADO).length}
          </div>
          <div className="text-xs text-gray-600">Reprovadas</div>
        </div>
        <div className="bg-orange-50 border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(StatusOSC.SUSPENSA)}>
          <div className="text-2xl font-bold text-orange-700">
            {institutions.filter(i => i.statusOSC === StatusOSC.SUSPENSA).length}
          </div>
          <div className="text-xs text-gray-600">Suspensas</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">
                  Razão Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstitutions.map((institution) => (
                <tr key={institution.institutionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 w-[45%]">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {institution.razaoSocial}
                      </div>
                      {institution.nomeFantasia && (
                        <div className="text-xs text-gray-500 break-words">
                          {institution.nomeFantasia}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 w-[22%]">
                    <div className="break-all">
                      {institution.cnpj ?
                        institution.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
                        : '-'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 w-[18%]">
                    <StatusOSCBadge
                      status={institution.statusOSC || StatusOSC.EM_CADASTRO}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium w-[15%]">
                    <button
                      onClick={() => handleEdit(institution)}
                      className="text-blue-600 hover:text-blue-900 whitespace-nowrap"
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

