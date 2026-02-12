import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TipoDocumentoConfig {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  descricao?: string;
  ativo: boolean;
  obrigatorio: boolean;
  numeroDocumentoObrigatorio: boolean;
  dataEmissaoObrigatoria: boolean;
  dataValidadeObrigatoria: boolean;
  ordem: number;
  formatosAceitos?: string;
  tamanhoMaximoMb?: number;
}

const TiposDocumentoConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<TipoDocumentoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TipoDocumentoConfig | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string>('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tipos-documento-config');
      console.log('[fetchConfigs] Loaded configs:', response.data.length, 'items');
      console.log('[fetchConfigs] Sample config:', response.data[0]);

      // Log each config's dataValidadeObrigatoria value
      response.data.forEach((c: TipoDocumentoConfig) => {
        console.log(`[fetchConfigs] ${c.codigo} (${c.nome}): dataValidadeObrigatoria=${c.dataValidadeObrigatoria}`);
      });

      setConfigs(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      alert('Erro ao carregar configurações de documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: TipoDocumentoConfig) => {
    console.log('[handleEdit] Editing config:', config.id, config.nome);
    setEditingId(config.id);
    // Create a deep copy to ensure no reference issues
    setEditForm({
      id: config.id,
      codigo: config.codigo,
      nome: config.nome,
      categoria: config.categoria,
      descricao: config.descricao,
      ativo: config.ativo,
      obrigatorio: config.obrigatorio !== undefined ? config.obrigatorio : true,
      numeroDocumentoObrigatorio: config.numeroDocumentoObrigatorio,
      dataEmissaoObrigatoria: config.dataEmissaoObrigatoria,
      dataValidadeObrigatoria: config.dataValidadeObrigatoria,
      ordem: config.ordem,
      formatosAceitos: config.formatosAceitos ?? '.pdf,.jpg,.jpeg,.png',
      tamanhoMaximoMb: config.tamanhoMaximoMb ?? 5
    });
  };

  const handleCancelEdit = () => {
    console.log('[handleCancelEdit] Canceling edit');
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editForm) return;

    console.log('[handleSave] Saving config:', editForm.codigo, editForm);

    try {
      await axios.put(`/api/tipos-documento-config/${editForm.codigo}`, editForm);
      alert('Configuração atualizada com sucesso!');
      setEditingId(null);
      setEditForm(null);
      // Reload to get fresh data from backend
      await fetchConfigs();
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      alert(error.response?.data?.error || 'Erro ao atualizar configuração');
    }
  };

  const handleCheckboxChange = (field: keyof TipoDocumentoConfig) => {
    if (!editForm) {
      console.error('[handleCheckboxChange] No editForm available!');
      return;
    }

    const newValue = !editForm[field];
    console.log(`[handleCheckboxChange] Toggling ${field} for ${editForm.codigo} (${editForm.nome}): ${editForm[field]} -> ${newValue}`);

    setEditForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: newValue
      };
    });
  };

  const categorias = Array.from(new Set(configs.map(c => c.categoria)));
  const filteredConfigs = filterCategoria
    ? configs.filter(c => c.categoria === filterCategoria)
    : configs;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuração de Tipos de Documentos
        </h1>
        <p className="text-gray-600">
          Gerencie os requisitos de campos obrigatórios para cada tipo de documento
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Categoria
        </label>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="w-full md:w-64 border rounded px-3 py-2"
        >
          <option value="">Todas as Categorias</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome do Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Doc. Obrigatório
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Emissão Obrigatória
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Validade Obrigatória
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConfigs.map((config) => (
                <tr
                  key={config.id || config.codigo}
                  className={`hover:bg-gray-50 ${editingId === config.id ? 'bg-blue-50 border-2 border-blue-300' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {config.nome}
                        {editingId === config.id && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                            EDITANDO
                          </span>
                        )}
                      </div>
                      {config.descricao && (
                        <div className="text-xs text-gray-500">
                          {config.descricao}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {config.id} | Código: {config.codigo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {config.categoria}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === config.id ? (
                      <input
                        type="checkbox"
                        checked={editForm?.numeroDocumentoObrigatorio || false}
                        onChange={() => handleCheckboxChange('numeroDocumentoObrigatorio')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        config.numeroDocumentoObrigatorio
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.numeroDocumentoObrigatorio ? 'Sim' : 'Não'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === config.id ? (
                      <input
                        type="checkbox"
                        checked={editForm?.dataEmissaoObrigatoria || false}
                        onChange={() => handleCheckboxChange('dataEmissaoObrigatoria')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        config.dataEmissaoObrigatoria
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.dataEmissaoObrigatoria ? 'Sim' : 'Não'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === config.id ? (
                      <input
                        type="checkbox"
                        checked={editForm?.dataValidadeObrigatoria || false}
                        onChange={() => handleCheckboxChange('dataValidadeObrigatoria')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        config.dataValidadeObrigatoria
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.dataValidadeObrigatoria ? 'Sim' : 'Não'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      config.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {config.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium">
                    {editingId === config.id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredConfigs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma configuração encontrada</p>
        </div>
      )}
    </div>
  );
};

export default TiposDocumentoConfigPage;
