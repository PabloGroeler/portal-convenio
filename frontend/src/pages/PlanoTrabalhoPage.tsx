import React, { useEffect, useState } from 'react';
import planoService from '../services/planoTrabalhoService';
import type { PlanoTrabalho } from '../types/planoTrabalho.types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMinhasInstituicoesDetalhadas } from '../services/userService';
import type { InstituicaoDetalhada } from '../types/user.types';

const STATUS_COLOR: Record<string, string> = {
  APROVADO:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  REPROVADO: 'bg-red-100 text-red-800 border-red-200',
  ENVIADO:   'bg-blue-100 text-blue-800 border-blue-200',
  RASCUNHO:  'bg-gray-100 text-gray-600 border-gray-200',
};
const STATUS_LABEL: Record<string, string> = {
  APROVADO:  '✅ Aprovado',
  REPROVADO: '❌ Reprovado',
  ENVIADO:   '📤 Enviado',
  RASCUNHO:  '📝 Rascunho',
};

const ROLE_FLOW: Record<string, { title: string; steps: { label: string; detail: string; status?: string }[]; planStatuses?: string[] }> = {
  ORCAMENTO: {
    title: 'Fluxo para Orçamento',
    steps: [
      { label: 'Admissibilidade', detail: 'Puxar "Em análise de admissibilidade", aprovar ou devolver ao legislativo', status: 'Em análise de admissibilidade → Admissibilidade aprovada/Devolvida ao legislativo' },
      { label: 'Demanda', detail: 'Encaminhar para análise de demanda (Secretaria) ou devolver por incompatibilidade', status: 'Em análise de demanda → Análise de demanda aprovada/Devolvida por incompatibilidade de demanda' },
      { label: 'Retornos', detail: 'Tratar devoluções de convênios/documental quando houver execução Indireta', status: 'Devolvida por inviabilidade documental' },
    ],
    planStatuses: ['ENVIADO', 'RASCUNHO', 'REPROVADO'],
  },
  SECRETARIA: {
    title: 'Fluxo para Secretaria',
    steps: [
      { label: 'Demanda', detail: 'Receber pós-admissibilidade (Direta) e avaliar viabilidade; aprovar ou devolver', status: 'Em análise de demanda → Análise de demanda aprovada/Devolvida por incompatibilidade de demanda' },
      { label: 'Execução Direta', detail: 'Para emendas Diretas, seguir para Iniciado/Execução após demanda aprovada', status: 'Análise de demanda aprovada → Iniciado/Em execução' },
      { label: 'Pendências', detail: 'Registrar observações e reenviar ao proponente/operador quando necessário', status: 'Devolvido (genérico)' },
    ],
    planStatuses: ['ENVIADO', 'RASCUNHO'],
  },
  CONVENIOS: {
    title: 'Fluxo para Convênios (Indireta)',
    steps: [
      { label: 'Documental', detail: 'Abrir análise documental apenas se tipo = Indireta; aprovar ou devolver', status: 'Em análise documental → Análise documental aprovada/Devolvida por inviabilidade documental' },
      { label: 'Formalização', detail: 'Após documental aprovada, formalizar termo/empenho e iniciar execução', status: 'Iniciado → Em execução → Concluído' },
    ],
    planStatuses: ['ENVIADO', 'APROVADO', 'REPROVADO'],
  },
  JURIDICO: {
    title: 'Fluxo para Jurídico',
    steps: [
      { label: 'Parecer', detail: 'Emitir parecer em minutas/termos quando acionado por Convênios ou Secretaria', status: 'Observação no histórico; status não muda diretamente' },
      { label: 'Ajustes', detail: 'Registrar exigências e devolver ao setor demandante', status: 'Devolvido (genérico)' },
    ],
    planStatuses: ['ENVIADO', 'REPROVADO'],
  },
  OPERADOR: {
    title: 'Fluxo para Operador/Proponente',
    steps: [
      { label: 'Detalhamento', detail: 'Enviar formulário e anexos quando solicitado', status: 'Iniciado (AGUARDAR_DETALHAMENTO) → Em análise de demanda/documental' },
      { label: 'Pendências', detail: 'Corrigir itens devolvidos por Orçamento, Secretaria ou Convênios', status: 'Devolvido (genérico)' },
      { label: 'Execução', detail: 'Acompanhar execução e prestação de contas quando aplicável', status: 'Em execução → Concluído' },
    ],
    planStatuses: ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'],
  },
};

const PlanoTrabalhoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [planos, setPlanos] = useState<PlanoTrabalho[]>([]);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [showReprovarModal, setShowReprovarModal] = useState(false);
  const [selectedPlanoId, setSelectedPlanoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const isGestorOrAdmin = user?.role === 'GESTOR' || user?.role === 'ADMIN';
  const roleFlow = (user?.role && ROLE_FLOW[user.role]) ? ROLE_FLOW[user.role] : null;
  const recommendedStatuses = roleFlow?.planStatuses ?? ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'];
  const planosFiltrados = filterStatus
    ? planos.filter(p => (p.status || 'RASCUNHO') === filterStatus)
    : planos;

  const fetchPlanos = async () => {
    const gestorOrAdmin = user?.role === 'GESTOR' || user?.role === 'ADMIN';
    try {
      setLoading(true);
      setLoadError(false);

      const [allPlanos, insts] = await Promise.all([
        planoService.listAll().catch(() => [] as PlanoTrabalho[]),
        getMinhasInstituicoesDetalhadas().catch(() => [] as InstituicaoDetalhada[]),
      ]);

      setInstituicoes(insts);

      if (gestorOrAdmin) {
        setPlanos(allPlanos);
      } else {
        const instIds = new Set(insts.map(i => i.id));
        setPlanos(allPlanos.filter(p => !p.instituicaoId || instIds.has(p.instituicaoId)));
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return; // wait for auth to resolve
    fetchPlanos();
  }, [user?.role]);

  const handleNovoPlan = () => {
    const instId = instituicoes.length === 1 ? `?instituicaoId=${instituicoes[0].id}` : '';
    navigate(`/dashboard/novo-plano${instId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos de Trabalho</h1>
          <p className="text-sm text-gray-500 mt-1">Planos vinculados às emendas das suas instituições</p>
        </div>
        <button
          type="button"
          onClick={handleNovoPlan}
          className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Novo Plano
        </button>
      </div>

      {roleFlow && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-indigo-600 mt-0.5">🧭</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-900">{roleFlow.title}</p>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                {roleFlow.steps.map((s, idx) => (
                  <div key={idx} className="bg-white border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900 shadow-sm">
                    <div className="font-semibold text-indigo-700">{s.label}</div>
                    <div className="text-indigo-900 mt-1 leading-snug">{s.detail}</div>
                    {s.status && <div className="mt-1 text-[11px] text-indigo-600">{s.status}</div>}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs items-center">
                <span className="text-indigo-700 font-semibold">Filtrar planos por status:</span>
                <button type="button" onClick={() => setFilterStatus(null)} className={`px-2 py-1 rounded border text-[11px] ${filterStatus === null ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-200'}`}>
                  Todos
                </button>
                {recommendedStatuses.map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-2 py-1 rounded border text-[11px] ${filterStatus === st ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-200'}`}
                  >
                    {STATUS_LABEL[st] ?? st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="ml-3 text-gray-500">Carregando planos...</span>
        </div>

      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-red-800 font-semibold">Erro ao carregar planos</p>
          <p className="text-red-600 text-sm mt-1 mb-4">Verifique sua conexão e tente novamente.</p>
          <button
            type="button"
            onClick={fetchPlanos}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>

      ) : !isGestorOrAdmin && instituicoes.length === 0 ? (
        /* User has no linked institution — can't load planos */
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-10 text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <p className="text-amber-800 font-semibold">Nenhuma instituição vinculada</p>
          <p className="text-amber-700 text-sm mt-1 mb-4">
            Para criar planos de trabalho é necessário ter uma instituição vinculada à sua conta.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/instituicoes')}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
          >
            Vincular Instituição
          </button>
        </div>

      ) : planos.length === 0 ? (
        /* Has institutions but no planos yet */
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-700 font-semibold text-lg">Nenhum plano de trabalho cadastrado</p>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Os planos de trabalho são vinculados às emendas das suas instituições.
          </p>
          <button
            type="button"
            onClick={handleNovoPlan}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Criar Primeiro Plano de Trabalho
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-700 px-5 py-3">Título</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Emenda</th>
                <th className="text-right font-semibold text-gray-700 px-4 py-3">Valor</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3">Status</th>
                <th className="text-right font-semibold text-gray-700 px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {planosFiltrados.map(p => {
                const status = p.status || 'RASCUNHO';
                const valor = p.emendaValor ?? p.valor;
                return (
                  <tr key={p.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{p.titulo}</div>
                      {p.descricao && (
                        <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{p.descricao}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.emendaCodigo ? (
                        <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                          {p.emendaCodigo}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 text-xs">
                      {valor != null
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor))
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[status] ?? STATUS_COLOR.RASCUNHO}`}>
                        {STATUS_LABEL[status] ?? status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2 justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/plano/full/${p.id}`)}
                          className="px-3 py-1.5 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          Ver
                        </button>
                        {status !== 'APROVADO' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/editar-plano?editId=${p.id}&instituicaoId=${p.instituicaoId ?? ''}`)}
                            className="px-3 py-1.5 text-xs rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium"
                          >
                            Editar
                          </button>
                        )}
                        {isGestorOrAdmin && status === 'ENVIADO' && (
                          <>
                            <button
                              type="button"
                              onClick={() => { setSelectedPlanoId(p.id); setMotivo(''); setShowAprovarModal(true); }}
                              className="px-3 py-1.5 text-xs rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium"
                            >
                              Aprovar
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSelectedPlanoId(p.id); setMotivo(''); setShowReprovarModal(true); }}
                              className="px-3 py-1.5 text-xs rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-medium"
                            >
                              Reprovar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Aprovar modal */}
      {showAprovarModal && selectedPlanoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Aprovar Plano de Trabalho</h3>
            <textarea
              className="w-full border rounded-lg p-2 text-sm"
              rows={4}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Motivo da aprovação (obrigatório)"
            />
            <div className="flex justify-end mt-4 gap-3">
              <button type="button" className="px-4 py-2 border rounded-lg text-sm" onClick={() => setShowAprovarModal(false)}>Cancelar</button>
              <button
                type="button"
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
                onClick={async () => {
                  if (!motivo.trim()) { alert('Informe o motivo'); return; }
                  try { setSaving(true); await planoService.aprovar(selectedPlanoId, motivo); setShowAprovarModal(false); fetchPlanos(); }
                  catch { alert('Erro ao aprovar'); } finally { setSaving(false); }
                }}
              >
                {saving ? 'Aprovando...' : 'Aprovar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reprovar modal */}
      {showReprovarModal && selectedPlanoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Reprovar Plano de Trabalho</h3>
            <textarea
              className="w-full border rounded-lg p-2 text-sm"
              rows={4}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Motivo da reprovação (obrigatório)"
            />
            <div className="flex justify-end mt-4 gap-3">
              <button type="button" className="px-4 py-2 border rounded-lg text-sm" onClick={() => setShowReprovarModal(false)}>Cancelar</button>
              <button
                type="button"
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                onClick={async () => {
                  if (!motivo.trim()) { alert('Informe o motivo'); return; }
                  try { setSaving(true); await planoService.reprovar(selectedPlanoId, motivo); setShowReprovarModal(false); fetchPlanos(); }
                  catch { alert('Erro ao reprovar'); } finally { setSaving(false); }
                }}
              >
                {saving ? 'Reprovando...' : 'Reprovar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoTrabalhoPage;
