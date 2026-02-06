import React, { useState } from 'react';
import {
  StatusOSC,
  STATUS_OSC_LABELS,
  STATUS_OSC_COLORS,
  STATUS_OSC_DESCRIPTIONS,
  STATUS_TRANSITIONS,
  isValidTransition,
} from '../types/statusOSC.types';

interface StatusOSCBadgeProps {
  status: StatusOSC;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusOSCBadge: React.FC<StatusOSCBadgeProps> = ({
  status,
  showDescription = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center rounded-full font-medium border ${STATUS_OSC_COLORS[status]} ${sizeClasses[size]}`}
        title={STATUS_OSC_DESCRIPTIONS[status]}
      >
        {STATUS_OSC_LABELS[status]}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-600 italic">{STATUS_OSC_DESCRIPTIONS[status]}</span>
      )}
    </div>
  );
};

interface StatusOSCPanelProps {
  statusAtual: StatusOSC;
  instituicaoId: string;
  onStatusChange?: (novoStatus: StatusOSC) => void;
  permiteAlteracao?: boolean;
}

export const StatusOSCPanel: React.FC<StatusOSCPanelProps> = ({
  statusAtual,
  instituicaoId,
  onStatusChange,
  permiteAlteracao = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusOSC | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);

  const statusDisponiveis = STATUS_TRANSITIONS[statusAtual] || [];

  const handleOpenModal = (status: StatusOSC) => {
    setSelectedStatus(status);
    setJustificativa('');
    setShowModal(true);
  };

  const handleConfirmar = async () => {
    if (!selectedStatus) return;

    // Validar justificativa obrigatória para SUSPENSA e REPROVADO
    if (
      (selectedStatus === StatusOSC.SUSPENSA || selectedStatus === StatusOSC.REPROVADO) &&
      !justificativa.trim()
    ) {
      alert('Justificativa obrigatória para este status');
      return;
    }

    setLoading(true);
    try {
      // Aqui você chamaria o service
      // await institutionService.alterarStatus(instituicaoId, selectedStatus, justificativa);

      if (onStatusChange) {
        onStatusChange(selectedStatus);
      }

      alert('Status alterado com sucesso!');
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: StatusOSC): string => {
    const icons: Record<StatusOSC, string> = {
      [StatusOSC.EM_CADASTRO]: '📝',
      [StatusOSC.DOCUMENTOS_INCOMPLETOS]: '📄',
      [StatusOSC.EM_ANALISE]: '🔍',
      [StatusOSC.APROVADO]: '✅',
      [StatusOSC.REPROVADO]: '❌',
      [StatusOSC.SUSPENSA]: '⏸️',
      [StatusOSC.INATIVA]: '🚫',
    };
    return icons[status];
  };

  const getActionButton = (status: StatusOSC) => {
    const buttonClasses: Record<StatusOSC, string> = {
      [StatusOSC.EM_CADASTRO]: 'bg-gray-600 hover:bg-gray-700',
      [StatusOSC.DOCUMENTOS_INCOMPLETOS]: 'bg-yellow-600 hover:bg-yellow-700',
      [StatusOSC.EM_ANALISE]: 'bg-blue-600 hover:bg-blue-700',
      [StatusOSC.APROVADO]: 'bg-green-600 hover:bg-green-700',
      [StatusOSC.REPROVADO]: 'bg-red-600 hover:bg-red-700',
      [StatusOSC.SUSPENSA]: 'bg-orange-600 hover:bg-orange-700',
      [StatusOSC.INATIVA]: 'bg-gray-600 hover:bg-gray-700',
    };

    return (
      <button
        key={status}
        onClick={() => handleOpenModal(status)}
        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${buttonClasses[status]}`}
      >
        <span className="text-lg">{getStatusIcon(status)}</span>
        {STATUS_OSC_LABELS[status]}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Status da OSC</h3>
        <StatusOSCBadge status={statusAtual} size="lg" />
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Status atual:</span> {STATUS_OSC_DESCRIPTIONS[statusAtual]}
        </p>
      </div>

      {permiteAlteracao && statusDisponiveis.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ações disponíveis:</h4>
          <div className="flex flex-wrap gap-2">
            {statusDisponiveis.map((status) => getActionButton(status))}
          </div>
        </div>
      )}

      {statusDisponiveis.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          Nenhuma ação manual disponível para este status.
        </div>
      )}

      {/* Modal de Confirmação */}
      {showModal && selectedStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{getStatusIcon(selectedStatus)}</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Alterar Status
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Você está alterando o status de:
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <StatusOSCBadge status={statusAtual} size="sm" />
                  <span className="text-gray-400">→</span>
                  <StatusOSCBadge status={selectedStatus} size="sm" />
                </div>
              </div>

              {(selectedStatus === StatusOSC.SUSPENSA || selectedStatus === StatusOSC.REPROVADO) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificativa *
                  </label>
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Digite a justificativa (obrigatório)"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmar}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Alterando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatusOSCTimelineProps {
  historico: Array<{
    statusAnterior: StatusOSC;
    statusNovo: StatusOSC;
    dataAlteracao: string;
    usuarioResponsavel: string;
    justificativa?: string;
  }>;
}

export const StatusOSCTimeline: React.FC<StatusOSCTimelineProps> = ({ historico }) => {
  if (!historico || historico.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum histórico de alteração de status
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {historico.map((entry, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {historico.length - index}
            </div>
            {index < historico.length - 1 && (
              <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
            )}
          </div>

          <div className="flex-1 pb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <StatusOSCBadge status={entry.statusAnterior} size="sm" />
                <span className="text-gray-400">→</span>
                <StatusOSCBadge status={entry.statusNovo} size="sm" />
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Data:</span>{' '}
                  {new Date(entry.dataAlteracao).toLocaleString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Responsável:</span> {entry.usuarioResponsavel}
                </div>
                {entry.justificativa && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <span className="font-medium">Justificativa:</span> {entry.justificativa}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

