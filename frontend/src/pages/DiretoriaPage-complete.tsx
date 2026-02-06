import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import dirigenteService from '../services/dirigenteService';
import type { Dirigente } from '../types/dirigente.types';
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  CARGO_OPTIONS,
  UF_OPTIONS
} from '../types/dirigente.types';

const DiretoriaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const instituicaoId = searchParams.get('instituicaoId');

  const [dirigentes, setDirigentes] = useState<Dirigente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInativarModal, setShowInativarModal] = useState(false);
  const [editingDirigente, setEditingDirigente] = useState<Dirigente | null>(null);
  const [inativandoDirigente, setInativandoDirigente] = useState<Dirigente | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [apenasAtivos, setApenasAtivos] = useState(false);

  const [formData, setFormData] = useState<Dirigente>({
    instituicaoId: instituicaoId || '',
    nomeCompleto: '',
    cpf: '',
    rg: '',
    orgaoExpedidor: '',
    ufOrgaoExpedidor: '',
    dataExpedicao: '',
    dataNascimento: '',
    sexo: '',
    nacionalidade: 'Brasileira',
    estadoCivil: '',
    cargo: '',
    dataInicioCargo: '',
    statusCargo: 'Ativo',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const [inativarData, setInativarData] = useState({
    dataTermino: '',
    motivo: ''
  });

  useEffect(() => {
    if (!instituicaoId) {
      alert('ID da instituição não informado');
      navigate('/dashboard/instituicoes');
      return;
    }
    loadDirigentes();
    loadAvisos();
  }, [instituicaoId, apenasAtivos]);

  const loadDirigentes = async () => {
    try {
      setLoading(true);
      const data = await dirigenteService.listar(instituicaoId!, apenasAtivos);
      setDirigentes(data);
    } catch (error) {
      console.error('Erro ao carregar dirigentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvisos = async () => {
    try {
      const response = await dirigenteService.verificarAvisos(instituicaoId!);
      setAvisos(response.avisos);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    }
  };

  const handleOpenModal = (dirigente?: Dirigente) => {
    if (dirigente) {
      setEditingDirigente(dirigente);
      setFormData(dirigente);
    } else {
      setEditingDirigente(null);
      setFormData({
        instituicaoId: instituicaoId || '',
        nomeCompleto: '',
        cpf: '',
        rg: '',
        orgaoExpedidor: '',
        ufOrgaoExpedidor: '',
        dataExpedicao: '',
        dataNascimento: '',
        sexo: '',
        nacionalidade: 'Brasileira',
        estadoCivil: '',
        cargo: '',
        dataInicioCargo: '',
        statusCargo: 'Ativo',
        telefone: '',
        email: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDirigente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      handleCloseModal();
      loadDirigentes();
      loadAvisos();
    } catch (error: any) {
      console.error('Erro ao salvar dirigente:', error);
      alert(error.response?.data?.error || 'Erro ao salvar dirigente');
    }
  };

  const handleOpenInativarModal = (dirigente: Dirigente) => {
    setInativandoDirigente(dirigente);
    setInativarData({ dataTermino: '', motivo: '' });
    setShowInativarModal(true);
  };

  const handleInativar = async () => {
    if (!inativandoDirigente) return;

    if (!inativarData.dataTermino || !inativarData.motivo) {
      alert('Data de término e motivo são obrigatórios');
      return;
    }

    try {
      await dirigenteService.inativar(
        inativandoDirigente.id!,
        inativarData.dataTermino,
        inativarData.motivo
      );
      alert('Dirigente inativado com sucesso!');
      setShowInativarModal(false);
      loadDirigentes();
      loadAvisos();
    } catch (error: any) {
      console.error('Erro ao inativar dirigente:', error);
      alert(error.response?.data?.error || 'Erro ao inativar dirigente');
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Diretoria</h1>
            <p className="text-gray-600 mt-1">Gerenciamento dos dirigentes da instituição</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            + Novo Dirigente
          </button>
        </div>

        {avisos.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Atenção: Cargos obrigatórios não preenchidos</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {avisos.map((aviso, idx) => (
                      <li key={idx}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={apenasAtivos}
              onChange={(e) => setApenasAtivos(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Mostrar apenas ativos</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando dirigentes...</p>
        </div>
      ) : dirigentes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhum dirigente cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dirigentes.map((dirigente) => (
            <div
              key={dirigente.id}
              className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{dirigente.nomeCompleto}</h3>
                  <p className="text-sm text-gray-600">{dirigente.cargo}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    dirigente.statusCargo === 'Ativo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {dirigente.statusCargo}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {dirigente.email}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {dirigente.telefone}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Início: {new Date(dirigente.dataInicioCargo).toLocaleDateString('pt-BR')}
                  {dirigente.dataTerminoCargo && (
                    <> | Término: {new Date(dirigente.dataTerminoCargo).toLocaleDateString('pt-BR')}</>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(dirigente)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Editar
                </button>
                {dirigente.statusCargo === 'Ativo' && (
                  <button
                    onClick={() => handleOpenInativarModal(dirigente)}
                    className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Inativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Simplificado de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingDirigente ? 'Editar Dirigente' : 'Novo Dirigente'}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">CPF *</label>
                    <input
                      type="text"
                      required
                      value={formatCPF(formData.cpf)}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })}
                      className="w-full border rounded px-3 py-2"
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">RG *</label>
                    <input
                      type="text"
                      required
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Data de Nascimento *</label>
                    <input
                      type="date"
                      required
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Sexo *</label>
                    <select
                      required
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {SEXO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estado Civil *</label>
                    <select
                      required
                      value={formData.estadoCivil}
                      onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {ESTADO_CIVIL_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cargo *</label>
                    <select
                      required
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {CARGO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Data Início *</label>
                    <input
                      type="date"
                      required
                      value={formData.dataInicioCargo}
                      onChange={(e) => setFormData({ ...formData, dataInicioCargo: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={formatPhone(formData.telefone)}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, '') })}
                      className="w-full border rounded px-3 py-2"
                      maxLength={15}
                    />
                  </div>

                  {/* Campos restantes simplificados - adicione conforme necessário */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Órgão Expedidor *</label>
                    <input
                      type="text"
                      required
                      value={formData.orgaoExpedidor}
                      onChange={(e) => setFormData({ ...formData, orgaoExpedidor: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">UF Órgão *</label>
                    <select
                      required
                      value={formData.ufOrgaoExpedidor}
                      onChange={(e) => setFormData({ ...formData, ufOrgaoExpedidor: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Data Expedição *</label>
                    <input
                      type="date"
                      required
                      value={formData.dataExpedicao}
                      onChange={(e) => setFormData({ ...formData, dataExpedicao: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nacionalidade *</label>
                    <input
                      type="text"
                      required
                      value={formData.nacionalidade}
                      onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">CEP *</label>
                    <input
                      type="text"
                      required
                      value={formatCEP(formData.cep)}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value.replace(/\D/g, '') })}
                      className="w-full border rounded px-3 py-2"
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Logradouro *</label>
                    <input
                      type="text"
                      required
                      value={formData.logradouro}
                      onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cidade *</label>
                    <input
                      type="text"
                      required
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">UF *</label>
                    <select
                      required
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDirigente ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Inativação */}
      {showInativarModal && inativandoDirigente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Inativar Dirigente</h2>
              <button
                type="button"
                onClick={() => setShowInativarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Inativar dirigente: <strong>{inativandoDirigente.nomeCompleto}</strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    required
                    value={inativarData.dataTermino}
                    onChange={(e) => setInativarData({ ...inativarData, dataTermino: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo da Inativação *
                  </label>
                  <textarea
                    required
                    value={inativarData.motivo}
                    onChange={(e) => setInativarData({ ...inativarData, motivo: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    maxLength={500}
                    placeholder="Descreva o motivo da inativação..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setShowInativarModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInativar}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Inativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiretoriaPage;

