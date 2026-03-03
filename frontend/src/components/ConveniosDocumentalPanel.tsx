import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import emendaService from '../services/emendaService';

interface Props {
  emendaId: string;
  emendaStatus?: string;
  tipoTransferencia?: string;
  canAct?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

const ConveniosDocumentalPanel: React.FC<Props> = ({
  emendaId,
  emendaStatus,
  tipoTransferencia,
  canAct = false,
  onStatusChange,
}) => {
  const queryClient = useQueryClient();
  const [parecer, setParecer] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Story 5: Direta executions are fully closed after demand approval — no documental step
  const isIndireta = tipoTransferencia === 'Indireta';
  const isDireta = !isIndireta; // null/undefined also means Direta (default)

  const acaoMutation = useMutation({
    mutationFn: (payload: { acao: string; observacao?: string }) =>
      emendaService.executarAcao(emendaId, { acao: payload.acao as any, observacao: payload.observacao }),
    onSuccess: (updated) => {
      setError(null);
      setParecer('');
      queryClient.invalidateQueries({ queryKey: ['historico', emendaId] });
      if (onStatusChange && updated.status) onStatusChange(updated.status);
    },
    onError: (e: any) => {
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Erro ao executar ação');
    },
  });

  const isDemandaAprovada = emendaStatus === 'Análise de demanda aprovada';
  const isEmAnaliseDocumental = emendaStatus === 'Em análise documental';
  const isDocumentalAprovada = emendaStatus === 'Análise documental aprovada';
  const isDevolvida = emendaStatus === 'Devolvida por inviabilidade documental';
  const jaFinalizado = isDocumentalAprovada || isDevolvida;

  const statusColor = isDocumentalAprovada
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : isDevolvida
    ? 'bg-red-100 text-red-800 border-red-200'
    : isEmAnaliseDocumental
    ? 'bg-violet-100 text-violet-800 border-violet-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  const isRelevant = isDemandaAprovada || isEmAnaliseDocumental || isDocumentalAprovada || isDevolvida;
  if (!isRelevant) return null;

  // Story 5: for Direta, render a read-only closure notice — no actions allowed
  if (isDireta) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
          </svg>
          Fluxo Encerrado — Execução Direta
        </h3>
        <p className="text-xs text-blue-700">
          Esta emenda possui execução <strong>Direta</strong>. O fluxo no módulo de emendas está
          encerrado após a aprovação da demanda. Não há análise documental nem encaminhamento ao
          Setor de Convênios.
        </p>
      </div>
    );
  }

  // Indireta: full documental analysis flow
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-violet-500" />
        Análise Documental — Convênios
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
          Indireta
        </span>
      </h3>

      {emendaStatus && (isEmAnaliseDocumental || isDocumentalAprovada || isDevolvida) && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${statusColor}`}>
          {emendaStatus}
        </span>
      )}

      {!canAct && (
        <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
          Somente o setor de Convênios pode executar esta análise.
        </p>
      )}

      {canAct && (
        <div className="space-y-3 pt-3 border-t border-slate-100">

          {/* PASSO 1: Demanda aprovada → botão Analisar */}
          {isDemandaAprovada && (
            <button
              onClick={() => acaoMutation.mutate({ acao: 'INICIAR_ANALISE_DOCUMENTAL' })}
              disabled={acaoMutation.isPending}
              className="w-full py-2 bg-violet-600 text-white text-sm rounded-md hover:bg-violet-700 disabled:opacity-50 font-medium"
            >
              {acaoMutation.isPending ? 'Iniciando...' : '📋 Analisar Documentação'}
            </button>
          )}

          {/* PASSO 2: Em análise documental → parecer + botões */}
          {isEmAnaliseDocumental && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Parecer documental <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={parecer}
                  onChange={(e) => setParecer(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                  placeholder="Descreva o parecer documental da análise..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!parecer.trim()) { setError('Informe o parecer documental.'); return; }
                    setError(null);
                    acaoMutation.mutate({ acao: 'APROVAR_DOCUMENTAL', observacao: parecer });
                  }}
                  disabled={acaoMutation.isPending}
                  className="flex-1 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => {
                    if (!parecer.trim()) { setError('Informe a justificativa para reprovar.'); return; }
                    setError(null);
                    acaoMutation.mutate({ acao: 'REPROVAR_DOCUMENTAL', observacao: parecer });
                  }}
                  disabled={acaoMutation.isPending}
                  className="flex-1 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  ❌ Reprovar
                </button>
              </div>
            </div>
          )}

          {jaFinalizado && (
            <p className="text-xs text-slate-400 italic">Análise documental concluída.</p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ConveniosDocumentalPanel;

