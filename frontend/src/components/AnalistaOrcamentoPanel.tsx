import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import emendaService from '../services/emendaService';
import secretariaMunicipalService from '../services/secretariaMunicipalService';

interface AdmissibilidadeDTO {
  id: number;
  emendaId: string;
  status: 'APROVADA' | 'REPROVADA' | 'PENDENTE';
  observacao?: string;
  analistaNome?: string;
  dataAnalise?: string;
}

interface Props {
  emendaId: string;
  emendaStatus?: string;
  canAct?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

const AdmissibilidadePanel: React.FC<Props> = ({
  emendaId,
  emendaStatus,
  canAct = false,
  onStatusChange,
}) => {
  const queryClient = useQueryClient();
  const [parecer, setParecer] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: admissibilidade, isLoading } = useQuery<AdmissibilidadeDTO | null>({
    queryKey: ['admissibilidade', emendaId],
    queryFn: async () => {
      const res = await api.get(`/emendas/${emendaId}/admissibilidade`);
      if (res.status === 204) return null;
      return res.data;
    },
    retry: false,
  });

  const { data: secretarias = [], isLoading: loadingSecretarias } = useQuery({
    queryKey: ['secretarias-municipais'],
    queryFn: () => secretariaMunicipalService.list(),
    staleTime: 5 * 60 * 1000,
  });

  const secretariasAtivas = secretarias.filter((s: any) => s.ativo !== false);

  const acaoMutation = useMutation({
    mutationFn: (payload: { acao: string; observacao?: string; secretariaDestino?: string }) =>
      emendaService.executarAcao(emendaId, {
        acao: payload.acao as any,
        observacao: payload.observacao,
        secretariaDestino: payload.secretariaDestino,
      }),
    onSuccess: (updated) => {
      setError(null);
      setParecer('');
      setSecretaria('');
      queryClient.invalidateQueries({ queryKey: ['admissibilidade', emendaId] });
      queryClient.invalidateQueries({ queryKey: ['historico', emendaId] });
      if (onStatusChange && updated.status) onStatusChange(updated.status);
    },
    onError: (e: any) => {
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Erro ao executar ação');
    },
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const isRecebido = !emendaStatus || emendaStatus === 'Recebido';
  const isEmAnalise = emendaStatus === 'Em análise de admissibilidade';
  const isAprovada = emendaStatus === 'Admissibilidade aprovada';
  const isDevolvida = emendaStatus === 'Devolvida ao legislativo';
  // Fases posteriores — admissibilidade já foi concluída
  const isFasePosterior = [
    'Em análise de demanda',
    'Análise de demanda aprovada',
    'Devolvida por incompatibilidade de demanda',
    'Em análise documental',
    'Análise documental aprovada',
    'Devolvida por inviabilidade documental',
  ].includes(emendaStatus ?? '');
  const jaFinalizado = isAprovada || isDevolvida || isFasePosterior;

  const statusColor = (isAprovada || isFasePosterior)
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : isDevolvida
    ? 'bg-red-100 text-red-800 border-red-200'
    : isEmAnalise
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
        An&#225;lise de Admissibilidade
      </h3>

      {(isEmAnalise || isAprovada || isDevolvida || isFasePosterior) && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${statusColor}`}>
          {isFasePosterior ? 'Admissibilidade aprovada' : emendaStatus}
        </span>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-400">Carregando...</p>
      ) : admissibilidade && (admissibilidade.observacao || admissibilidade.analistaNome) ? (
        <div className="space-y-1 mb-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
          {admissibilidade.observacao && (
            <p className="italic">"{admissibilidade.observacao}"</p>
          )}
          {admissibilidade.analistaNome && (
            <p className="text-slate-400">
              Por {admissibilidade.analistaNome}
              {admissibilidade.dataAnalise && ` em ${formatDate(admissibilidade.dataAnalise)}`}
            </p>
          )}
        </div>
      ) : null}

      {!canAct && (
        <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
          Somente o setor de Or&#231;amento pode executar esta an&#225;lise.
        </p>
      )}

      {canAct && (
        <div className="space-y-3 pt-3 border-t border-slate-100">

          {isRecebido && (
            <button
              onClick={() => acaoMutation.mutate({ acao: 'INICIAR_ANALISE' })}
              disabled={acaoMutation.isPending}
              className="w-full py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {acaoMutation.isPending ? 'Iniciando...' : '🔍 Iniciar Análise de Admissibilidade'}
            </button>
          )}

          {isEmAnalise && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Parecer t&#233;cnico <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={parecer}
                  onChange={(e) => setParecer(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Descreva o parecer técnico da análise..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Secretaria de destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={secretaria}
                  onChange={(e) => setSecretaria(e.target.value)}
                  disabled={loadingSecretarias}
                  className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                >
                  <option value="">
                    {loadingSecretarias ? 'Carregando...' : 'Selecione a secretaria...'}
                  </option>
                  {secretariasAtivas.map((s: any) => (
                    <option key={s.id} value={s.nome}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!secretaria.trim()) { setError('Informe a secretaria de destino para aprovar.'); return; }
                    if (!parecer.trim()) { setError('Informe o parecer técnico.'); return; }
                    setError(null);
                    acaoMutation.mutate({ acao: 'APROVAR_ADMISSIBILIDADE', observacao: parecer, secretariaDestino: secretaria });
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
                    acaoMutation.mutate({ acao: 'REPROVAR_ADMISSIBILIDADE', observacao: parecer });
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
            <p className="text-xs text-slate-400 italic">
              An&#225;lise de admissibilidade conclu&#237;da.
            </p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default AdmissibilidadePanel;
