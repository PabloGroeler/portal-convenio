import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import emendaService from '../services/emendaService';
import institutionService, { type InstitutionDTO } from '../services/institutionService';
import councilorService, { type CouncilorDTO } from '../services/councilorService';
import tipoEmendaService, { type TipoEmendaDTO } from '../services/tipoEmendaService';
import { formatCurrency, parseCurrency } from '../utils/formatters';

interface EmendaForm {
  id?: string;
  councilorId: string;
  officialCode: string;
  date: string;
  value: string;
  classification: string;
  esfera: string;
  existeConvenio: boolean;
  numeroConvenio: string;
  anoConvenio?: number;
  category: string;
  status: string;
  institutionId: string;
  signedLink: string;
  description: string;
  objectDetail: string;
  numeroEmenda?: number;
  exercicio?: number;
  justificativa?: string;
  previsaoConclusao?: string;
}

const CadastroEmendaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emendaId = searchParams.get('id');
  const instituicaoIdParam = searchParams.get('instituicaoId'); // Pega instituição da URL
  const isEditMode = !!emendaId;
  const isInstituicaoLocked = !!instituicaoIdParam; // Bloqueia se veio da URL

  const [form, setForm] = useState<EmendaForm>({
    councilorId: '',
    officialCode: '',
    date: new Date().toISOString().split('T')[0],
    value: 'R$ 0,00',
    classification: '',
    esfera: 'Municipal',
    existeConvenio: false,
    numeroConvenio: '',
    anoConvenio: undefined,
    category: '',
    status: 'Recebido',
    institutionId: instituicaoIdParam || '', // Preenche com o parâmetro da URL se existir
    signedLink: '',
    description: '',
    objectDetail: '',
    numeroEmenda: undefined,
    exercicio: new Date().getFullYear(),
    justificativa: '',
    previsaoConclusao: '',
  });

  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [councilors, setCouncilors] = useState<CouncilorDTO[]>([]);
  const [tiposEmenda, setTiposEmenda] = useState<TipoEmendaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search states for autocomplete
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [councilorSearch, setCouncilorSearch] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (emendaId) {
      loadEmenda(emendaId);
    }
  }, [emendaId]);

  const loadInitialData = async () => {
    try {
      const [instData, councData, tiposData] = await Promise.all([
        institutionService.list(),
        councilorService.list(),
        tipoEmendaService.list(),
      ]);
      setInstitutions(instData);
      setCouncilors(councData);
      setTiposEmenda(tiposData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados iniciais');
    }
  };

  const loadEmenda = async (id: string) => {
    setLoading(true);
    try {
      const data = await emendaService.getById(id);
      setForm({
        id: data.id,
        councilorId: data.councilorId || '',
        officialCode: data.officialCode || '',
        date: data.date || new Date().toISOString().split('T')[0],
        value: data.value ? formatCurrency(data.value) : 'R$ 0,00',
        classification: data.classification || '',
        esfera: data.esfera || 'Municipal',
        existeConvenio: data.existeConvenio || false,
        numeroConvenio: data.numeroConvenio || '',
        anoConvenio: data.anoConvenio,
        category: data.category || '',
        status: data.status || 'Recebido',
        institutionId: data.institutionId || '',
        signedLink: data.signedLink || '',
        description: data.description || '',
        objectDetail: data.objectDetail || '',
        numeroEmenda: data.numeroEmenda,
        exercicio: data.exercicio,
        justificativa: data.justificativa || '',
        previsaoConclusao: data.previsaoConclusao || '',
      });
    } catch (err) {
      console.error('Erro ao carregar emenda:', err);
      setError('Erro ao carregar emenda');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EmendaForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numValue = parseInt(rawValue || '0', 10);
    const formatted = formatCurrency(numValue / 100);
    handleChange('value', formatted);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!form.councilorId) errors.push('Parlamentar é obrigatório');
    if (!form.institutionId) errors.push('Instituição é obrigatória');
    if (!form.officialCode) errors.push('Código Oficial é obrigatório');
    if (!form.date) errors.push('Data é obrigatória');
    if (!form.value || parseCurrency(form.value) <= 0) errors.push('Valor deve ser maior que zero');
    if (!form.classification) errors.push('Tipo de Emenda é obrigatório');
    if (!form.description) errors.push('Descrição é obrigatória');

    // Justificativa é opcional, mas se preenchida deve ter no mínimo 20 caracteres
    if (form.justificativa && form.justificativa.trim().length > 0 && form.justificativa.trim().length < 20) {
      errors.push('Justificativa deve ter no mínimo 20 caracteres (ou deixe vazio)');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        value: parseCurrency(form.value),
      };

      console.log('📤 [CadastroEmenda] Sending payload to backend:', payload);
      console.log('📋 [CadastroEmenda] Payload details:', {
        councilorId: payload.councilorId,
        institutionId: payload.institutionId,
        officialCode: payload.officialCode,
        value: payload.value,
        classification: payload.classification,
        esfera: payload.esfera,
        existeConvenio: payload.existeConvenio,
      });

      if (isEditMode && form.id) {
        console.log('🔄 [CadastroEmenda] Updating emenda with id:', form.id);
        await emendaService.update(form.id, payload);
        setSuccess('Emenda atualizada com sucesso!');
      } else {
        console.log('➕ [CadastroEmenda] Creating new emenda');
        await emendaService.create(payload);
        setSuccess('Emenda criada com sucesso!');
      }

      setTimeout(() => {
        navigate('/dashboard/emendas');
      }, 1500);
    } catch (err: any) {
      console.error('❌ [CadastroEmenda] Error saving emenda:', err);
      console.error('❌ [CadastroEmenda] Error response:', err?.response);
      console.error('❌ [CadastroEmenda] Error data:', err?.response?.data);

      const errorMessage = err?.response?.data?.error || err?.message || 'Erro ao salvar emenda';
      console.error('❌ [CadastroEmenda] Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filteredInstitutions = institutions.filter((inst) =>
    inst.razaoSocial?.toLowerCase().includes(institutionSearch.toLowerCase())
  );

  const filteredCouncilors = councilors.filter((c) =>
    c.fullName?.toLowerCase().includes(councilorSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Editar Emenda' : 'Nova Emenda'}
            </h1>
            <p className="text-gray-600 mt-1">
              Preencha os dados da emenda. Campos marcados com * são obrigatórios.
            </p>
          </div>
        </div>
      </header>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Básicos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parlamentar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parlamentar *
              </label>
              <input
                type="text"
                placeholder="Buscar parlamentar..."
                value={councilorSearch}
                onChange={(e) => setCouncilorSearch(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2 text-sm"
              />
              <select
                required
                value={form.councilorId}
                onChange={(e) => handleChange('councilorId', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecione o parlamentar</option>
                {filteredCouncilors.map((c) => (
                  <option key={c.councilorId} value={c.councilorId}>
                    {c.fullName} {c.politicalParty ? `(${c.politicalParty})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Instituição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instituição * {isInstituicaoLocked && <span className="text-blue-600 text-xs">(Pré-selecionada)</span>}
              </label>
              {!isInstituicaoLocked && (
                <input
                  type="text"
                  placeholder="Buscar instituição..."
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2 text-sm"
                />
              )}
              <select
                required
                value={form.institutionId}
                onChange={(e) => handleChange('institutionId', e.target.value)}
                disabled={isInstituicaoLocked}
                className={`w-full border rounded px-3 py-2 ${
                  isInstituicaoLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Selecione a instituição</option>
                {filteredInstitutions.map((inst) => (
                  <option key={inst.institutionId} value={inst.institutionId}>
                    {inst.razaoSocial}
                  </option>
                ))}
              </select>
              {isInstituicaoLocked && (
                <p className="text-xs text-blue-600 mt-1">
                  ℹ️ Instituição vinculada automaticamente ao criar emenda pelo dashboard
                </p>
              )}
            </div>

            {/* Código Oficial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Oficial *
              </label>
              <input
                type="text"
                required
                value={form.officialCode}
                onChange={(e) => handleChange('officialCode', e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: 004-132-2025"
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="text"
                required
                value={form.value}
                onChange={handleValueChange}
                onBlur={(e) => {
                  const num = parseCurrency(e.target.value);
                  handleChange('value', formatCurrency(num));
                }}
                className="w-full border rounded px-3 py-2"
                placeholder="R$ 0,00"
              />
            </div>

            {/* Tipo de Emenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Emenda *
              </label>
              <select
                required
                value={form.classification}
                onChange={(e) => handleChange('classification', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecione o tipo</option>
                {tiposEmenda.map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: SAÚDE, EDUCAÇÃO"
              />
            </div>

            {/* Esfera */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Esfera
              </label>
              <select
                value={form.esfera}
                onChange={(e) => handleChange('esfera', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Municipal">Municipal</option>
                <option value="Estadual">Estadual</option>
                <option value="Federal">Federal</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              maxLength={250}
              placeholder="Descrição da emenda..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.description.length}/250 caracteres
            </p>
          </div>
        </section>

        {/* Detalhamento */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhamento</h2>

          <div className="space-y-4">
            {/* Objeto Detalhado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objeto Detalhado
              </label>
              <textarea
                value={form.objectDetail}
                onChange={(e) => handleChange('objectDetail', e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
                placeholder="Descrição detalhada do objeto da emenda..."
              />
            </div>

            {/* Justificativa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificativa
                <span className="text-xs text-gray-500 ml-2">(Opcional - mínimo 20 caracteres se preenchida)</span>
              </label>
              <textarea
                value={form.justificativa}
                onChange={(e) => handleChange('justificativa', e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
                minLength={20}
                maxLength={250}
                placeholder="Justificativa da emenda... (mínimo 20 caracteres)"
              />
              {form.justificativa && (
                <p className={`text-xs mt-1 ${
                  form.justificativa.length < 20 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {form.justificativa.length}/250 caracteres
                  {form.justificativa.length < 20 && ' (mínimo 20)'}
                </p>
              )}
            </div>

            {/* Convênio */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.existeConvenio}
                  onChange={(e) => handleChange('existeConvenio', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Existe Convênio?</span>
              </label>
            </div>

            {form.existeConvenio && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Convênio
                  </label>
                  <input
                    type="text"
                    value={form.numeroConvenio}
                    onChange={(e) => handleChange('numeroConvenio', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano do Convênio
                  </label>
                  <input
                    type="number"
                    value={form.anoConvenio || ''}
                    onChange={(e) => handleChange('anoConvenio', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full border rounded px-3 py-2"
                    min={2000}
                    max={new Date().getFullYear() + 5}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/emendas')}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Emenda')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroEmendaPage;
