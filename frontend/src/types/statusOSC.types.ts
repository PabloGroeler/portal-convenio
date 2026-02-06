/**
 * RF-02.3 - Status da OSC
 * Sistema de controle de status automático baseado no estado do cadastro e documentos
 */

export enum StatusOSC {
  EM_CADASTRO = 'EM_CADASTRO',
  DOCUMENTOS_INCOMPLETOS = 'DOCUMENTOS_INCOMPLETOS',
  EM_ANALISE = 'EM_ANALISE',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  SUSPENSA = 'SUSPENSA',
  INATIVA = 'INATIVA',
}

export const STATUS_OSC_LABELS: Record<StatusOSC, string> = {
  [StatusOSC.EM_CADASTRO]: 'Em Cadastro',
  [StatusOSC.DOCUMENTOS_INCOMPLETOS]: 'Documentos Incompletos',
  [StatusOSC.EM_ANALISE]: 'Em Análise',
  [StatusOSC.APROVADO]: 'Aprovado',
  [StatusOSC.REPROVADO]: 'Reprovado',
  [StatusOSC.SUSPENSA]: 'Suspensa',
  [StatusOSC.INATIVA]: 'Inativa',
};

export const STATUS_OSC_COLORS: Record<StatusOSC, string> = {
  [StatusOSC.EM_CADASTRO]: 'bg-gray-100 text-gray-800 border-gray-300',
  [StatusOSC.DOCUMENTOS_INCOMPLETOS]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [StatusOSC.EM_ANALISE]: 'bg-blue-100 text-blue-800 border-blue-300',
  [StatusOSC.APROVADO]: 'bg-green-100 text-green-800 border-green-300',
  [StatusOSC.REPROVADO]: 'bg-red-100 text-red-800 border-red-300',
  [StatusOSC.SUSPENSA]: 'bg-orange-100 text-orange-800 border-orange-300',
  [StatusOSC.INATIVA]: 'bg-gray-100 text-gray-600 border-gray-300',
};

export const STATUS_OSC_DESCRIPTIONS: Record<StatusOSC, string> = {
  [StatusOSC.EM_CADASTRO]: 'Status inicial quando o cadastro é criado, antes da inserção de documentos',
  [StatusOSC.DOCUMENTOS_INCOMPLETOS]: 'Status automático acionado assim que o primeiro documento é adicionado',
  [StatusOSC.EM_ANALISE]: 'Status automático acionado após inclusão de todos os documentos obrigatórios',
  [StatusOSC.APROVADO]: 'Cadastro validado e aprovado pelo Analista ou Administrador',
  [StatusOSC.REPROVADO]: 'Cadastro rejeitado. Retorna para o Operador corrigir',
  [StatusOSC.SUSPENSA]: 'Cadastro temporariamente suspenso (com justificativa obrigatória)',
  [StatusOSC.INATIVA]: 'OSC desativada permanentemente',
};

/**
 * Regras de transição de status
 */
export const STATUS_TRANSITIONS: Record<StatusOSC, StatusOSC[]> = {
  [StatusOSC.EM_CADASTRO]: [
    StatusOSC.DOCUMENTOS_INCOMPLETOS, // Ao adicionar primeiro documento
    StatusOSC.INATIVA, // Pode desativar
  ],
  [StatusOSC.DOCUMENTOS_INCOMPLETOS]: [
    StatusOSC.EM_ANALISE, // Quando todos obrigatórios enviados
    StatusOSC.INATIVA,
  ],
  [StatusOSC.EM_ANALISE]: [
    StatusOSC.APROVADO, // Analista aprova
    StatusOSC.REPROVADO, // Analista reprova
    StatusOSC.SUSPENSA, // Administrador suspende
    StatusOSC.INATIVA,
  ],
  [StatusOSC.APROVADO]: [
    StatusOSC.SUSPENSA, // Administrador suspende
    StatusOSC.INATIVA, // Administrador desativa
  ],
  [StatusOSC.REPROVADO]: [
    StatusOSC.DOCUMENTOS_INCOMPLETOS, // Operador corrige e reenvia
    StatusOSC.EM_ANALISE, // Diretamente se já estava completo
    StatusOSC.INATIVA,
  ],
  [StatusOSC.SUSPENSA]: [
    StatusOSC.EM_ANALISE, // Reativar para análise
    StatusOSC.APROVADO, // Reativar aprovado
    StatusOSC.INATIVA,
  ],
  [StatusOSC.INATIVA]: [
    // Não pode sair deste status automaticamente
  ],
};

/**
 * Verifica se uma transição de status é válida
 */
export const isValidTransition = (from: StatusOSC, to: StatusOSC): boolean => {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
};

/**
 * Calcula o status automático baseado nos documentos
 */
export interface StatusCalculationInput {
  temDocumentos: boolean;
  todosObrigatoriosEnviados: boolean;
  statusAtual: StatusOSC;
}

export const calcularStatusAutomatico = (input: StatusCalculationInput): StatusOSC => {
  const { temDocumentos, todosObrigatoriosEnviados, statusAtual } = input;

  // Status terminal - não muda automaticamente
  if (
    statusAtual === StatusOSC.APROVADO ||
    statusAtual === StatusOSC.SUSPENSA ||
    statusAtual === StatusOSC.INATIVA
  ) {
    return statusAtual;
  }

  // Status REPROVADO - mantém até operador agir
  if (statusAtual === StatusOSC.REPROVADO) {
    return statusAtual;
  }

  // Lógica automática baseada em documentos
  if (!temDocumentos) {
    return StatusOSC.EM_CADASTRO;
  }

  if (temDocumentos && !todosObrigatoriosEnviados) {
    return StatusOSC.DOCUMENTOS_INCOMPLETOS;
  }

  if (todosObrigatoriosEnviados) {
    return StatusOSC.EM_ANALISE;
  }

  return statusAtual;
};

/**
 * Histórico de mudança de status
 */
export interface StatusHistoryEntry {
  id?: string;
  statusAnterior: StatusOSC;
  statusNovo: StatusOSC;
  dataAlteracao: string;
  usuarioResponsavel: string;
  justificativa?: string;
  observacoes?: string;
}

/**
 * DTO para mudança manual de status
 */
export interface AlterarStatusDTO {
  novoStatus: StatusOSC;
  justificativa: string; // Obrigatória para SUSPENSA e REPROVADO
  observacoes?: string;
}

