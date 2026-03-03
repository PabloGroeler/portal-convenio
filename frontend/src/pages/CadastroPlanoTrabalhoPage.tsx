import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import planoService from '../services/planoTrabalhoService';
import emendaService from '../services/emendaService';
import institutionService from '../services/institutionService';
import { formatCurrency, parseCurrency } from '../utils/formatters';

interface PlanoForm {
  titulo: string;
  descricao: string;
  emendaId: string;
  valor: string;
  status: string;
}

const STATUS_OPTIONS = ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'];

const CadastroPlanoTrabalhoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const instituicaoId = searchParams.get('instituicaoId') || '';
  const isEditMode = !!editId;

  const [form, setForm] = useState<PlanoForm>({
    titulo: '',
    descricao: '',
    emendaId: '',
    valor: 'R$ 0,00',
    status: 'RASCUNHO',
  });

  const [emendas, setEmendas] = useState<any[]>([]);
  const [instituicaoNome, setInstituicaoNome] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load emendas for the institution and institution name
  useEffect(() => {
    if (instituicaoId) {
      loadEmendas();
      loadInstituicao();
    }
    if (editId) {
      loadPlano();
    }
  }, [editId, instituicaoId]);

  const loadInstituicao = async () => {
    try {
      const inst = await institutionService.getByInstitutionId(instituicaoId);
      setInstituicaoNome(inst?.razaoSocial || inst?.nomeFantasia || instituicaoId);
    } catch {
      setInstituicaoNome(instituicaoId);
    }
  };

  const loadEmendas = async () => {
    try {
      const all = await emendaService.listWithDetails();
      // Filter emendas belonging to this institution
      setEmendas(all.filter((e: any) => e.institutionId === instituicaoId || e.institution?.id === instituicaoId));
    } catch (err) {
      console.error('Erro ao carregar emendas:', err);
    }
  };

  const loadPlano = async () => {
    try {
      setLoading(true);
      const p = await planoService.get(editId!);
      setForm({
        titulo: p.titulo || '',
        descricao: p.descricao || '',
        emendaId: p.emendaId || '',
        valor: p.valor != null ? formatCurrency(String(p.valor)) : 'R$ 0,00',
        status: p.status || 'RASCUNHO',
      });
    } catch (err) {
      console.error('Erro ao carregar plano:', err);
      alert('Erro ao carregar plano');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (form.titulo.trim().length < 5) e.titulo = 'Título deve ter ao menos 5 caracteres';
    if (!instituicaoId) e.instituicao = 'Instituição é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const valorNum = parseCurrency(form.valor);
      const payload = {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || undefined,
        instituicaoId,
        emendaId: form.emendaId || undefined,
        valor: valorNum > 0 ? valorNum : undefined,
        status: form.status,
      };

      if (isEditMode) {
        await planoService.update(editId!, payload as any);
        alert('Plano atualizado com sucesso!');
      } else {
        await planoService.create(payload as any);
        alert('Plano criado com sucesso!');
      }

      // Navigate back to the planos dashboard
      navigate(`/dashboard/planos`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao salvar plano';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleValueBlur = () => {
    const raw = parseCurrency(form.valor);
    setForm(f => ({ ...f, valor: formatCurrency(String(raw)) }));
  };

  const handleValueChange = (v: string) => {
    setForm(f => ({ ...f, valor: v }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/planos`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          title="Voltar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar Plano de Trabalho' : 'Novo Plano de Trabalho'}
          </h1>
          {instituicaoNome && (
            <p className="text-sm text-gray-500 mt-0.5">{instituicaoNome}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            maxLength={200}
            placeholder="Ex: Plano de Custeio Administrativo 2025"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.titulo ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo}</p>}
          <p className="text-xs text-gray-400 mt-1">{form.titulo.length}/200 caracteres</p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            rows={4}
            placeholder="Descreva o objetivo e escopo do plano de trabalho..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Emenda vinculada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emenda Vinculada</label>
          <select
            value={form.emendaId}
            onChange={e => setForm(f => ({ ...f, emendaId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Nenhuma (plano sem emenda) —</option>
            {emendas.map((em: any) => (
              <option key={em.id} value={em.id}>
                {em.officialCode || em.id}
                {em.value != null ? ` — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(em.value))}` : ''}
                {em.description ? ` — ${em.description.substring(0, 60)}...` : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Cada emenda pode ter apenas 1 plano. Emendas já vinculadas não aparecem na lista.
          </p>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Plano</label>
          <input
            type="text"
            value={form.valor}
            onChange={e => handleValueChange(e.target.value)}
            onBlur={handleValueBlur}
            placeholder="R$ 0,00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Se vinculado a uma emenda, o valor da emenda será usado como referência.</p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/planos`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Criar Plano'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroPlanoTrabalhoPage;
