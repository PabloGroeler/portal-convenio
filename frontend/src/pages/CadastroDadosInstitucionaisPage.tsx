import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import institutionService from '../services/institutionService';
import type { InstitutionDTO } from '../services/institutionService';
import { getCurrentUserData } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { lookupCep } from '../services/cepService';
import {
  formatCep,
  formatPhoneBR,
  isValidCnpj,
  isValidEmail,
  isValidUrl,
  onlyDigits,
} from '../utils/formatters';
import dirigenteService from '../services/dirigenteService';
import type { Dirigente } from '../types/dirigente.types';
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  CARGO_OPTIONS,
  UF_OPTIONS
} from '../types/dirigente.types';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const AREAS_ATUACAO_OPTIONS = [
  'Assistência Social',
  'Saúde',
  'Educação',
  'Cultura',
  'Esporte',
  'Meio Ambiente',
  'Direitos Humanos',
  'Outra',
];

type FormState = Partial<InstitutionDTO>;

const CadastroDadosInstitucionaisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const editId = searchParams.get('id');

  const [loadingExisting, setLoadingExisting] = useState(false);

  const [form, setForm] = useState<FormState>({
     razaoSocial: '',
     nomeFantasia: '',
     cnpj: '',
     inscricaoEstadual: '',
     inscricaoMunicipal: '',
     dataFundacao: '',
     areasAtuacao: [],

     telefone: '',
     celular: '',
     emailInstitucional: '',
     emailSecundario: '',
     website: '',

     cep: '',
     logradouro: '',
     numero: '',
     complemento: '',
     bairro: '',
     cidade: '',
     uf: 'MT',
     pontoReferencia: '',

     numeroRegistroConselhoMunicipal: '',
     dataRegistroConselho: '',
     objetoSocial: '',
     quantidadeBeneficiarios: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para abas e dirigentes
  const [activeTab, setActiveTab] = useState<'instituicao' | 'dirigentes'>('instituicao');
  const [dirigentes, setDirigentes] = useState<Dirigente[]>([]);
  const [loadingDirigentes, setLoadingDirigentes] = useState(false);
  const [showDirigenteModal, setShowDirigenteModal] = useState(false);
  const [editingDirigente, setEditingDirigente] = useState<Dirigente | null>(null);
  const [apenasAtivos, setApenasAtivos] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);

  const [dirigenteFormData, setDirigenteFormData] = useState<Dirigente>({
    instituicaoId: editId || '',
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

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    const required = (key: keyof FormState, msg: string) => {
      const v = (form[key] as unknown as string) ?? '';
      if (!String(v).trim()) e[String(key)] = msg;
    };

    // Dados básicos
    required('razaoSocial', 'Razão Social é obrigatória.');
    if ((form.razaoSocial ?? '').length > 200) e.razaoSocial = 'Máx. 200 caracteres.';

    if ((form.nomeFantasia ?? '').length > 200) e.nomeFantasia = 'Máx. 200 caracteres.';

    required('cnpj', 'CNPJ é obrigatório.');
    if (form.cnpj && !isValidCnpj(form.cnpj)) e.cnpj = 'CNPJ inválido.';

    if ((form.inscricaoEstadual ?? '').length > 20) e.inscricaoEstadual = 'Máx. 20 caracteres.';

    required('inscricaoMunicipal', 'Inscrição Municipal é obrigatória.');
    if ((form.inscricaoMunicipal ?? '').length > 20) e.inscricaoMunicipal = 'Máx. 20 caracteres.';

    // Contato
    required('telefone', 'Telefone é obrigatório.');
    if (form.telefone) {
      const digits = onlyDigits(form.telefone);
      if (digits.length < 10) e.telefone = 'Telefone inválido.';
    }

    if (form.celular) {
      const digits = onlyDigits(form.celular);
      if (digits.length !== 11) e.celular = 'Celular inválido.';
    }

    required('emailInstitucional', 'E-mail institucional é obrigatório.');
    if (form.emailInstitucional && !isValidEmail(form.emailInstitucional)) e.emailInstitucional = 'E-mail inválido.';

    if (form.emailSecundario && !isValidEmail(form.emailSecundario)) e.emailSecundario = 'E-mail inválido.';

    if (form.website && !isValidUrl(form.website)) e.website = 'Website inválido (use http/https).';

    // Endereço
    required('cep', 'CEP é obrigatório.');
    if (form.cep) {
      const digits = onlyDigits(form.cep);
      if (digits.length !== 8) e.cep = 'CEP inválido.';
    }

    required('logradouro', 'Logradouro é obrigatório.');
    required('numero', 'Número é obrigatório.');
    required('bairro', 'Bairro é obrigatório.');
    required('cidade', 'Cidade é obrigatória.');
    required('uf', 'UF é obrigatória.');

    // Adicionais
    required('numeroRegistroConselhoMunicipal', 'Número de registro no Conselho Municipal é obrigatório.');

    if (form.quantidadeBeneficiarios != null) {
      const n = Number(form.quantidadeBeneficiarios);
      if (Number.isNaN(n) || n < 0) e.quantidadeBeneficiarios = 'Informe um número válido (>= 0).';
    }

    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleToggleArea = (area: string) => {
    const current = form.areasAtuacao ?? [];
    if (current.includes(area)) {
      setField('areasAtuacao', current.filter((a) => a !== area));
    } else {
      setField('areasAtuacao', [...current, area]);
    }
  };

  // Funções para gerenciar dirigentes
  const loadDirigentes = async () => {
    if (!editId) return;

    try {
      setLoadingDirigentes(true);
      const data = await dirigenteService.listar(editId, apenasAtivos);
      setDirigentes(data);

      // Carregar avisos
      const response = await dirigenteService.verificarAvisos(editId);
      setAvisos(response.avisos);
    } catch (error) {
      console.error('Erro ao carregar dirigentes:', error);
    } finally {
      setLoadingDirigentes(false);
    }
  };

  const handleOpenDirigenteModal = (dirigente?: Dirigente) => {
    if (dirigente) {
      setEditingDirigente(dirigente);
      setDirigenteFormData(dirigente);
    } else {
      setEditingDirigente(null);
      setDirigenteFormData({
        instituicaoId: editId || '',
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
    setShowDirigenteModal(true);
  };

  const handleSaveDirigente = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDirigente) {
        await dirigenteService.atualizar(editingDirigente.id!, dirigenteFormData);
        alert('Dirigente atualizado com sucesso!');
      } else {
        await dirigenteService.criar(dirigenteFormData);
        alert('Dirigente cadastrado com sucesso!');
      }

      setShowDirigenteModal(false);
      loadDirigentes();
    } catch (error: any) {
      console.error('Erro ao salvar dirigente:', error);
      alert(error.response?.data?.error || 'Erro ao salvar dirigente');
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCEPDirigente = (value: string) => {
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

  // Carregar dirigentes quando mudar para aba de dirigentes
  useEffect(() => {
    if (activeTab === 'dirigentes' && editId) {
      loadDirigentes();
    }
  }, [activeTab, editId, apenasAtivos]);

  const handleCepBlur = async () => {
    setError(null);
    setSuccess(null);

    const digits = onlyDigits(form.cep ?? '');
    if (digits.length !== 8) {
      setError('Informe um CEP válido para buscar o endereço.');
      return;
    }

    setLoadingCep(true);
    try {
      const result = await lookupCep(digits);
      if (!result) {
        setError('CEP não encontrado.');
        return;
      }
      setField('logradouro', result.logradouro ?? form.logradouro ?? '');
      setField('bairro', result.bairro ?? form.bairro ?? '');
      setField('cidade', result.localidade ?? form.cidade ?? '');
      setField('uf', (result.uf as any) ?? form.uf ?? '');
      if (result.complemento && !form.complemento) setField('complemento', result.complemento);
    } catch {
      setError('Falha ao consultar CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  // If an id is provided, load the record to edit and prefill the form.
  useEffect(() => {
    if (!editId) return;

    let cancelled = false;
    (async () => {
      setLoadingExisting(true);
      setError(null);
      setSuccess(null);
      try {
        const existing = await institutionService.getById(editId);
        if (cancelled) return;

        setForm((prev) => ({
          ...prev,
          ...existing,
          // Ensure arrays are always arrays
          areasAtuacao: Array.isArray(existing.areasAtuacao) ? existing.areasAtuacao : [],
        }));
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.error || 'Não foi possível carregar a instituição para edição.');
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (hasErrors) {
      setError('Revise os campos destacados.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<InstitutionDTO> = {
         razaoSocial: (form.razaoSocial ?? '').trim(),
         nomeFantasia: (form.nomeFantasia ?? '').trim() || undefined,
         cnpj: onlyDigits(form.cnpj ?? ''),
         inscricaoEstadual: (form.inscricaoEstadual ?? '').trim() || undefined,
         inscricaoMunicipal: (form.inscricaoMunicipal ?? '').trim(),
         dataFundacao: (form.dataFundacao ?? '').trim() || undefined,
         areasAtuacao: form.areasAtuacao ?? [],

         telefone: (form.telefone ?? '').trim(),
         celular: (form.celular ?? '').trim() || undefined,
         emailInstitucional: (form.emailInstitucional ?? '').trim(),
         emailSecundario: (form.emailSecundario ?? '').trim() || undefined,
         website: (form.website ?? '').trim() || undefined,

         cep: onlyDigits(form.cep ?? ''),
         logradouro: (form.logradouro ?? '').trim(),
         numero: (form.numero ?? '').trim(),
         complemento: (form.complemento ?? '').trim() || undefined,
         bairro: (form.bairro ?? '').trim(),
         cidade: (form.cidade ?? '').trim(),
         uf: (form.uf ?? '').trim(),
         pontoReferencia: (form.pontoReferencia ?? '').trim() || undefined,

         numeroRegistroConselhoMunicipal: (form.numeroRegistroConselhoMunicipal ?? '').trim(),
         dataRegistroConselho: (form.dataRegistroConselho ?? '').trim() || undefined,
         objetoSocial: (form.objetoSocial ?? '').trim() || undefined,
         quantidadeBeneficiarios: form.quantidadeBeneficiarios != null ? Number(form.quantidadeBeneficiarios) : undefined,
      };

      const isEdit = Boolean(editId && editId.trim().length > 0);
      console.debug('[CadastroDadosInstitucionais] submit', { isEdit, editId, payload });

      if (isEdit) {
        await institutionService.update(editId as string, payload);
        setSuccess('Cadastro atualizado com sucesso.');
        setTimeout(() => navigate('/dashboard/instituicoes'), 500);
      } else {
        await institutionService.create(payload);
        setSuccess('Cadastro realizado com sucesso e vinculado ao seu usuário.');

        // Buscar dados atualizados do usuário
        try {
          await getCurrentUserData();
          refreshUser();
        } catch (err) {
          console.error('Erro ao atualizar dados do usuário:', err);
        }

        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: any) {
      console.error('[CadastroDadosInstitucionais] submit error', err);
      setError(err?.response?.data?.error || 'Erro ao cadastrar dados institucionais.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (key: keyof FormState) =>
    `w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
      errors[String(key)] ? 'border-red-400' : 'border-gray-300'
    }`;

  const help = (key: keyof FormState) =>
    errors[String(key)] ? (
      <p className="text-xs text-red-600 mt-1">{errors[String(key)]}</p>
    ) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cadastro de Dados Institucionais</h1>
        <p className="text-gray-600 mt-1">
          Preencha os dados cadastrais. Campos marcados com * são obrigatórios.
        </p>
      </header>

      {loadingExisting && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">
          Carregando dados da instituição...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
          {success}
        </div>
      )}

      {/* Sistema de Abas */}
      {editId && (
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('instituicao')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'instituicao'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Dados da Instituição
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dirigentes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dirigentes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Diretoria ({dirigentes.length})
            </button>
          </nav>
        </div>
      )}

      {/* Aba 1: Formulário da Instituição */}
      {activeTab === 'instituicao' && (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Básicos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
              <input
                type="text"
                maxLength={200}
                value={form.razaoSocial ?? ''}
                onChange={(e) => setField('razaoSocial', e.target.value)}
                className={fieldClass('razaoSocial')}
              />
              {help('razaoSocial')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <input
                type="text"
                maxLength={200}
                value={form.nomeFantasia ?? ''}
                onChange={(e) => setField('nomeFantasia', e.target.value)}
                className={fieldClass('nomeFantasia')}
              />
              {help('nomeFantasia')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.cnpj ?? ''}
                onChange={(e) => setField('cnpj', e.target.value)}
                className={fieldClass('cnpj')}
                placeholder="00.000.000/0000-00"
              />
              {help('cnpj')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
              <input
                type="text"
                maxLength={20}
                value={form.inscricaoEstadual ?? ''}
                onChange={(e) => setField('inscricaoEstadual', e.target.value)}
                className={fieldClass('inscricaoEstadual')}
              />
              {help('inscricaoEstadual')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal *</label>
              <input
                type="text"
                maxLength={20}
                value={form.inscricaoMunicipal ?? ''}
                onChange={(e) => setField('inscricaoMunicipal', e.target.value)}
                className={fieldClass('inscricaoMunicipal')}
              />
              {help('inscricaoMunicipal')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fundação</label>
              <input
                type="date"
                value={form.dataFundacao ?? ''}
                onChange={(e) => setField('dataFundacao', e.target.value)}
                className={fieldClass('dataFundacao')}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Área de Atuação</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AREAS_ATUACAO_OPTIONS.map((opt) => {
                const checked = (form.areasAtuacao ?? []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleArea(opt)}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dados de Contato */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados de Contato</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input
                type="text"
                value={form.telefone ?? ''}
                onChange={(e) => setField('telefone', formatPhoneBR(e.target.value))}
                className={fieldClass('telefone')}
                placeholder="(00) 0000-0000"
              />
              {help('telefone')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                type="text"
                value={form.celular ?? ''}
                onChange={(e) => setField('celular', formatPhoneBR(e.target.value))}
                className={fieldClass('celular')}
                placeholder="(00) 00000-0000"
              />
              {help('celular')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional *</label>
              <input
                type="email"
                value={form.emailInstitucional ?? ''}
                onChange={(e) => setField('emailInstitucional', e.target.value)}
                className={fieldClass('emailInstitucional')}
              />
              {help('emailInstitucional')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Secundário</label>
              <input
                type="email"
                value={form.emailSecundario ?? ''}
                onChange={(e) => setField('emailSecundario', e.target.value)}
                className={fieldClass('emailSecundario')}
              />
              {help('emailSecundario')}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={form.website ?? ''}
                onChange={(e) => setField('website', e.target.value)}
                className={fieldClass('website')}
                placeholder="https://..."
              />
              {help('website')}
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Endereço</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formatCep(form.cep ?? '')}
                  onChange={(e) => setField('cep', e.target.value)}
                  className={fieldClass('cep')}
                  placeholder="00000-000"
                />
                <button
                  type="button"
                  onClick={handleCepBlur}
                  disabled={loadingCep}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-60"
                >
                  {loadingCep ? 'Buscando...' : 'Buscar CEP'}
                </button>
              </div>
              {help('cep')}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
              <input
                type="text"
                value={form.logradouro ?? ''}
                onChange={(e) => setField('logradouro', e.target.value)}
                className={fieldClass('logradouro')}
              />
              {help('logradouro')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                type="text"
                value={form.numero ?? ''}
                onChange={(e) => setField('numero', e.target.value)}
                className={fieldClass('numero')}
              />
              {help('numero')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                type="text"
                value={form.complemento ?? ''}
                onChange={(e) => setField('complemento', e.target.value)}
                className={fieldClass('complemento')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input
                type="text"
                value={form.bairro ?? ''}
                onChange={(e) => setField('bairro', e.target.value)}
                className={fieldClass('bairro')}
              />
              {help('bairro')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input
                type="text"
                value={form.cidade ?? ''}
                onChange={(e) => setField('cidade', e.target.value)}
                className={fieldClass('cidade')}
              />
              {help('cidade')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
              <select
                value={form.uf ?? ''}
                onChange={(e) => setField('uf', e.target.value)}
                className={fieldClass('uf')}
              >
                <option value="">Selecione</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {help('uf')}
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ponto de Referência</label>
              <input
                type="text"
                value={form.pontoReferencia ?? ''}
                onChange={(e) => setField('pontoReferencia', e.target.value)}
                className={fieldClass('pontoReferencia')}
              />
            </div>
          </div>
        </section>

        {/* Informações Adicionais */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Adicionais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº de Registro no Conselho Municipal *
              </label>
              <input
                type="text"
                value={form.numeroRegistroConselhoMunicipal ?? ''}
                onChange={(e) => setField('numeroRegistroConselhoMunicipal', e.target.value)}
                className={fieldClass('numeroRegistroConselhoMunicipal')}
              />
              {help('numeroRegistroConselhoMunicipal')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Registro no Conselho</label>
              <input
                type="date"
                value={form.dataRegistroConselho ?? ''}
                onChange={(e) => setField('dataRegistroConselho', e.target.value)}
                className={fieldClass('dataRegistroConselho')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Objeto Social</label>
              <textarea
                value={form.objetoSocial ?? ''}
                onChange={(e) => setField('objetoSocial', e.target.value)}
                className={fieldClass('objetoSocial')}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de Beneficiários Atendidos
              </label>
              <input
                type="number"
                min={0}
                value={form.quantidadeBeneficiarios ?? ''}
                onChange={(e) => setField('quantidadeBeneficiarios', e.target.value ? Number(e.target.value) : undefined)}
                className={fieldClass('quantidadeBeneficiarios')}
              />
              {help('quantidadeBeneficiarios')}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : (editId ? 'Salvar Alterações' : 'Salvar Cadastro')}
          </button>
        </div>
      </form>
      )}

      {/* Aba 2: Diretoria */}
      {activeTab === 'dirigentes' && editId && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Diretoria</h2>
              <p className="text-gray-600 mt-1">Gerenciamento dos dirigentes da instituição</p>
            </div>
            <button
              onClick={() => handleOpenDirigenteModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              + Novo Dirigente
            </button>
          </div>

          {avisos.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
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

          <div className="flex items-center gap-4">
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

          {loadingDirigentes ? (
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
                  className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-lg transition-shadow flex flex-col"
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

                  <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
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
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleOpenDirigenteModal(dirigente)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Cadastro/Edição de Dirigente */}
      {showDirigenteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            <form onSubmit={handleSaveDirigente}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingDirigente ? 'Editar Dirigente' : 'Novo Dirigente'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowDirigenteModal(false)}
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
                      value={dirigenteFormData.nomeCompleto}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, nomeCompleto: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">CPF *</label>
                    <input
                      type="text"
                      required
                      value={formatCPF(dirigenteFormData.cpf)}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, cpf: e.target.value.replace(/\D/g, '') })}
                      className="w-full border rounded px-3 py-2"
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">RG *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.rg}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, rg: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Data de Nascimento *</label>
                    <input
                      type="date"
                      required
                      value={dirigenteFormData.dataNascimento}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, dataNascimento: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Sexo *</label>
                    <select
                      required
                      value={dirigenteFormData.sexo}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, sexo: e.target.value })}
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
                      value={dirigenteFormData.estadoCivil}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, estadoCivil: e.target.value })}
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
                      value={dirigenteFormData.cargo}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, cargo: e.target.value })}
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
                      value={dirigenteFormData.dataInicioCargo}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, dataInicioCargo: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={dirigenteFormData.email}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={formatPhone(dirigenteFormData.telefone)}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, telefone: e.target.value.replace(/\D/g, '') })}
                      className="w-full border rounded px-3 py-2"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Órgão Expedidor *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.orgaoExpedidor}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, orgaoExpedidor: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">UF Órgão *</label>
                    <select
                      required
                      value={dirigenteFormData.ufOrgaoExpedidor}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, ufOrgaoExpedidor: e.target.value })}
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
                      value={dirigenteFormData.dataExpedicao}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, dataExpedicao: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nacionalidade *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.nacionalidade}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, nacionalidade: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">CEP *</label>
                    <input
                      type="text"
                      required
                      value={formatCEPDirigente(dirigenteFormData.cep)}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, cep: e.target.value.replace(/\D/g, '') })}
                      className="w-full border rounded px-3 py-2"
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Logradouro *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.logradouro}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, logradouro: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.numero}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, numero: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.bairro}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, bairro: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cidade *</label>
                    <input
                      type="text"
                      required
                      value={dirigenteFormData.cidade}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, cidade: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">UF *</label>
                    <select
                      required
                      value={dirigenteFormData.uf}
                      onChange={(e) => setDirigenteFormData({ ...dirigenteFormData, uf: e.target.value })}
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
                  onClick={() => setShowDirigenteModal(false)}
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
    </div>
  );
};

export default CadastroDadosInstitucionaisPage;
