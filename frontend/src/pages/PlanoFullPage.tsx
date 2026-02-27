import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import planoService from '../services/planoTrabalhoService';
import metaService from '../services/metaService';
import type { Meta } from '../services/metaService';
import itemService from '../services/itemService';
import type { Item } from '../services/itemService';
import prestacaoService from '../services/prestacaoContaService';
import type { PrestacaoConta } from '../services/prestacaoContaService';
import emendaService from '../services/emendaService';
import institutionService from '../services/institutionService';
import { formatCurrency, parseCurrency } from '../utils/formatters';

const currencyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ── Types ──────────────────────────────────────────────────────────────────
type MetaForm = { titulo: string; descricao: string; valor: string };
const emptyMeta = (): MetaForm => ({ titulo: '', descricao: '', valor: '' });
type ItemForm = { titulo: string; descricao: string; valor: string };
const emptyItem = (): ItemForm => ({ titulo: '', descricao: '', valor: '' });
type Tab = 'metas' | 'prestacoes';

interface PlanoForm {
  titulo: string;
  descricao: string;
  emendaId: string;
  valor: string;
  status: string;
}

const emptyPlanoForm = (): PlanoForm => ({
  titulo: '',
  descricao: '',
  emendaId: '',
  valor: 'R$ 0,00',
  status: 'RASCUNHO',
});

const STATUS_OPTIONS = ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'];

const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  PENDENTE: 'Pendente',
  ENVIADO: 'Enviado',
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};
const STATUS_COLOR: Record<string, string> = {
  APROVADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REPROVADO: 'bg-red-100 text-red-700 border-red-200',
  EM_ANALISE: 'bg-blue-100 text-blue-700 border-blue-200',
  ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
  PENDENTE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  RASCUNHO: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ── Component ──────────────────────────────────────────────────────────────
const PlanoFullPage: React.FC = () => {
  const { id } = useParams();           // exists when viewing an existing plan
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // query-params used both for create and for "back" navigation
  const instituicaoIdParam = searchParams.get('instituicaoId') || '';
  const emendaIdParam = searchParams.get('emendaId') || '';

  const isCreateMode = !id;
  const backUrl = instituicaoIdParam
    ? `/dashboard/cadastro-dados-institucionais?id=${instituicaoIdParam}&tab=planos`
    : '/dashboard';

  // ── Shared loading ────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);

  // ── Plan form (create + inline-edit header) ───────────────────────────────
  const [planoForm, setPlanoForm] = useState<PlanoForm>(emptyPlanoForm());
  const [isEditingHeader, setIsEditingHeader] = useState(isCreateMode);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planErrors, setPlanErrors] = useState<Record<string, string>>({});
  const [instituicaoNome, setInstituicaoNome] = useState('');
  const [emendas, setEmendas] = useState<any[]>([]);

  // ── Tabs (only in view mode) ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('metas');

  // ── Metas ─────────────────────────────────────────────────────────────────
  const [metas, setMetas] = useState<Meta[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [showNewMeta, setShowNewMeta] = useState(false);
  const [newMeta, setNewMeta] = useState<MetaForm>(emptyMeta());
  const [savingMeta, setSavingMeta] = useState(false);
  const [editingMetaId, setEditingMetaId] = useState<string | null>(null);
  const [editMetaForm, setEditMetaForm] = useState<MetaForm>(emptyMeta());

  // ── Items ─────────────────────────────────────────────────────────────────
  const [itemsByMeta, setItemsByMeta] = useState<Record<string, Item[]>>({});
  const [expandedMetas, setExpandedMetas] = useState<Set<string>>(new Set());
  const [itemError, setItemError] = useState<string | null>(null);
  const [showNewItemFor, setShowNewItemFor] = useState<string | null>(null);
  const [newItemByMeta, setNewItemByMeta] = useState<Record<string, ItemForm>>({});
  const [savingItemMeta, setSavingItemMeta] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<ItemForm>(emptyItem());

  // ── Prestações ────────────────────────────────────────────────────────────
  const [prestacoes, setPrestacoes] = useState<PrestacaoConta[]>([]);
  const [pcLoading, setPcLoading] = useState(false);
  const [pcError, setPcError] = useState<string | null>(null);
  const [showNewPc, setShowNewPc] = useState(false);
  const [pcValor, setPcValor] = useState<number | ''>('');
  const [pcObs, setPcObs] = useState('');
  const [savingPc, setSavingPc] = useState(false);
  const [editingPcId, setEditingPcId] = useState<string | null>(null);
  const [editPcValor, setEditPcValor] = useState<number | ''>('');
  const [editPcObs, setEditPcObs] = useState('');
  const [editPcSaving, setEditPcSaving] = useState(false);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const instituicaoId = instituicaoIdParam;

    const loadSupportData = async () => {
      if (instituicaoId) {
        try {
          const inst = await institutionService.getByInstitutionId(instituicaoId);
          setInstituicaoNome(inst?.razaoSocial || inst?.nomeFantasia || instituicaoId);
        } catch { setInstituicaoNome(instituicaoId); }
        try {
          const all = await emendaService.listWithDetails();
          setEmendas(all.filter((e: any) => e.institutionId === instituicaoId || e.institution?.id === instituicaoId));
        } catch { /* ignore */ }
      }
    };

    if (isCreateMode) {
      setPlanoForm({ ...emptyPlanoForm(), emendaId: emendaIdParam });
      setIsEditingHeader(true);
      loadSupportData().finally(() => setPageLoading(false));
    } else {
      const loadExisting = async () => {
        try {
          setPageLoading(true);
          const res = await planoService.getFull(id!);
          const p = res.data;
          setPlan(p);
          // populate form for potential inline edit
          setPlanoForm({
            titulo: p.titulo || '',
            descricao: p.descricao || '',
            emendaId: p.emendaId || '',
            valor: p.valor != null ? formatCurrency(String(p.valor)) : 'R$ 0,00',
            status: p.status || 'RASCUNHO',
          });
          const inst = p.instituicaoId || instituicaoIdParam;
          if (inst) {
            await loadSupportData();
            // Also load emendas for the plan's institution
            if (!instituicaoIdParam && p.instituicaoId) {
              try {
                const instObj = await institutionService.getByInstitutionId(p.instituicaoId);
                setInstituicaoNome(instObj?.razaoSocial || instObj?.nomeFantasia || p.instituicaoId);
              } catch { setInstituicaoNome(p.instituicaoId); }
            }
          }
          setMetas(await metaService.listByPlano(id!));
          await loadPrestacoes(p.id || id!);
        } catch (err) {
          console.error('Erro ao carregar plano', err);
        } finally {
          setPageLoading(false);
        }
      };
      loadExisting();
    }
  }, [id]);

  // ── Plan save (create or update header) ───────────────────────────────────
  const validatePlan = (): boolean => {
    const e: Record<string, string> = {};
    if (!planoForm.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (planoForm.titulo.trim().length > 0 && planoForm.titulo.trim().length < 5)
      e.titulo = 'Título deve ter ao menos 5 caracteres';
    if (isCreateMode && !instituicaoIdParam) e.instituicao = 'Instituição é obrigatória';
    setPlanErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSavePlan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validatePlan()) return;
    try {
      setSavingPlan(true);
      const valorNum = parseCurrency(planoForm.valor);
      const payload: any = {
        titulo: planoForm.titulo.trim(),
        descricao: planoForm.descricao.trim() || undefined,
        instituicaoId: plan?.instituicaoId || instituicaoIdParam || undefined,
        emendaId: planoForm.emendaId || undefined,
        valor: valorNum > 0 ? valorNum : undefined,
        status: planoForm.status,
      };

      if (isCreateMode) {
        const created = await planoService.create(payload);
        // Navigate to view mode for the newly created plan
        navigate(`/dashboard/plano/full/${created.id}?instituicaoId=${instituicaoIdParam}`, { replace: true });
      } else {
        const updated = await planoService.update(id!, payload);
        setPlan((prev: any) => ({ ...prev, ...updated }));
        setIsEditingHeader(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao salvar plano';
      setPlanErrors({ general: msg });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleValueBlur = () => {
    const raw = parseCurrency(planoForm.valor);
    setPlanoForm(f => ({ ...f, valor: formatCurrency(String(raw)) }));
  };

  // ── Meta helpers ──────────────────────────────────────────────────────────
  const reloadMetas = async () => {
    if (!id) return;
    setMetas(await metaService.listByPlano(id));
  };

  const handleCreateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaError(null);
    if (!newMeta.titulo.trim()) return setMetaError('Título é obrigatório');
    try {
      setSavingMeta(true);
      await metaService.create({ planoTrabalhoId: id!, titulo: newMeta.titulo, descricao: newMeta.descricao, valor: newMeta.valor ? Number(newMeta.valor) : undefined });
      setNewMeta(emptyMeta());
      setShowNewMeta(false);
      await reloadMetas();
    } catch (err: any) {
      setMetaError(err?.response?.data?.error || 'Erro ao criar meta');
    } finally { setSavingMeta(false); }
  };

  const handleSaveMeta = async () => {
    if (!editingMetaId) return;
    if (!editMetaForm.titulo.trim()) return setMetaError('Título é obrigatório');
    try {
      setSavingMeta(true);
      await metaService.update(editingMetaId, { planoTrabalhoId: id!, titulo: editMetaForm.titulo, descricao: editMetaForm.descricao, valor: editMetaForm.valor ? Number(editMetaForm.valor) : undefined });
      setEditingMetaId(null);
      await reloadMetas();
    } catch (err: any) {
      setMetaError(err?.response?.data?.error || 'Erro ao salvar meta');
    } finally { setSavingMeta(false); }
  };

  const handleDeleteMeta = async (metaId: string) => {
    if (!confirm('Excluir esta meta e todos os seus itens?')) return;
    try {
      await metaService.remove(metaId);
      setItemsByMeta(prev => { const n = { ...prev }; delete n[metaId]; return n; });
      setExpandedMetas(prev => { const n = new Set(prev); n.delete(metaId); return n; });
      await reloadMetas();
    } catch { setMetaError('Erro ao excluir meta'); }
  };

  // ── Item helpers ──────────────────────────────────────────────────────────
  const toggleMeta = async (metaId: string) => {
    const next = new Set(expandedMetas);
    if (next.has(metaId)) { next.delete(metaId); }
    else {
      next.add(metaId);
      if (!itemsByMeta[metaId]) {
        try {
          const items = await itemService.listByMeta(metaId);
          setItemsByMeta(prev => ({ ...prev, [metaId]: items }));
        } catch { setItemError('Erro ao carregar itens'); }
      }
    }
    setExpandedMetas(next);
  };

  const reloadItems = async (metaId: string) => {
    const items = await itemService.listByMeta(metaId);
    setItemsByMeta(prev => ({ ...prev, [metaId]: items }));
  };

  const handleCreateItem = async (metaId: string) => {
    const form = newItemByMeta[metaId];
    if (!form?.titulo?.trim()) return setItemError('Título do item é obrigatório');
    setItemError(null);
    try {
      setSavingItemMeta(metaId);
      await itemService.create({ metaId, titulo: form.titulo, descricao: form.descricao || '', valor: form.valor ? Number(form.valor) : undefined });
      setNewItemByMeta(prev => ({ ...prev, [metaId]: emptyItem() }));
      setShowNewItemFor(null);
      await reloadItems(metaId);
    } catch (err: any) {
      setItemError(err?.response?.data?.error || 'Erro ao criar item');
    } finally { setSavingItemMeta(null); }
  };

  const handleSaveItem = async (metaId: string) => {
    if (!editingItemId || !editItemForm.titulo.trim()) return setItemError('Título é obrigatório');
    try {
      await itemService.update(editingItemId, { metaId, titulo: editItemForm.titulo, descricao: editItemForm.descricao, valor: editItemForm.valor ? Number(editItemForm.valor) : undefined });
      setEditingItemId(null);
      await reloadItems(metaId);
    } catch (err: any) { setItemError(err?.response?.data?.error || 'Erro ao salvar item'); }
  };

  const handleDeleteItem = async (metaId: string, itemId: string) => {
    if (!confirm('Excluir este item?')) return;
    try { await itemService.remove(itemId); await reloadItems(metaId); }
    catch { setItemError('Erro ao excluir item'); }
  };

  // ── Prestação helpers ─────────────────────────────────────────────────────
  const loadPrestacoes = async (planoId: string) => {
    try {
      setPcLoading(true);
      setPrestacoes(await prestacaoService.listByPlano(planoId));
    } catch { setPcError('Falha ao carregar prestações'); }
    finally { setPcLoading(false); }
  };

  const handleCreatePrestacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setPcError(null);
    if (!plan?.id) return setPcError('Plano inválido');
    if (pcValor === '' || Number(pcValor) <= 0) return setPcError('Informe um valor maior que zero');
    try {
      setSavingPc(true);
      await prestacaoService.create({ planoTrabalhoId: plan.id, valorExecutado: Number(pcValor), observacoes: pcObs });
      setPcValor(''); setPcObs(''); setShowNewPc(false);
      await loadPrestacoes(plan.id);
    } catch (err: any) { setPcError(err?.response?.data?.error || 'Erro ao salvar prestação'); }
    finally { setSavingPc(false); }
  };

  const handleSavePc = async (pcId: string) => {
    if (editPcValor === '' || Number(editPcValor) <= 0) return setPcError('Informe um valor maior que zero');
    try {
      setEditPcSaving(true);
      await prestacaoService.update(pcId, { planoTrabalhoId: plan.id, valorExecutado: Number(editPcValor), observacoes: editPcObs });
      await loadPrestacoes(plan.id);
      setEditingPcId(null);
    } catch (err: any) { setPcError(err?.response?.data?.error || 'Erro ao atualizar'); }
    finally { setEditPcSaving(false); }
  };

  const handleDeletePc = async (pcId: string) => {
    if (!confirm('Confirma exclusão?')) return;
    try { await prestacaoService.remove(pcId); await loadPrestacoes(plan.id); }
    catch { setPcError('Erro ao excluir'); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalMetas = metas.reduce((s, m) => s + (m.valor || 0), 0);
  const totalPrestacoes = prestacoes.reduce((s, p) => s + (p.valorExecutado || 0), 0);
  const statusColor = STATUS_COLOR[(plan?.status) || planoForm.status] || STATUS_COLOR.RASCUNHO;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Carregando...</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // CREATE MODE – full-form card
  // ══════════════════════════════════════════════════════════════════════════
  if (isCreateMode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate(backUrl)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Voltar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Novo Plano de Trabalho</h1>
            {instituicaoNome && <p className="text-sm text-gray-500 mt-0.5">{instituicaoNome}</p>}
          </div>
        </div>

        <form onSubmit={handleSavePlan} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título <span className="text-red-500">*</span></label>
            <input type="text" value={planoForm.titulo}
              onChange={e => setPlanoForm(f => ({ ...f, titulo: e.target.value }))}
              maxLength={200} placeholder="Ex: Plano de Custeio Administrativo 2025"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${planErrors.titulo ? 'border-red-400' : 'border-gray-300'}`} />
            {planErrors.titulo && <p className="text-xs text-red-500 mt-1">{planErrors.titulo}</p>}
            <p className="text-xs text-gray-400 mt-1">{planoForm.titulo.length}/200 caracteres</p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={planoForm.descricao}
              onChange={e => setPlanoForm(f => ({ ...f, descricao: e.target.value }))}
              rows={3} placeholder="Descreva o objetivo e escopo do plano..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Emenda vinculada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emenda Vinculada</label>
            <select value={planoForm.emendaId}
              onChange={e => setPlanoForm(f => ({ ...f, emendaId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Nenhuma (plano sem emenda) —</option>
              {emendas.map((em: any) => (
                <option key={em.id} value={em.id}>
                  {em.officialCode || em.id}
                  {em.value != null ? ` — ${currencyFmt.format(Number(em.value))}` : ''}
                  {em.description ? ` — ${String(em.description).substring(0, 50)}...` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Cada emenda pode ter apenas 1 plano.</p>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Plano</label>
            <input type="text" value={planoForm.valor}
              onChange={e => setPlanoForm(f => ({ ...f, valor: e.target.value }))}
              onBlur={handleValueBlur} placeholder="R$ 0,00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={planoForm.status}
              onChange={e => setPlanoForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
            </select>
          </div>

          {planErrors.general && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{planErrors.general}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => navigate(backUrl)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={savingPlan}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {savingPlan ? 'Criando...' : 'Criar Plano e Continuar →'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW/EDIT MODE – unified page
  // ══════════════════════════════════════════════════════════════════════════
  if (!plan) return <div className="p-6 text-gray-500">Plano não encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">

      {/* ── HEADER CARD ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate(backUrl)}
            className="text-blue-100 hover:text-white text-sm flex items-center gap-1 transition-colors">
            ← Voltar
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
              {STATUS_LABEL[plan.status] || plan.status}
            </span>
            {!isEditingHeader && (
              <button onClick={() => setIsEditingHeader(true)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-medium transition-colors">
                ✏️ Editar
              </button>
            )}
          </div>
        </div>

        {/* Plan info – VIEW sub-mode */}
        {!isEditingHeader && (
          <div className="p-6">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Plano de Trabalho</p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{plan.titulo}</h1>
            {plan.descricao && <p className="text-gray-500 text-sm mb-1">{plan.descricao}</p>}
            {instituicaoNome && <p className="text-xs text-gray-400">{instituicaoNome}</p>}

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Valor do Plano', value: plan.valor ? currencyFmt.format(plan.valor) : '—', color: 'blue' },
                { label: 'Total Metas', value: currencyFmt.format(totalMetas), color: 'purple' },
                { label: 'Total Executado', value: currencyFmt.format(totalPrestacoes), color: 'emerald' },
                { label: 'Metas / Prestações', value: `${metas.length} / ${prestacoes.length}`, color: 'gray' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-${color}-50 rounded-xl p-3`}>
                  <p className={`text-xs text-${color}-500 font-medium uppercase tracking-wide`}>{label}</p>
                  <p className={`text-sm font-bold text-${color}-700 mt-1`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan info – EDIT sub-mode */}
        {isEditingHeader && (
          <form onSubmit={handleSavePlan} className="p-6 space-y-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Editar Dados do Plano</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Título */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Título <span className="text-red-500">*</span></label>
                <input type="text" value={planoForm.titulo}
                  onChange={e => setPlanoForm(f => ({ ...f, titulo: e.target.value }))}
                  maxLength={200}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${planErrors.titulo ? 'border-red-400' : 'border-gray-300'}`} />
                {planErrors.titulo && <p className="text-xs text-red-500 mt-1">{planErrors.titulo}</p>}
              </div>

              {/* Descrição */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                <textarea value={planoForm.descricao}
                  onChange={e => setPlanoForm(f => ({ ...f, descricao: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Emenda */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emenda Vinculada</label>
                <select value={planoForm.emendaId}
                  onChange={e => setPlanoForm(f => ({ ...f, emendaId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Nenhuma —</option>
                  {emendas.map((em: any) => (
                    <option key={em.id} value={em.id}>
                      {em.officialCode || em.id}{em.value != null ? ` — ${currencyFmt.format(Number(em.value))}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor do Plano</label>
                <input type="text" value={planoForm.valor}
                  onChange={e => setPlanoForm(f => ({ ...f, valor: e.target.value }))}
                  onBlur={handleValueBlur}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={planoForm.status}
                  onChange={e => setPlanoForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
                </select>
              </div>
            </div>

            {planErrors.general && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{planErrors.general}</p>}

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={savingPlan}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {savingPlan ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button type="button" onClick={() => { setIsEditingHeader(false); setPlanErrors({}); }}
                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── TABS CARD ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {([['metas', `Metas (${metas.length})`], ['prestacoes', `Prestações de Conta (${prestacoes.length})`]] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: METAS ──────────────────────────────────────────────────── */}
        {activeTab === 'metas' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Metas do Plano</h2>
              <button onClick={() => { setShowNewMeta(v => !v); setMetaError(null); setNewMeta(emptyMeta()); }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                + Nova Meta
              </button>
            </div>

            {showNewMeta && (
              <form onSubmit={handleCreateMeta} className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-semibold text-blue-700 mb-3">Nova Meta</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">Título *</label>
                    <input value={newMeta.titulo} onChange={e => setNewMeta(p => ({ ...p, titulo: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Ex: Aquisição de equipamentos" autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Descrição</label>
                    <input value={newMeta.descricao} onChange={e => setNewMeta(p => ({ ...p, descricao: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" min="0" value={newMeta.valor}
                      onChange={e => setNewMeta(p => ({ ...p, valor: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="0,00" />
                  </div>
                </div>
                {metaError && <p className="text-red-600 text-xs mt-2">{metaError}</p>}
                <div className="flex gap-2 mt-3">
                  <button type="submit" disabled={savingMeta}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {savingMeta ? 'Salvando...' : 'Salvar Meta'}
                  </button>
                  <button type="button" onClick={() => setShowNewMeta(false)}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {metas.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">Nenhuma meta cadastrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metas.map((m, idx) => (
                  <div key={m.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>

                      {editingMetaId === m.id ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input value={editMetaForm.titulo} onChange={e => setEditMetaForm(p => ({ ...p, titulo: e.target.value }))}
                            className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Título" autoFocus />
                          <input value={editMetaForm.descricao} onChange={e => setEditMetaForm(p => ({ ...p, descricao: e.target.value }))}
                            className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Descrição" />
                          <input type="number" step="0.01" value={editMetaForm.valor} onChange={e => setEditMetaForm(p => ({ ...p, valor: e.target.value }))}
                            className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Valor" />
                        </div>
                      ) : (
                        <div className="flex-1 cursor-pointer min-w-0" onClick={() => toggleMeta(m.id!)}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm">{m.titulo}</span>
                            {m.valor != null && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {currencyFmt.format(m.valor)}
                              </span>
                            )}
                            {(itemsByMeta[m.id!]?.length ?? 0) > 0 && (
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                                {itemsByMeta[m.id!].length} {itemsByMeta[m.id!].length === 1 ? 'item' : 'itens'}
                              </span>
                            )}
                          </div>
                          {m.descricao && <p className="text-xs text-gray-500 mt-0.5 truncate">{m.descricao}</p>}
                        </div>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        {editingMetaId === m.id ? (
                          <>
                            <button onClick={handleSaveMeta} disabled={savingMeta}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50">
                              {savingMeta ? '...' : 'Salvar'}
                            </button>
                            <button onClick={() => setEditingMetaId(null)}
                              className="px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-white">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => toggleMeta(m.id!)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-base"
                              title={expandedMetas.has(m.id!) ? 'Recolher' : 'Expandir'}>
                              {expandedMetas.has(m.id!) ? '▾' : '▸'}
                            </button>
                            <button onClick={() => { setEditingMetaId(m.id!); setEditMetaForm({ titulo: m.titulo || '', descricao: m.descricao || '', valor: m.valor?.toString() || '' }); setMetaError(null); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors" title="Editar">✏️</button>
                            <button onClick={() => handleDeleteMeta(m.id!)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Excluir">🗑️</button>
                          </>
                        )}
                      </div>
                    </div>

                    {expandedMetas.has(m.id!) && (
                      <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
                        {itemError && <p className="text-red-600 text-xs mb-2">{itemError}</p>}
                        {(itemsByMeta[m.id!] || []).length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            {(itemsByMeta[m.id!] || []).map((item, iIdx) => (
                              <div key={item.id} className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="text-xs text-gray-400 w-5 text-center shrink-0">{iIdx + 1}</span>
                                {editingItemId === item.id ? (
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <input value={editItemForm.titulo} onChange={e => setEditItemForm(p => ({ ...p, titulo: e.target.value }))}
                                      className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" autoFocus />
                                    <input value={editItemForm.descricao} onChange={e => setEditItemForm(p => ({ ...p, descricao: e.target.value }))}
                                      className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                    <input type="number" step="0.01" value={editItemForm.valor} onChange={e => setEditItemForm(p => ({ ...p, valor: e.target.value }))}
                                      className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                  </div>
                                ) : (
                                  <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="text-sm text-gray-800 font-medium">{item.titulo}</span>
                                    {item.descricao && <span className="text-xs text-gray-500">{item.descricao}</span>}
                                    {item.valor != null && (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium ml-auto shrink-0">
                                        {currencyFmt.format(item.valor)}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="flex gap-1 shrink-0">
                                  {editingItemId === item.id ? (
                                    <>
                                      <button onClick={() => handleSaveItem(m.id!)} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">Salvar</button>
                                      <button onClick={() => setEditingItemId(null)} className="px-2 py-1 border rounded text-xs">Cancelar</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => { setEditingItemId(item.id!); setEditItemForm({ titulo: item.titulo || '', descricao: item.descricao || '', valor: item.valor?.toString() || '' }); setItemError(null); }}
                                        className="p-1 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 text-xs" title="Editar">✏️</button>
                                      <button onClick={() => handleDeleteItem(m.id!, item.id!)}
                                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs" title="Excluir">🗑️</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {showNewItemFor === m.id ? (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-700 mb-2">Novo Item</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input value={newItemByMeta[m.id!]?.titulo || ''}
                                onChange={e => setNewItemByMeta(prev => ({ ...prev, [m.id!]: { ...emptyItem(), ...prev[m.id!], titulo: e.target.value } }))}
                                className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Título *" autoFocus />
                              <input value={newItemByMeta[m.id!]?.descricao || ''}
                                onChange={e => setNewItemByMeta(prev => ({ ...prev, [m.id!]: { ...emptyItem(), ...prev[m.id!], descricao: e.target.value } }))}
                                className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Descrição" />
                              <input type="number" step="0.01" min="0" value={newItemByMeta[m.id!]?.valor || ''}
                                onChange={e => setNewItemByMeta(prev => ({ ...prev, [m.id!]: { ...emptyItem(), ...prev[m.id!], valor: e.target.value } }))}
                                className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Valor (R$)" />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleCreateItem(m.id!)} disabled={savingItemMeta === m.id}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                                {savingItemMeta === m.id ? 'Salvando...' : 'Adicionar'}
                              </button>
                              <button onClick={() => setShowNewItemFor(null)}
                                className="px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-white">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setShowNewItemFor(m.id!); setItemError(null); }}
                            className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            + Adicionar item
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PRESTAÇÕES ─────────────────────────────────────────────── */}
        {activeTab === 'prestacoes' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Prestações de Conta</h2>
                {prestacoes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">Total executado: <strong>{currencyFmt.format(totalPrestacoes)}</strong></p>
                )}
              </div>
              <button onClick={() => { setShowNewPc(v => !v); setPcError(null); setPcValor(''); setPcObs(''); }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                + Nova Prestação
              </button>
            </div>

            {showNewPc && (
              <form onSubmit={handleCreatePrestacao} className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm font-semibold text-emerald-700 mb-3">Nova Prestação de Conta</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Valor Executado (R$) *</label>
                    <input type="number" step="0.01" min="0" value={pcValor as any}
                      onChange={e => setPcValor(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Observações</label>
                    <input type="text" value={pcObs} onChange={e => setPcObs(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Opcional" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={savingPc}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                      {savingPc ? 'Salvando...' : 'Registrar'}
                    </button>
                    <button type="button" onClick={() => setShowNewPc(false)}
                      className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      Cancelar
                    </button>
                  </div>
                </div>
                {pcError && <p className="text-red-600 text-xs mt-2">{pcError}</p>}
              </form>
            )}

            {pcLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
            ) : prestacoes.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-sm">Nenhuma prestação registrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {prestacoes.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {editingPcId === p.id ? (
                      <div className="flex flex-1 gap-2 flex-wrap">
                        <input type="number" step="0.01" min="0" value={editPcValor as any}
                          onChange={e => setEditPcValor(e.target.value === '' ? '' : Number(e.target.value))}
                          className="border rounded-lg px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <input type="text" value={editPcObs} onChange={e => setEditPcObs(e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Observações" />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-800">{currencyFmt.format(p.valorExecutado || 0)}</span>
                        {p.observacoes && <span className="text-sm text-gray-500 ml-3">{p.observacoes}</span>}
                        {p.createTime && (
                          <span className="text-xs text-gray-400 ml-3">
                            {new Date(p.createTime).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-1 shrink-0">
                      {editingPcId === p.id ? (
                        <>
                          <button onClick={() => handleSavePc(p.id!)} disabled={editPcSaving}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                            {editPcSaving ? '...' : 'Salvar'}
                          </button>
                          <button onClick={() => setEditingPcId(null)}
                            className="px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingPcId(p.id!); setEditPcValor(p.valorExecutado ?? ''); setEditPcObs(p.observacoes || ''); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors" title="Editar">✏️</button>
                          <button onClick={() => handleDeletePc(p.id!)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Excluir">🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pcError && !showNewPc && <p className="text-red-600 text-sm mt-3">{pcError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanoFullPage;
