import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMinhasInstituicoesDetalhadas, getMinhasEmendas } from '../services/userService';
import type { InstituicaoDetalhada, EmendaResumida } from '../types/user.types';
import planoService from '../services/planoTrabalhoService';
import type { PlanoTrabalho } from '../types/planoTrabalho.types';

const DashboardHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instituicoes, setInstituicoes] = useState<InstituicaoDetalhada[]>([]);
  const [emendas, setEmendas] = useState<EmendaResumida[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInstituicoes, setHasInstituicoes] = useState(false);
  const [instOpen, setInstOpen] = useState(true);
  const [emendaOpen, setEmendaOpen] = useState(true);
  const [planosOpen, setPlanosOpen] = useState(true);
  const [planos, setPlanos] = useState<PlanoTrabalho[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }
      const isGestorOrAdmin = user.role === 'ADMIN' || user.role === 'GESTOR';
      try {
        const [dataInstituicoes, allPlanos] = await Promise.all([
          getMinhasInstituicoesDetalhadas().catch(() => [] as InstituicaoDetalhada[]),
          planoService.listAll().catch(() => [] as PlanoTrabalho[]),
        ]);

        setInstituicoes(dataInstituicoes);
        setHasInstituicoes(dataInstituicoes.length > 0);

        if (isGestorOrAdmin) {
          setPlanos(allPlanos);
          if (dataInstituicoes.length > 0) {
            const dataEmendas = await getMinhasEmendas().catch(() => [] as EmendaResumida[]);
            setEmendas(dataEmendas);
          }
        } else if (dataInstituicoes.length > 0) {
          const instIds = new Set(dataInstituicoes.map(i => i.id));
          setPlanos(allPlanos.filter(p => !p.instituicaoId || instIds.has(p.instituicaoId)));
          const dataEmendas = await getMinhasEmendas().catch(() => [] as EmendaResumida[]);
          setEmendas(dataEmendas);
        }
      } catch {
        setHasInstituicoes(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Stats
  const totalValor = emendas.reduce((acc, e) => acc + (e.valor ?? 0), 0);
  const concluidas = emendas.filter(e => e.status === 'Concluído').length;
  const devolvidas = emendas.filter(e => (e.status || '').toLowerCase().startsWith('devolvid')).length;
  const emCurso = emendas.length - concluidas - devolvidas;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Recebido':                                    'bg-blue-100 text-blue-800',
      'Em análise de admissibilidade':               'bg-amber-100 text-amber-800',
      'Admissibilidade aprovada':                    'bg-emerald-100 text-emerald-800',
      'Devolvida ao legislativo':                    'bg-red-100 text-red-800',
      'Em análise de demanda':                       'bg-teal-100 text-teal-800',
      'Análise de demanda aprovada':                 'bg-emerald-100 text-emerald-800',
      'Devolvida por incompatibilidade de demanda':  'bg-red-100 text-red-800',
      'Em análise documental':                       'bg-violet-100 text-violet-800',
      'Análise documental aprovada':                 'bg-emerald-100 text-emerald-800',
      'Devolvida por inviabilidade documental':      'bg-red-100 text-red-800',
      'Em execução':                                 'bg-indigo-100 text-indigo-800',
      'Concluído':                                   'bg-emerald-100 text-emerald-800',
      'Devolvido':                                   'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Aviso sem instituição ── */}
      {!loading && !hasInstituicoes && user?.role === 'OPERADOR' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="font-semibold text-amber-800">Você ainda não está vinculado a nenhuma instituição.</p>
            <p className="text-sm text-amber-700 mt-1">Cadastre ou vincule-se a uma instituição para ter acesso completo ao sistema.</p>
            <button
              onClick={() => navigate('/dashboard/cadastro-dados-institucionais')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Vincular Instituição
            </button>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      {hasInstituicoes && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Instituições', value: instituicoes.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total de Emendas', value: emendas.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Em andamento', value: emCurso, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Concluídas', value: concluidas, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      )}

      {/* ── Instituições (collapsible) ── */}
      {!loading && hasInstituicoes && instituicoes.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setInstOpen(v => !v)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Minhas Instituições</span>
              <span className="text-xs text-slate-400">({instituicoes.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); navigate('/dashboard/cadastro-dados-institucionais'); }}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                + Nova Instituição
              </button>
              <span className="text-slate-400 text-sm select-none">{instOpen ? '▲' : '▼'}</span>
            </div>
          </div>

          {instOpen && (
            <div className="divide-y divide-slate-100">
              {instituicoes.map(inst => (
                <div
                  key={inst.id}
                  className="px-5 py-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/cadastro-dados-institucionais?id=${inst.id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${inst.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {inst.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {inst.nomeFantasia || inst.razaoSocial}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(`/dashboard/cadastro-dados-institucionais?id=${inst.id}`); }}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        Ver detalhes →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Emendas recentes (collapsible) ── */}
      {!loading && emendas.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setEmendaOpen(v => !v)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Emendas Recentes</span>
              <span className="text-xs text-slate-400">
                ({emendas.length} total · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {emendas.length > 5 && (
                <Link
                  to="/dashboard/emendas"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver todas →
                </Link>
              )}
              <span className="text-slate-400 text-sm select-none">{emendaOpen ? '▲' : '▼'}</span>
            </div>
          </div>

          {emendaOpen && (
            <div className="divide-y divide-slate-100">
              {emendas.slice(0, 5).map(emenda => (
                <div
                  key={emenda.id}
                  className="px-5 py-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard/emendas')}
                >
                  {/* linha 1 */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(emenda.status)}`}>
                        {emenda.status}
                      </span>
                      {emenda.codigoOficial && (
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {emenda.codigoOficial}
                        </span>
                      )}
                      {emenda.categoria && (
                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {emenda.categoria}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emenda.valor)}
                    </span>
                  </div>
                  {/* linha 2 */}
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
                  {/* linha 3 */}
                  {emenda.descricao && (
                    <div className="mt-1.5">
                      <div className="text-xs text-slate-400 mb-0.5">Descrição</div>
                      <div className="text-sm text-slate-500 line-clamp-1">{emenda.descricao}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Planos de Trabalho (collapsible) ── */}
      {!loading && (user?.role === 'ADMIN' || user?.role === 'GESTOR' || hasInstituicoes) && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setPlanosOpen(v => !v)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Planos de Trabalho</span>
              {planos.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {planos.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); navigate('/dashboard/novo-plano'); }}
                className="text-xs font-medium text-indigo-600 border border-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                + Novo Plano
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); navigate('/dashboard/planos'); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Ver todos →
              </button>
              <span className="text-slate-400 text-sm select-none">{planosOpen ? '▲' : '▼'}</span>
            </div>
          </div>

          {planosOpen && (
            planos.length === 0 ? (
              <div className="px-5 py-10 bg-white flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-medium text-slate-500">Nenhum plano de trabalho cadastrado.</p>
                <p className="text-xs text-slate-400 mt-1">Os planos de trabalho vinculados às suas emendas aparecerão aqui.</p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/planos')}
                  className="mt-3 text-xs text-indigo-600 hover:underline font-medium"
                >
                  + Criar Plano de Trabalho
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-white">
                {planos.slice(0, 5).map(p => {
                  const statusColor =
                    p.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-800'
                    : p.status === 'REPROVADO' ? 'bg-red-100 text-red-800'
                    : p.status === 'ENVIADO' ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600';
                  const statusLabel =
                    p.status === 'APROVADO' ? '✅ Aprovado'
                    : p.status === 'REPROVADO' ? '❌ Reprovado'
                    : p.status === 'ENVIADO' ? '📤 Enviado'
                    : '📝 Rascunho';
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dashboard/plano/full/${p.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{p.titulo}</p>
                        {p.emendaCodigo && (
                          <p className="text-xs text-slate-400 mt-0.5">Emenda: {p.emendaCodigo}</p>
                        )}
                      </div>
                      <span className={`ml-3 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
                {planos.length > 5 && (
                  <div className="px-5 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/planos')}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
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

