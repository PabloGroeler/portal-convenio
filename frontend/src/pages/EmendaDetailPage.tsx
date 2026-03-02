import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import emendaService, { type EmendaHistoricoDTO } from '../services/emendaService';
import tipoEmendaService, { type TipoEmendaDTO } from '../services/tipoEmendaService';
import AdmissibilidadePanel from '../components/AnalistaOrcamentoPanel';
import SecretariaDemandaPanel from '../components/SecretariaDemandaPanel';
import ConveniosDocumentalPanel from '../components/ConveniosDocumentalPanel';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user.types';

interface Emenda {
  id: string;
  officialCode?: string;
  numeroEmenda?: number;
  exercicio?: number;
  councilorId?: string;
  councilorName?: string;
  date?: string;
  value?: string;
  classification?: string;
  esfera?: string;
  category?: string;
  status?: string;
  statusCicloVida?: string;
  institutionId?: string;
  institutionName?: string;
  institutionEmail?: string;
  existeConvenio?: boolean;
  numeroConvenio?: string;
  anoConvenio?: number;
  signedLink?: string;
  attachments?: string[];
  description?: string;
  objectDetail?: string;
  justificativa?: string;
  previsaoConclusao?: string;
  secretariaDestino?: string;
}

const EmendaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const canActOnAdmissibilidade = hasRole(UserRole.ORCAMENTO) || hasRole(UserRole.ADMIN);
  const isAdmin = hasRole(UserRole.ADMIN);
  const isSecretaria = hasRole(UserRole.SECRETARIA);

  const [emenda, setEmenda] = useState<Emenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historico, setHistorico] = useState<EmendaHistoricoDTO[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [tiposEmenda, setTiposEmenda] = useState<TipoEmendaDTO[]>([]);
  const [despachoObservacao, setDespachoObservacao] = useState('');
  const [executingAction, setExecutingAction] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<Emenda>(`/emendas/${id}`)
      .then(({ data }) => {
        setEmenda(data);
        // load historico and tipos in parallel
        setLoadingHistorico(true);
        Promise.all([
          emendaService.getHistorico(id).catch(() => [] as EmendaHistoricoDTO[]),
          tipoEmendaService.list().catch(() => [] as TipoEmendaDTO[]),
        ]).then(([hist, tipos]) => {
          setHistorico(hist);
          setTiposEmenda(tipos);
          setLoadingHistorico(false);
        });
      })
      .catch(() => setError('Falha ao carregar a emenda'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAcao = async (acao: 'APROVAR' | 'DEVOLVER' | 'REPROVAR') => {
    if (!id || !emenda) return;
    setExecutingAction(true);
    try {
      const updated = await emendaService.executarAcao(id, { acao, observacao: despachoObservacao });
      setEmenda((prev) => prev ? { ...prev, status: updated.status ?? prev.status } : prev);
      setDespachoObservacao('');
      const hist = await emendaService.getHistorico(id);
      setHistorico(hist);
    } catch (err: any) {
      alert(`Erro ao executar ação: ${err?.response?.data?.error || err.message || 'Erro desconhecido'}`);
    } finally {
      setExecutingAction(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Carregando...</p>
    </div>
  );

  if (error || !emenda) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-red-600">{error ?? 'Emenda não encontrada'}</p>
      <button onClick={() => navigate('/dashboard/emendas')} className="text-blue-600 underline text-sm">Voltar para lista</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-100 bg-gray-50/50 relative">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-purple-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
          {emenda.institutionName || 'Instituição'}
        </span>
        <h2 className="text-xl font-bold text-gray-900 text-center leading-tight mb-1">
          {emenda.officialCode || 'Detalhes da Emenda'}
        </h2>
        <div className="mt-2 flex gap-2 flex-wrap justify-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            (emenda.status || '').toLowerCase() === 'concluído' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            (emenda.status || '').toLowerCase() === 'admissibilidade aprovada' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            (emenda.status || '').toLowerCase() === 'análise de demanda aprovada' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            (emenda.status || '').toLowerCase() === 'análise documental aprovada' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            (emenda.status || '').toLowerCase() === 'devolvido' ? 'bg-red-100 text-red-800 border-red-200' :
            (emenda.status || '').toLowerCase() === 'devolvida ao legislativo' ? 'bg-red-100 text-red-800 border-red-200' :
            (emenda.status || '').toLowerCase() === 'devolvida por incompatibilidade de demanda' ? 'bg-red-100 text-red-800 border-red-200' :
            (emenda.status || '').toLowerCase() === 'devolvida por inviabilidade documental' ? 'bg-red-100 text-red-800 border-red-200' :
            (emenda.status || '').toLowerCase() === 'em execução' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            (emenda.status || '').toLowerCase() === 'em análise de admissibilidade' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            (emenda.status || '').toLowerCase() === 'em análise de demanda' ? 'bg-teal-100 text-teal-800 border-teal-200' :
            (emenda.status || '').toLowerCase() === 'em análise documental' ? 'bg-violet-100 text-violet-800 border-violet-200' :
            (emenda.status || '').toLowerCase() === 'iniciado' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            'bg-gray-100 text-gray-700 border-gray-200'
          }`}>
            {emenda.status}
          </span>
        </div>
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard/emendas')}
          className="absolute left-4 top-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Voltar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start overflow-y-auto">

        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4 border-b pb-2">Dados da Emenda</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase block">Número da Emenda</label>
                  <span className="font-mono text-slate-700 font-medium">{emenda.officialCode || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Valor</span>
                  <span className="font-mono text-slate-700 font-medium">{emenda.value || '—'}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase block">Exercício (Ano)</label>
                  <span className="font-mono text-slate-700 font-medium">{emenda.exercicio || '—'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase block">Objeto da Emenda</label>
                <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap break-words">{emenda.description || '—'}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase block">Objeto Detalhado</span>
                <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 min-h-[60px] whitespace-pre-wrap mt-1">
                  {emenda.objectDetail || '—'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Data</span>
                  <span className="text-slate-700 text-sm">
                    {emenda.date ? new Date(emenda.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Esfera</span>
                  <span className="text-slate-700 text-sm">{emenda.esfera || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Tipo de Emenda</span>
                  <span className="text-slate-700 text-sm">
                    {tiposEmenda.find((t) => t.codigo === emenda.classification)?.nome || emenda.classification || '—'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Categoria</span>
                  <span className="text-slate-700 text-sm">{emenda.category || '—'}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase block">Previsão de Conclusão</label>
                  <span className="text-slate-700 text-sm">
                    {emenda.previsaoConclusao ? new Date(emenda.previsaoConclusao).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
              </div>

              {emenda.justificativa && (
                <div>
                  <label className="text-xs text-slate-500 uppercase block">Justificativa</label>
                  <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap break-words">{emenda.justificativa}</p>
                </div>
              )}

              {/* Convênio */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Convênio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">Existe Convênio?</span>
                    <span className="text-slate-700 text-sm">{emenda.existeConvenio ? 'Sim' : 'Não'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">Número do Convênio</span>
                    <span className="text-slate-700 text-sm">{emenda.existeConvenio ? (emenda.numeroConvenio || '—') : '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">Ano do Convênio</span>
                    <span className="text-slate-700 text-sm">{emenda.existeConvenio ? (emenda.anoConvenio ?? '—') : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Parlamentar / Instituição */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Parlamentar</span>
                  <span className="text-slate-700 text-sm">{emenda.councilorName || emenda.councilorId || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Instituição</span>
                  <span className="text-slate-700 text-sm">{emenda.institutionName || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase block">Link Assinado</span>
                  <span className="text-slate-700 text-sm truncate block">{emenda.signedLink || '—'}</span>
                </div>
              </div>

              {/* Secretaria de Destino — aparece após admissibilidade aprovada */}
              {emenda.secretariaDestino && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <span className="text-xs text-emerald-600 uppercase font-semibold block mb-0.5">Secretaria de Destino</span>
                  <span className="text-emerald-800 text-sm font-medium">{emenda.secretariaDestino}</span>
                </div>
              )}
            </div>
          </section>

          {/* Área de Despacho */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Área de Despacho
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-purple-900">Motivo / Parecer do Gestor</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descreva o motivo da aprovação, necessidade de retificação ou reprovação..."
                  value={despachoObservacao}
                  onChange={(e) => setDespachoObservacao(e.target.value)}
                  disabled={executingAction}
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => handleAcao('APROVAR')} disabled={executingAction}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50 flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                  {executingAction ? 'Processando...' : 'Aprovar'}
                </button>
                <button onClick={() => handleAcao('DEVOLVER')} disabled={executingAction}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded disabled:opacity-50 flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                  Devolver
                </button>
                <button onClick={() => handleAcao('REPROVAR')} disabled={executingAction}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
                  Reprovar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Linha do Tempo */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Linha do Tempo</h3>
            {loadingHistorico ? (
              <p className="text-sm text-slate-500">Carregando histórico...</p>
            ) : historico.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum histórico registrado.</p>
            ) : (
              <div className="relative pl-4">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                <div className="space-y-6">
                  {historico.map((h) => (
                    <div key={h.id} className="relative pl-8">
                      <span className="absolute left-0 top-1.5 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={`h-2.5 w-2.5 ${
                          (h.acao === 'APROVADA' || h.acao === 'APROVADO' || h.acao === 'ADMISSIBILIDADE_APROVADA' || h.acao === 'ANALISE_DEMANDA_APROVADA' || h.acao === 'ANALISE_DOCUMENTAL_APROVADA') ? 'text-emerald-600' :
                          (h.acao === 'REPROVADA' || h.acao === 'REPROVADO' || h.acao === 'DEVOLVIDA_LEGISLATIVO' || h.acao === 'DEVOLVIDA_INCOMPATIBILIDADE_DEMANDA' || h.acao === 'DEVOLVIDA_INVIABILIDADE_DOCUMENTAL') ? 'text-red-600' :
                          (h.acao === 'DEVOLVIDA') ? 'text-amber-500' :
                          (h.acao === 'EM_ANALISE_ADMISSIBILIDADE' || h.acao === 'EM_ANALISE_DEMANDA') ? 'text-indigo-500' :
                          (h.acao === 'EM_ANALISE_DOCUMENTAL') ? 'text-violet-500' :
                          (h.acao === 'SOLICITADA_APROVACAO') ? 'text-blue-600' :
                          'text-slate-400'
                        }`}><circle cx="12" cy="12" r="10" /></svg>
                      </span>
                      <div className="flex flex-col gap-1">
                        <h4 className={`text-sm font-semibold leading-tight ${
                          (h.acao === 'APROVADA' || h.acao === 'APROVADO' || h.acao === 'ADMISSIBILIDADE_APROVADA' || h.acao === 'ANALISE_DEMANDA_APROVADA' || h.acao === 'ANALISE_DOCUMENTAL_APROVADA') ? 'text-emerald-700' :
                          (h.acao === 'REPROVADA' || h.acao === 'REPROVADO' || h.acao === 'DEVOLVIDA_LEGISLATIVO' || h.acao === 'DEVOLVIDA_INCOMPATIBILIDADE_DEMANDA' || h.acao === 'DEVOLVIDA_INVIABILIDADE_DOCUMENTAL') ? 'text-red-700' :
                          (h.acao === 'DEVOLVIDA') ? 'text-amber-700' :
                          (h.acao === 'EM_ANALISE_ADMISSIBILIDADE' || h.acao === 'EM_ANALISE_DEMANDA') ? 'text-indigo-700' :
                          (h.acao === 'EM_ANALISE_DOCUMENTAL') ? 'text-violet-700' :
                          (h.acao === 'SOLICITADA_APROVACAO') ? 'text-blue-700' :
                          'text-slate-700'
                        }`}>
                          {h.acao === 'SOLICITADA_APROVACAO' ? 'Solicitou Aprovação' :
                           (h.acao === 'APROVADA' || h.acao === 'APROVADO') ? 'Aprovada' :
                           h.acao === 'ADMISSIBILIDADE_APROVADA' ? 'Admissibilidade Aprovada' :
                           h.acao === 'EM_ANALISE_ADMISSIBILIDADE' ? 'Em Análise de Admissibilidade' :
                           h.acao === 'DEVOLVIDA_LEGISLATIVO' ? 'Devolvida ao Legislativo' :
                           h.acao === 'EM_ANALISE_DEMANDA' ? 'Em Análise de Demanda' :
                           h.acao === 'ANALISE_DEMANDA_APROVADA' ? 'Análise de Demanda Aprovada' :
                           h.acao === 'DEVOLVIDA_INCOMPATIBILIDADE_DEMANDA' ? 'Devolvida por Incompatibilidade de Demanda' :
                           h.acao === 'EM_ANALISE_DOCUMENTAL' ? 'Em Análise Documental' :
                           h.acao === 'ANALISE_DOCUMENTAL_APROVADA' ? 'Análise Documental Aprovada' :
                           h.acao === 'DEVOLVIDA_INVIABILIDADE_DOCUMENTAL' ? 'Devolvida por Inviabilidade Documental' :
                           h.acao === 'DEVOLVIDA' ? 'Devolvida para Retificação' :
                           (h.acao === 'REPROVADA' || h.acao === 'REPROVADO') ? 'Reprovada' :
                           h.acao === 'CRIADA' ? 'Emenda Criada' :
                           h.acao === 'PENDENTE' ? 'Emenda Criada' :
                           h.acao === 'ATUALIZADA' ? 'Atualizada' :
                           h.acao === 'DETALHAMENTO_PENDENTE' ? 'Detalhamento pendente' :
                           h.acao === 'DETALHAMENTO_ENVIADO' ? 'Detalhamento enviado' :
                           h.acao}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {new Date(h.dataHora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.observacao && <p className="text-sm text-slate-500 mt-1">{h.observacao}</p>}
                      {h.usuario && <p className="text-xs text-slate-400 mt-1">Por: {h.usuario}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admissibilidade — visível para todos, ações só para ORCAMENTO/ADMIN */}
          {id && (
            <AdmissibilidadePanel
              emendaId={id}
              emendaStatus={emenda.status}
              canAct={canActOnAdmissibilidade}
              onStatusChange={(newStatus) => {
                setEmenda((prev) => prev ? { ...prev, status: newStatus } : prev);
                emendaService.getHistorico(id).then(setHistorico).catch(() => {});
              }}
            />
          )}

          {/* Análise de Demanda — visível para todos, ações só para SECRETARIA/ADMIN */}
          {id && [
            'Admissibilidade aprovada',
            'Em análise de demanda',
            'Análise de demanda aprovada',
            'Devolvida por incompatibilidade de demanda',
            'Em análise documental',
            'Análise documental aprovada',
            'Devolvida por inviabilidade documental',
          ].includes(emenda.status ?? '') && (
            <SecretariaDemandaPanel
              emendaId={id}
              emendaStatus={emenda.status}
              canAct={isAdmin || isSecretaria}
              onStatusChange={(newStatus) => {
                setEmenda((prev) => prev ? { ...prev, status: newStatus } : prev);
                emendaService.getHistorico(id).then(setHistorico).catch(() => {});
              }}
            />
          )}

          {/* Análise Documental — visível para todos, ações só para CONVENIOS/ADMIN */}
          {id && [
            'Análise de demanda aprovada',
            'Em análise documental',
            'Análise documental aprovada',
            'Devolvida por inviabilidade documental',
          ].includes(emenda.status ?? '') && (
            <ConveniosDocumentalPanel
              emendaId={id}
              emendaStatus={emenda.status}
              canAct={isAdmin || isConvenios}
              onStatusChange={(newStatus) => {
                setEmenda((prev) => prev ? { ...prev, status: newStatus } : prev);
                emendaService.getHistorico(id).then(setHistorico).catch(() => {});
              }}
            />
          )}

          {/* Anexos */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anexos</h4>
            <div className="space-y-2 text-sm">
              {(emenda.attachments ?? []).length === 0 ? (
                <p className="text-slate-500">—</p>
              ) : (
                <ul className="space-y-2">
                  {emenda.attachments!.map((url, idx) => (
                    <li key={idx}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        Abrir anexo {idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {emenda.signedLink && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documento Assinado</h4>
              <a href={emenda.signedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                Abrir documento
              </a>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
};

export default EmendaDetailPage;

