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

  const handleLookupCep = async () => {
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
                  onClick={handleLookupCep}
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
    </div>
  );
};

export default CadastroDadosInstitucionaisPage;
