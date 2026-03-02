import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import emendaService from '../services/emendaService';

interface Props {
  emendaId: string;
  emendaStatus?: string;
  canAct?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

const SecretariaDemandaPanel: React.FC<Props> = ({
  emendaId,
  emendaStatus,
  canAct = false,
  onStatusChange,
}) => {
  const queryClient = useQueryClient();
  const [parecer, setParecer] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const isAdmissibilidadeAprovada = emendaStatus === 'Admissibilidade aprovada';
  const isEmAnaliseDemanda = emendaStatus === 'Em análise de demanda';
  const isDemandaAprovada = emendaStatus === 'Análise de demanda aprovada';
  const isDevolvida = emendaStatus === 'Devolvida por incompatibilidade de demanda';
  // Fases posteriores — demanda já foi concluída, análise documental em andamento
  const isFaseDocumental = [
    'Em análise documental',
    'Análise documental aprovada',
    'Devolvida por inviabilidade documental',
  ].includes(emendaStatus ?? '');
  const jaFinalizado = isDemandaAprovada || isDevolvida || isFaseDocumental;

  const statusColor = (isDemandaAprovada || isFaseDocumental)
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : isDevolvida
    ? 'bg-red-100 text-red-800 border-red-200'
    : isEmAnaliseDemanda
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  const isRelevant = isAdmissibilidadeAprovada || isEmAnaliseDemanda || isDemandaAprovada || isDevolvida || isFaseDocumental;

  if (!isRelevant) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
        Análise de Demanda
      </h3>

      {(isEmAnaliseDemanda || isDemandaAprovada || isDevolvida || isFaseDocumental) && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${statusColor}`}>
          {isFaseDocumental ? 'Análise de demanda aprovada' : emendaStatus}
        </span>
      )}

      {!canAct && (
        <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
          Somente a secretaria vinculada pode executar esta análise.
        </p>
      )}

      {canAct && (
        <div className="space-y-3 pt-3 border-t border-slate-100">

          {/* PASSO 1: Admissibilidade aprovada — botão Analisar */}
          {isAdmissibilidadeAprovada && (
            <button
              onClick={() => acaoMutation.mutate({ acao: 'INICIAR_ANALISE_DEMANDA' })}
              disabled={acaoMutation.isPending}
              className="w-full py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {acaoMutation.isPending ? 'Iniciando...' : '🔍 Analisar Demanda'}
            </button>
          )}

          {/* PASSO 2: Em análise — parecer + botões aprovar/reprovar */}
          {isEmAnaliseDemanda && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Parecer técnico <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={parecer}
                  onChange={(e) => setParecer(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="Descreva o parecer técnico da análise de demanda..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!parecer.trim()) { setError('Informe o parecer técnico.'); return; }
                    setError(null);
                    acaoMutation.mutate({ acao: 'APROVAR_DEMANDA', observacao: parecer });
                  }}
                  disabled={acaoMutation.isPending}
                  className="flex-1 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => {
                    if (!parecer.trim()) { setError('Informe o parecer técnico para reprovar.'); return; }
                    setError(null);
                    acaoMutation.mutate({ acao: 'REPROVAR_DEMANDA', observacao: parecer });
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
            <p className="text-xs text-slate-400 italic">Análise de demanda concluída.</p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default SecretariaDemandaPanel;

