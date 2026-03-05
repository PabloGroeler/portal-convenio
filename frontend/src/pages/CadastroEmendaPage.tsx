import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import emendaService from '../services/emendaService';
import institutionService, { type InstitutionDTO } from '../services/institutionService';
import councilorService, { type CouncilorDTO } from '../services/councilorService';
import tipoEmendaService, { type TipoEmendaDTO } from '../services/tipoEmendaService';
import funcaoOrcamentariaService, { type FuncaoOrcamentariaDTO } from '../services/funcaoOrcamentariaService';
import { formatCurrency, parseCurrency } from '../utils/formatters';
import api from '../services/api';

interface DotacaoOrcamentaria {
  id: number;
  codigoReduzido: string;
  dotacao: string;
  descricao?: string;
}

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
  tipoTransferencia: string;
  dotacaoOrcamentariaId?: number;
  dotacaoOrcamentariaTexto?: string;
  funcaoCodigo?: string;
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
    tipoTransferencia: 'Direta',
    dotacaoOrcamentariaId: undefined,
    dotacaoOrcamentariaTexto: '',
    funcaoCodigo: '',
  });

  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [councilors, setCouncilors] = useState<CouncilorDTO[]>([]);
  const [tiposEmenda, setTiposEmenda] = useState<TipoEmendaDTO[]>([]);
  const [funcoesOrcamentarias, setFuncoesOrcamentarias] = useState<FuncaoOrcamentariaDTO[]>([]);
  const [dotacoesAll, setDotacoesAll] = useState<DotacaoOrcamentaria[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search states for autocomplete
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [councilorSearch, setCouncilorSearch] = useState('');

  // Dotação combobox state
  const [dotacaoQuery, setDotacaoQuery] = useState('');
  const [dotacaoOpen, setDotacaoOpen] = useState(false);
  const dotacaoRef = useRef<HTMLDivElement>(null);

  const dotacaoFiltered = useCallback(() => {
    const q = dotacaoQuery.trim().toLowerCase();
    if (!q) return dotacoesAll.slice(0, 50);
    return dotacoesAll.filter(d =>
      (d.descricao || '').toLowerCase().includes(q) ||
      d.codigoReduzido.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [dotacaoQuery, dotacoesAll]);

  // Close dotacao dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dotacaoRef.current && !dotacaoRef.current.contains(e.target as Node)) {
        setDotacaoOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      const [instData, councData, tiposData, funcoesData, dotacoesData] = await Promise.all([
        institutionService.list(),
        councilorService.list(),
        tipoEmendaService.list(),
        funcaoOrcamentariaService.list(),
        api.get<DotacaoOrcamentaria[]>('/dotacoes-orcamentarias/search?limit=500').then(r => {
          // Deduplicate by codigoReduzido client-side
          const seen = new Map<string, DotacaoOrcamentaria>();
          for (const d of r.data) {
            if (!seen.has(d.codigoReduzido)) seen.set(d.codigoReduzido, d);
          }
          return Array.from(seen.values());
        }).catch(() => [] as DotacaoOrcamentaria[]),
      ]);
      setInstitutions(instData);
      setCouncilors(councData);
      setTiposEmenda(tiposData);
      setFuncoesOrcamentarias(funcoesData);
      setDotacoesAll(dotacoesData);
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
        tipoTransferencia: data.tipoTransferencia || 'Direta',
        dotacaoOrcamentariaId: data.dotacaoOrcamentariaId,
        dotacaoOrcamentariaTexto: data.dotacaoOrcamentariaTexto || '',
        funcaoCodigo: data.funcaoCodigo || '',
      });
      if (data.dotacaoOrcamentariaTexto) {
        setDotacaoQuery(data.dotacaoOrcamentariaTexto);
      }
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

            {/* Função / Área de Atuação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função / Área de Atuação
              </label>
              <select
                value={form.funcaoCodigo ?? ''}
                onChange={e => handleChange('funcaoCodigo', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecione a função / área de atuação...</option>
                {funcoesOrcamentarias.map(f => (
                  <option key={f.codigo} value={f.codigo}>{f.descricao}</option>
                ))}
              </select>
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

            {/* Forma de Execução */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Execução
              </label>
              <div className="flex gap-6 mt-1">
                {['Direta', 'Indireta'].map(tipo => (
                  <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoTransferencia"
                      value={tipo}
                      checked={form.tipoTransferencia === tipo}
                      onChange={() => handleChange('tipoTransferencia', tipo)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{tipo}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Dotação Orçamentária — combobox com pesquisa */}
          <div className="mt-4" ref={dotacaoRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dotação Orçamentária
            </label>
            <div className="relative">
              <div
                className={`flex items-center border rounded bg-white px-3 py-2 gap-2 cursor-text ${dotacaoOpen ? 'ring-2 ring-blue-400 border-blue-400' : 'border-gray-300'}`}
                onClick={() => setDotacaoOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  value={dotacaoQuery}
                  onChange={e => { setDotacaoQuery(e.target.value); }}
                  onFocus={() => setDotacaoOpen(true)}
                  onKeyDown={e => {
                    // don't rely on Tab — support Enter to trigger the search/dropdown
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setDotacaoOpen(true);
                    }
                  }}
                  placeholder="Pesquisar dotação pela descrição..."
                  className="flex-1 text-sm outline-none bg-transparent"
                />
                {/* Search button to explicitly open/find dotação — useful when Tab doesn't trigger */}
                <button type="button" onClick={e => { e.stopPropagation(); setDotacaoOpen(true); }}
                  className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded text-xs hover:bg-blue-100">
                  Buscar
                </button>
                {form.dotacaoOrcamentariaId && (
                  <button type="button"
                    onClick={e => { e.stopPropagation(); handleChange('dotacaoOrcamentariaId', undefined); handleChange('dotacaoOrcamentariaTexto', ''); setDotacaoQuery(''); }}
                    className="text-gray-400 hover:text-red-500 shrink-0 text-xs">✕
                  </button>
                )}
              </div>

              {dotacaoOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {dotacaoFiltered().length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Nenhuma dotação encontrada</div>
                  ) : (
                    dotacaoFiltered().map(d => (
                      <button key={d.id} type="button"
                        onMouseDown={() => {
                          handleChange('dotacaoOrcamentariaId', d.id);
                          handleChange('dotacaoOrcamentariaTexto', `${d.codigoReduzido} - ${d.descricao || d.dotacao}`);
                          setDotacaoQuery(`${d.codigoReduzido} — ${d.descricao || d.dotacao}`);
                          setDotacaoOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0">
                        <span className="text-xs font-mono font-bold text-blue-700 mr-2">{d.codigoReduzido}</span>
                        <span className="text-sm text-gray-700">{d.descricao || d.dotacao}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {form.dotacaoOrcamentariaId && (
              <p className="text-xs text-green-700 mt-1">✅ Dotação selecionada</p>
            )}
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
              maxLength={5000}
              placeholder="Descrição da emenda..."
            />
            <p className="text-xs text-gray-500 mt-1">{form.description.length}/5000 caracteres</p>
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
