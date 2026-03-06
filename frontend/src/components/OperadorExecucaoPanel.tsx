import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import emendaService from '../services/emendaService';

interface Props {
  emendaId: string;
  emendaStatus?: string;
  canAct?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

const OperadorExecucaoPanel: React.FC<Props> = ({ emendaId, emendaStatus, canAct = false, onStatusChange }) => {
  const queryClient = useQueryClient();
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState<string | null>(null);

  const acaoMutation = useMutation({
    mutationFn: (payload: { acao: string; observacao?: string }) =>
      emendaService.executarAcao(emendaId, { acao: payload.acao as any, observacao: payload.observacao }),
    onSuccess: (updated) => {
      setError(null);
      setObservacao('');
      queryClient.invalidateQueries({ queryKey: ['historico', emendaId] });
      if (onStatusChange && updated.status) onStatusChange(updated.status);
    },
    onError: (e: any) => {
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Erro ao executar acao');
    },
  });

  const isIniciado = emendaStatus === 'Iniciado';
  const isEmExecucao = emendaStatus === 'Em execu\u00e7\u00e3o';
  const isConcluido = emendaStatus === 'Conclu\u00eddo';
  const isDevolvido = emendaStatus === 'Devolvido';

  if (!isIniciado && !isEmExecucao && !isConcluido && !isDevolvido) return null;

  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
        Execucao / Operador
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          isConcluido ? 'bg-emerald-100 text-emerald-700' :
          isDevolvido ? 'bg-red-100 text-red-700' :
          isEmExecucao ? 'bg-indigo-100 text-indigo-700' :
          'bg-amber-100 text-amber-700'
        }`}>{emendaStatus}</span>
      </h3>
      {isConcluido && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
          Emenda concluida. Pagamento total efetuado. Verifique se ha prestacao de contas pendente.
        </div>
      )}
      {isDevolvido && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
          Emenda devolvida. Corrija as pendencias indicadas no historico e reenvie.
        </div>
      )}
      {!canAct && !isConcluido && !isDevolvido && (
        <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
          Somente o Operador/Proponente pode registrar acoes de execucao.
        </p>
      )}
      {canAct && (isIniciado || isEmExecucao) && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {isIniciado && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              Emenda iniciada. Aguardando inicio da execucao fisica/financeira (liquidacao).
            </div>
          )}
          {isEmExecucao && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
              Emenda em execucao. Registre medicoes, liquidacoes e atualizacoes de andamento.
            </div>
          )}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Observacao / Atualizacao de andamento</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Descreva o andamento da execucao, pendencias ou informacoes relevantes..."
            />
          </div>
          {isEmExecucao && (
            <button
              onClick={() => {
                if (!observacao.trim()) { setError('Informe uma observacao para registrar a conclusao.'); return; }
                setError(null);
                acaoMutation.mutate({ acao: 'APROVAR', observacao: `[Execucao] ${observacao}` });
              }}
              disabled={acaoMutation.isPending}
              className="w-full py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              {acaoMutation.isPending ? 'Registrando...' : 'Registrar Conclusao (Pagamento Total)'}
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default OperadorExecucaoPanel;
