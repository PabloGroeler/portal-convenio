import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import emendaService from '../services/emendaService';

interface Props {
  emendaId: string;
  emendaStatus?: string;
  canAct?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

const STATUSES_INICIAR = ['Análise documental aprovada', 'Iniciado'];
const STATUSES_EXECUCAO = ['Em execução'];
const STATUSES_CONCLUIDO = ['Concluído'];

const JuridicoParecerPanel: React.FC<Props> = ({ emendaId, emendaStatus, canAct = false, onStatusChange }) => {
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

  const isRelevant = [
    'Análise documental aprovada',
    'Iniciado',
    'Em execução',
  ].includes(emendaStatus ?? '');

  if (!isRelevant) return null;

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
        Parecer Jurídico
      </h3>

      {!canAct && (
        <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
          Somente o setor Jurídico pode emitir parecer.
        </p>
      )}

      {canAct && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div>
            <label className="text-xs text-slate-500 block mb-1">
              Parecer jurídico <span className="text-red-500">*</span>
            </label>
            <textarea
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Descreva o parecer jurídico, exigências ou ajustes necessários..."
            />
            <p className="text-xs text-blue-600 mt-1">
              ℹ️ O parecer será registrado no histórico. Para devolver com ajustes, use "Devolver".
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!parecer.trim()) { setError('Informe o parecer jurídico.'); return; }
                setError(null);
                acaoMutation.mutate({ acao: 'APROVAR', observacao: `[Jurídico] ${parecer}` });
              }}
              disabled={acaoMutation.isPending}
              className="flex-1 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              ✅ Emitir parecer favorável
            </button>
            <button
              onClick={() => {
                if (!parecer.trim()) { setError('Informe a justificativa para devolver.'); return; }
                setError(null);
                acaoMutation.mutate({ acao: 'DEVOLVER', observacao: `[Jurídico] ${parecer}` });
              }}
              disabled={acaoMutation.isPending}
              className="flex-1 py-2 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 disabled:opacity-50 font-medium"
            >
              ↩️ Devolver com exigências
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default JuridicoParecerPanel;

