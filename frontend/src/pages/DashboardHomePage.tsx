import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMinhasInstituicoesDetalhadas, getMinhasEmendas } from '../services/userService';
import type { InstituicaoDetalhada, EmendaResumida } from '../types/user.types';
import planoService from '../services/planoTrabalhoService';
import type { PlanoTrabalho } from '../types/planoTrabalho.types';
import emendaService from '../services/emendaService';

const ROLE_CONFIG: Record<string, {
  label: string;
  corBg: string; corBorder: string; corText: string;
  steps: { icon: string; label: string }[];
  statusPendentes: string[];
}> = {
  ORCAMENTO: {
    label: 'Orçamento',
    corBg: 'bg-amber-50', corBorder: 'border-amber-200', corText: 'text-amber-900',
    steps: [
      { icon: '🔍', label: 'Analisar admissibilidade' },
      { icon: '✅', label: 'Aprovar / devolver ao legislativo' },
      { icon: '↩️', label: 'Tratar devoluções (Indireta)' },
    ],
    statusPendentes: ['Recebido', 'Em análise de admissibilidade', 'Devolvida por inviabilidade documental'],
  },
  SECRETARIA: {
    label: 'Secretaria',
    corBg: 'bg-teal-50', corBorder: 'border-teal-200', corText: 'text-teal-900',
    steps: [
      { icon: '🔍', label: 'Analisar demanda' },
      { icon: '✅', label: 'Aprovar / devolver por incompatibilidade' },
      { icon: '▶️', label: 'Acompanhar execução direta' },
    ],
    statusPendentes: ['Admissibilidade aprovada', 'Em análise de demanda'],
  },
  CONVENIOS: {
    label: 'Convênios',
    corBg: 'bg-violet-50', corBorder: 'border-violet-200', corText: 'text-violet-900',
    steps: [
      { icon: '📋', label: 'Analisar documentação (Indireta)' },
      { icon: '✅', label: 'Aprovar / devolver documental' },
      { icon: '📄', label: 'Formalizar termo/empenho' },
    ],
    statusPendentes: ['Análise de demanda aprovada', 'Em análise documental', 'Análise documental aprovada'],
  },
  JURIDICO: {
    label: 'Jurídico',
    corBg: 'bg-blue-50', corBorder: 'border-blue-200', corText: 'text-blue-900',
    steps: [
      { icon: '⚖️', label: 'Emitir parecer em minutas/termos' },
      { icon: '↩️', label: 'Registrar exigências e devolver' },
    ],
    statusPendentes: ['Análise documental aprovada', 'Iniciado', 'Em execução'],
  },
  OPERADOR: {
    label: 'Operador',
    corBg: 'bg-indigo-50', corBorder: 'border-indigo-200', corText: 'text-indigo-900',
    steps: [
      { icon: '📤', label: 'Enviar detalhamento e anexos' },
      { icon: '🔧', label: 'Corrigir pendências devolvidas' },
      { icon: '📊', label: 'Acompanhar execução' },
    ],
    statusPendentes: ['Iniciado', 'Devolvido', 'Em execução'],
  },
  GESTOR: {
    label: 'Gestor',
    corBg: 'bg-gray-50', corBorder: 'border-gray-200', corText: 'text-gray-900',
    steps: [
      { icon: '👁️', label: 'Monitorar todas as emendas' },
      { icon: '✅', label: 'Aprovar planos de trabalho' },
    ],
    statusPendentes: [],
  },
  ADMIN: {
    label: 'Administrador',
    corBg: 'bg-rose-50', corBorder: 'border-rose-200', corText: 'text-rose-900',
    steps: [],
    statusPendentes: [],
  },
};

const STATUS_BADGE: Record<string, string> = {
  'Recebido':                                   'bg-blue-100 text-blue-800',
  'Em análise de admissibilidade':              'bg-amber-100 text-amber-800',
  'Admissibilidade aprovada':                   'bg-emerald-100 text-emerald-800',
  'Devolvida ao legislativo':                   'bg-red-100 text-red-800',
  'Em análise de demanda':                      'bg-teal-100 text-teal-800',
  'Análise de demanda aprovada':                'bg-emerald-100 text-emerald-800',
  'Devolvida por incompatibilidade de demanda': 'bg-red-100 text-red-800',
  'Em análise documental':                      'bg-violet-100 text-violet-800',
  'Análise documental aprovada':                'bg-emerald-100 text-emerald-800',
  'Devolvida por inviabilidade documental':     'bg-red-100 text-red-800',
  'Em execução':                                'bg-indigo-100 text-indigo-800',
  'Concluído':                                  'bg-emerald-100 text-emerald-800',
  'Devolvido':                                  'bg-red-100 text-red-800',
};

const DashboardHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = String(user?.role ?? '').toUpperCase();
  const roleConfig = ROLE_CONFIG[role];
  const isAdmin      = role === 'ADMIN';
  const isGestor     = role === 'GESTOR';
  const isOperador   = role === 'OPERADOR';
  // Perfis que só atuam no fluxo — não gerenciam OSCs/planos
  const isWorkflow   = ['ORCAMENTO', 'SECRETARIA', 'CONVENIOS', 'JURIDICO'].includes(role);

  const [loading, setLoading]               = useState(true);
  const [todasEmendas, setTodasEmendas]     = useState<any[]>([]);
  const [emendas, setEmendas]               = useState<EmendaResumida[]>([]);
  const [instituicoes, setInstituicoes]     = useState<InstituicaoDetalhada[]>([]);
  const [planos, setPlanos]                 = useState<PlanoTrabalho[]>([]);
  const [hasInstituicoes, setHasInstituicoes] = useState(false);
  const [instOpen, setInstOpen]             = useState(true);
  const [emendaOpen, setEmendaOpen]         = useState(true);
  const [planosOpen, setPlanosOpen]         = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      try {
        // Todos os perfis carregam lista completa de emendas (para o painel de workflow)
        const all = await emendaService.listWithDetails().catch(() => []);
        setTodasEmendas(all);

        if (isAdmin || isGestor) {
          const [insts, allPlanos] = await Promise.all([
            getMinhasInstituicoesDetalhadas().catch(() => [] as InstituicaoDetalhada[]),
            planoService.listAll().catch(() => [] as PlanoTrabalho[]),
          ]);
          setInstituicoes(insts);
          setHasInstituicoes(insts.length > 0);
          setPlanos(allPlanos);
          if (insts.length > 0) {
            const em = await getMinhasEmendas().catch(() => [] as EmendaResumida[]);
            setEmendas(em);
          }
        } else if (isOperador) {
          const [insts, allPlanos] = await Promise.all([
            getMinhasInstituicoesDetalhadas().catch(() => [] as InstituicaoDetalhada[]),
            planoService.listAll().catch(() => [] as PlanoTrabalho[]),
          ]);
          setInstituicoes(insts);
          setHasInstituicoes(insts.length > 0);
          if (insts.length > 0) {
            const ids = new Set(insts.map(i => i.id));
            setPlanos(allPlanos.filter(p => !p.instituicaoId || ids.has(p.instituicaoId)));
            const em = await getMinhasEmendas().catch(() => [] as EmendaResumida[]);
            setEmendas(em);
          }
        }
        // isWorkflow: não precisa de instituições nem planos
      } catch {
        setHasInstituicoes(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Emendas filtradas pelo perfil atual
  const pendentes = roleConfig?.statusPendentes.length
    ? todasEmendas.filter(e => roleConfig.statusPendentes.includes(e.status ?? 'Recebido'))
    : [];

  // Stats
  const statsEmendas  = isWorkflow ? todasEmendas : emendas;
  const totalValor    = isWorkflow ? 0 : (emendas as EmendaResumida[]).reduce((a, e) => a + (e.valor ?? 0), 0);
  const concluidas    = statsEmendas.filter(e => e.status === 'Concluído').length;
  const devolvidas    = statsEmendas.filter(e => (e.status ?? '').toLowerCase().startsWith('devolvid')).length;
  const emCurso       = statsEmendas.length - concluidas - devolvidas;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Painel de workflow — oculto para ADMIN (tem menu próprio) */}
      {!loading && roleConfig && !isAdmin && (
        <div className={`rounded-xl border p-4 ${roleConfig.corBg} ${roleConfig.corBorder}`}>
          <div className="flex items-center gap-2 mb-3">
            <span>🧭</span>
            <span className={`text-sm font-bold ${roleConfig.corText}`}>
              Seu fluxo de trabalho — {roleConfig.label}
            </span>
          </div>

          {/* Etapas */}
          {roleConfig.steps.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-2 mb-4">
              {roleConfig.steps.map((s, i) => (
                <div key={i} className="bg-white/70 rounded-lg px-3 py-2 text-xs">
                  <span className="mr-1">{s.icon}</span>
                  <span className={`font-medium ${roleConfig.corText}`}>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Emendas pendentes */}
          {pendentes.length > 0 ? (
            <div>
              <p className={`text-xs font-semibold mb-2 ${roleConfig.corText}`}>
                📌 {pendentes.length} emenda{pendentes.length > 1 ? 's' : ''} aguardando sua ação
              </p>
              <div className="space-y-1.5">
                {pendentes.slice(0, 5).map((e: any) => (
                  <div
                    key={e.id}
                    onClick={() => navigate(`/dashboard/emendas/${e.id}`)}
                    className="bg-white/80 hover:bg-white rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer border border-white/60 hover:border-white transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE[e.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {e.status}
                      </span>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {e.officialCode || e.id}
                      </span>
                      {e.institutionName && (
                        <span className="text-[10px] text-gray-400 truncate hidden sm:block">· {e.institutionName}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">Ver →</span>
                  </div>
                ))}
                {pendentes.length > 5 && (
                  <button onClick={() => navigate('/dashboard/emendas')}
                    className={`text-xs font-medium underline ${roleConfig.corText} opacity-70 hover:opacity-100 pl-1`}>
                    + {pendentes.length - 5} emendas a mais → Ver todas
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/60 rounded-lg px-3 py-3 text-center">
              <p className={`text-xs ${roleConfig.corText} opacity-70`}>
                {roleConfig.statusPendentes.length === 0
                  ? '✅ Acesso completo ao sistema configurado.'
                  : '✅ Nenhuma emenda pendente de ação no momento.'}
              </p>
              <button onClick={() => navigate('/dashboard/emendas')}
                className={`text-xs font-medium underline ${roleConfig.corText} opacity-70 hover:opacity-100 mt-1 block mx-auto`}>
                Ver todas as emendas →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Aviso sem instituição — só Operador */}
      {!loading && isOperador && !hasInstituicoes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="font-semibold text-amber-800">Você ainda não está vinculado a nenhuma instituição.</p>
            <p className="text-sm text-amber-700 mt-1">Cadastre ou vincule-se a uma instituição para ter acesso completo ao sistema.</p>
            <button onClick={() => navigate('/dashboard/cadastro-dados-institucionais')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
              Vincular Instituição
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && (hasInstituicoes || isWorkflow) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(isWorkflow ? [
            { label: 'Total no sistema',  value: todasEmendas.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Pendentes p/ mim',  value: pendentes.length,    color: 'text-amber-600',  bg: 'bg-amber-50'  },
            { label: 'Em andamento',      value: emCurso,             color: 'text-blue-600',   bg: 'bg-blue-50'   },
            { label: 'Concluídas',        value: concluidas,          color: 'text-emerald-600',bg: 'bg-emerald-50'},
          ] : [
            { label: 'Instituições',      value: instituicoes.length, color: 'text-blue-600',   bg: 'bg-blue-50'   },
            { label: 'Total de Emendas',  value: emendas.length,      color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Em andamento',      value: emCurso,             color: 'text-amber-600',  bg: 'bg-amber-50'  },
            { label: 'Concluídas',        value: concluidas,          color: 'text-emerald-600',bg: 'bg-emerald-50'},
          ]).map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Instituições — oculto para workflow roles */}
      {!loading && !isWorkflow && hasInstituicoes && instituicoes.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
            onClick={() => setInstOpen(v => !v)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Minhas Instituições</span>
              <span className="text-xs text-slate-400">({instituicoes.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={e => { e.stopPropagation(); navigate('/dashboard/cadastro-dados-institucionais'); }}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                + Nova Instituição
              </button>
              <span className="text-slate-400 text-sm">{instOpen ? '▲' : '▼'}</span>
            </div>
          </div>
          {instOpen && (
            <div className="divide-y divide-slate-100">
              {instituicoes.map(inst => (
                <div key={inst.id}
                  className="px-5 py-4 bg-white hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/dashboard/cadastro-dados-institucionais?id=${inst.id}`)}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${inst.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {inst.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{inst.nomeFantasia || inst.razaoSocial}</span>
                    </div>
                    <button type="button"
                      onClick={e => { e.stopPropagation(); navigate(`/dashboard/cadastro-dados-institucionais?id=${inst.id}`); }}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                      Ver detalhes →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emendas recentes — oculto para workflow roles */}
      {!loading && !isWorkflow && emendas.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
            onClick={() => setEmendaOpen(v => !v)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Emendas Recentes</span>
              <span className="text-xs text-slate-400">
                ({emendas.length} · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {emendas.length > 5 && (
                <Link to="/dashboard/emendas" onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline">
                  Ver todas →
                </Link>
              )}
              <span className="text-slate-400 text-sm">{emendaOpen ? '▲' : '▼'}</span>
            </div>
          </div>
          {emendaOpen && (
            <div className="divide-y divide-slate-100">
              {(emendas as EmendaResumida[]).slice(0, 5).map(emenda => (
                <div key={emenda.id} className="px-5 py-4 bg-white hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate('/dashboard/emendas')}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[emenda.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {emenda.status}
                      </span>
                      {emenda.codigoOficial && (
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {emenda.codigoOficial}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emenda.valor)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Instituição</div>
                      <div className="text-sm font-semibold text-slate-700 truncate">{emenda.instituicaoNome || '—'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400 mb-0.5">Parlamentar</div>
                      <div className="text-sm text-slate-600">{emenda.parlamentarNome || '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Planos de Trabalho — oculto para workflow roles */}
      {!loading && !isWorkflow && (isAdmin || isGestor || hasInstituicoes) && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
            onClick={() => setPlanosOpen(v => !v)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Planos de Trabalho</span>
              {planos.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{planos.length}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={e => { e.stopPropagation(); navigate('/dashboard/novo-plano'); }}
                className="text-xs font-medium text-indigo-600 border border-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50">
                + Novo Plano
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); navigate('/dashboard/planos'); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Ver todos →
              </button>
              <span className="text-slate-400 text-sm">{planosOpen ? '▲' : '▼'}</span>
            </div>
          </div>
          {planosOpen && (
            planos.length === 0 ? (
              <div className="px-5 py-10 bg-white flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-medium text-slate-500">Nenhum plano de trabalho cadastrado.</p>
                <button type="button" onClick={() => navigate('/dashboard/planos')}
                  className="mt-3 text-xs text-indigo-600 hover:underline font-medium">
                  + Criar Plano de Trabalho
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-white">
                {planos.slice(0, 5).map(p => {
                  const sc = p.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-800'
                    : p.status === 'REPROVADO' ? 'bg-red-100 text-red-800'
                    : p.status === 'ENVIADO'   ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600';
                  const sl = p.status === 'APROVADO' ? '✅ Aprovado'
                    : p.status === 'REPROVADO' ? '❌ Reprovado'
                    : p.status === 'ENVIADO'   ? '📤 Enviado'
                    : '📝 Rascunho';
                  return (
                    <div key={p.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/dashboard/plano/full/${p.id}`)}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{p.titulo}</p>
                        {p.emendaCodigo && <p className="text-xs text-slate-400 mt-0.5">Emenda: {p.emendaCodigo}</p>}
                      </div>
                      <span className={`ml-3 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${sc}`}>{sl}</span>
                    </div>
                  );
                })}
                {planos.length > 5 && (
                  <div className="px-5 py-2 text-center">
                    <button type="button" onClick={() => navigate('/dashboard/planos')}
                      className="text-xs text-indigo-600 hover:underline font-medium">
                      Ver todos os {planos.length} planos →
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

    </div>
  );
};

export default DashboardHomePage;

