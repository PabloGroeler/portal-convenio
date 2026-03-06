import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Tipos ────────────────────────────────────────────────────────────────────

type TipoExecucao = 'DIRETA' | 'INDIRETA' | 'AMBAS';

interface Etapa {
  ordem: string;
  status: string;
  responsavel: string;
  acao: string;
  descricao: string;
  tipo: TipoExecucao;
  resultado: { ok: string; nok?: string };
  artefatos: string[];
  perfis: string[]; // quais perfis participam desta etapa
  cor: string; // cor da etapa
}

// ── Definição completa do fluxo ───────────────────────────────────────────────

const ETAPAS: Etapa[] = [
  {
    ordem: '1',
    status: 'Recebido',
    responsavel: 'Orçamento',
    acao: 'SOLICITAR_APROVACAO / criação',
    descricao: 'Emenda chega ao sistema via importação ou cadastro manual. Orçamento faz triagem inicial e verifica viabilidade orçamentária e limites por parlamentar.',
    tipo: 'AMBAS',
    resultado: { ok: 'Iniciar análise de admissibilidade', nok: 'Arquivar / aguardar ajuste' },
    artefatos: ['Dados básicos da emenda', 'Dotação orçamentária'],
    perfis: ['ORCAMENTO', 'ADMIN'],
    cor: 'blue',
  },
  {
    ordem: '2',
    status: 'Em análise de admissibilidade',
    responsavel: 'Orçamento',
    acao: 'INICIAR_ANALISE',
    descricao: 'Orçamento avalia se a emenda é formalmente admissível: verifica enquadramento legal, limites anuais do parlamentar e compatibilidade com o orçamento municipal.',
    tipo: 'AMBAS',
    resultado: { ok: 'Aprovar admissibilidade → define secretariaDestino', nok: 'Devolver ao legislativo com justificativa' },
    artefatos: ['Parecer técnico/orçamentário', 'Apontamento de incompatibilidade (se negar)'],
    perfis: ['ORCAMENTO', 'ADMIN'],
    cor: 'amber',
  },
  {
    ordem: '3',
    status: 'Admissibilidade aprovada',
    responsavel: 'Orçamento → Secretaria',
    acao: 'APROVAR_ADMISSIBILIDADE',
    descricao: 'Admissibilidade aprovada pelo Orçamento. A secretaria de destino é definida nesta etapa. A emenda é encaminhada à Secretaria para análise de demanda.',
    tipo: 'AMBAS',
    resultado: { ok: 'Secretaria inicia análise de demanda', nok: '—' },
    artefatos: ['Secretaria de destino definida'],
    perfis: ['ORCAMENTO', 'SECRETARIA', 'ADMIN'],
    cor: 'emerald',
  },
  {
    ordem: '3b',
    status: 'Devolvida ao legislativo',
    responsavel: 'Orçamento',
    acao: 'REPROVAR_ADMISSIBILIDADE',
    descricao: 'Admissibilidade reprovada. A emenda retorna ao legislativo (câmara) com justificativa detalhada dos pontos não atendidos.',
    tipo: 'AMBAS',
    resultado: { ok: 'Fim do fluxo (pode ser reaberta)' },
    artefatos: ['Justificativa de inviabilidade'],
    perfis: ['ORCAMENTO', 'ADMIN'],
    cor: 'red',
  },
  {
    ordem: '4',
    status: 'Em análise de demanda',
    responsavel: 'Secretaria',
    acao: 'INICIAR_ANALISE_DEMANDA',
    descricao: 'Secretaria analisa a viabilidade técnica e operacional da demanda: capacidade de execução, prioridade, alinhamento com o plano municipal e legislação vigente (IN).',
    tipo: 'AMBAS',
    resultado: { ok: 'Aprovar demanda', nok: 'Devolver por incompatibilidade com justificativa' },
    artefatos: ['Justificativa de viabilidade', 'Requisitos operacionais/territoriais', 'Pontos não atendidos conforme IN (se negar)'],
    perfis: ['SECRETARIA', 'ADMIN'],
    cor: 'teal',
  },
  {
    ordem: '5',
    status: 'Análise de demanda aprovada',
    responsavel: 'Secretaria',
    acao: 'APROVAR_DEMANDA',
    descricao: 'Demanda aprovada. O roteamento depende do tipo de execução: Direta segue para execução sem etapa documental; Indireta vai para Convênios para análise documental.',
    tipo: 'AMBAS',
    resultado: { ok: 'Direta → Iniciado/Execução | Indireta → Convênios (documental)' },
    artefatos: ['Decisão de encaminhamento (Direta/Indireta)'],
    perfis: ['SECRETARIA', 'CONVENIOS', 'ADMIN'],
    cor: 'emerald',
  },
  {
    ordem: '5b',
    status: 'Devolvida por incompatibilidade de demanda',
    responsavel: 'Secretaria',
    acao: 'REPROVAR_DEMANDA',
    descricao: 'Demanda reprovada por incompatibilidade técnica ou operacional. Retorna ao Orçamento com justificativa dos pontos não atendidos conforme IN.',
    tipo: 'AMBAS',
    resultado: { ok: 'Retorna a Orçamento para ajustes' },
    artefatos: ['Justificativa dos pontos não atendidos (conforme IN)'],
    perfis: ['SECRETARIA', 'ORCAMENTO', 'ADMIN'],
    cor: 'red',
  },
  {
    ordem: '6',
    status: 'Em análise documental',
    responsavel: 'Convênios',
    acao: 'INICIAR_ANALISE_DOCUMENTAL',
    descricao: 'Exclusivo para execução Indireta. Convênios verifica toda a documentação da OSC/proponente: regularidade fiscal, estatuto, ata, certidões, plano de trabalho e demais exigências do termo de fomento.',
    tipo: 'INDIRETA',
    resultado: { ok: 'Aprovar documental → formalização', nok: 'Devolver por inviabilidade com checklist' },
    artefatos: ['Checklist de documentos do termo/convênio', 'Comprovações da OSC', 'Certidões negativas'],
    perfis: ['CONVENIOS', 'ADMIN'],
    cor: 'violet',
  },
  {
    ordem: '7',
    status: 'Análise documental aprovada',
    responsavel: 'Convênios',
    acao: 'APROVAR_DOCUMENTAL',
    descricao: 'Documentação aprovada. Convênios formaliza o termo de fomento/convênio e registra o empenho para início da execução.',
    tipo: 'INDIRETA',
    resultado: { ok: 'Formalização do termo e empenho → Iniciado' },
    artefatos: ['Minuta do termo de fomento', 'Empenho registrado'],
    perfis: ['CONVENIOS', 'JURIDICO', 'ADMIN'],
    cor: 'emerald',
  },
  {
    ordem: '7b',
    status: 'Devolvida por inviabilidade documental',
    responsavel: 'Convênios',
    acao: 'REPROVAR_DOCUMENTAL',
    descricao: 'Documentação reprovada. Retorna ao Orçamento/Secretaria com checklist dos documentos faltantes ou irregulares.',
    tipo: 'INDIRETA',
    resultado: { ok: 'Retorna a Orçamento/Secretaria com ajustes' },
    artefatos: ['Checklist de pendências documentais'],
    perfis: ['CONVENIOS', 'ORCAMENTO', 'ADMIN'],
    cor: 'red',
  },
  {
    ordem: '8',
    status: 'Iniciado',
    responsavel: 'Convênios (Indireta) / Secretaria (Direta)',
    acao: 'AGUARDAR_DETALHAMENTO',
    descricao: 'Emenda iniciada formalmente. Sinaliza ordem de início e empenho. O proponente/operador envia detalhamento, cronograma e documentos complementares.',
    tipo: 'AMBAS',
    resultado: { ok: 'Liquidação → Em execução' },
    artefatos: ['Ordem de início', 'Empenho', 'Cronograma de execução'],
    perfis: ['CONVENIOS', 'SECRETARIA', 'OPERADOR', 'ADMIN'],
    cor: 'indigo',
  },
  {
    ordem: '9',
    status: 'Em execução',
    responsavel: 'Execução financeira / Operador',
    acao: '(liquidação financeira)',
    descricao: 'Emenda em execução física e financeira. Medições, liquidações e pagamentos parciais são registrados. Convênios acompanha o andamento.',
    tipo: 'AMBAS',
    resultado: { ok: 'Pagamento total → Concluído' },
    artefatos: ['Medições/liquidações', 'Relatórios de execução', 'Notas fiscais'],
    perfis: ['CONVENIOS', 'SECRETARIA', 'OPERADOR', 'ADMIN'],
    cor: 'indigo',
  },
  {
    ordem: '10',
    status: 'Concluído',
    responsavel: 'Execução financeira',
    acao: 'APROVAR',
    descricao: 'Pagamento total efetuado. Ciclo de vida encerrado. Pode exigir prestação de contas e documentos de encerramento.',
    tipo: 'AMBAS',
    resultado: { ok: 'Fim de ciclo / Prestação de contas' },
    artefatos: ['Comprovantes de pagamento', 'Prestação de contas (se Indireta)', 'Documentos de encerramento'],
    perfis: ['CONVENIOS', 'SECRETARIA', 'OPERADOR', 'ADMIN', 'ORCAMENTO'],
    cor: 'emerald',
  },
];

// ── Mapa de cores ─────────────────────────────────────────────────────────────

const COR: Record<string, { bg: string; border: string; text: string; dot: string; badge: string }> = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-900',    dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-800' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-900',   dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-800' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
  red:     { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-900',     dot: 'bg-red-500',     badge: 'bg-red-100 text-red-800' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-900',    dot: 'bg-teal-500',    badge: 'bg-teal-100 text-teal-800' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-900',  dot: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-800' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-900',  dot: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-800' },
};

const PERFIL_LABEL: Record<string, string> = {
  ORCAMENTO: 'Orçamento',
  SECRETARIA: 'Secretaria',
  CONVENIOS: 'Convênios',
  JURIDICO: 'Jurídico',
  OPERADOR: 'Operador',
  ADMIN: 'Admin',
  GESTOR: 'Gestor',
};

const PERFIL_COR: Record<string, string> = {
  ORCAMENTO: 'bg-amber-100 text-amber-800 border-amber-200',
  SECRETARIA: 'bg-teal-100 text-teal-800 border-teal-200',
  CONVENIOS: 'bg-violet-100 text-violet-800 border-violet-200',
  JURIDICO: 'bg-blue-100 text-blue-800 border-blue-200',
  OPERADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
  GESTOR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

// ── Componente ────────────────────────────────────────────────────────────────

const WorkflowPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? '';

  const [filtroTipo, setFiltroTipo] = useState<'AMBAS' | 'DIRETA' | 'INDIRETA'>('AMBAS');
  const [filtroPerfil, setFiltroPerfil] = useState<string>(role || 'TODOS');
  const [expandida, setExpandida] = useState<string | null>(null);

  const etapasFiltradas = ETAPAS.filter(e => {
    const tipoOk = filtroTipo === 'AMBAS' || e.tipo === 'AMBAS' || e.tipo === filtroTipo;
    const perfilOk = filtroPerfil === 'TODOS' || e.perfis.includes(filtroPerfil);
    return tipoOk && perfilOk;
  });

  const toggle = (ordem: string) => setExpandida(v => v === ordem ? null : ordem);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ── Cabeçalho ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fluxo de Tramitação de Emendas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ciclo de vida completo das emendas por perfil · Execução Direta e Indireta
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Tipo de execução</p>
          <div className="flex gap-1.5">
            {(['AMBAS', 'DIRETA', 'INDIRETA'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                  filtroTipo === t
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t === 'AMBAS' ? 'Todas' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Perfil</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroPerfil('TODOS')}
              className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                filtroPerfil === 'TODOS'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {Object.keys(PERFIL_LABEL).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setFiltroPerfil(p)}
                className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                  filtroPerfil === p
                    ? 'bg-gray-900 text-white border-gray-900'
                    : `${PERFIL_COR[p]} hover:opacity-80`
                }`}
              >
                {PERFIL_LABEL[p]}
                {p === role && ' (você)'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Legenda ── */}
      {role && (
        <div className={`rounded-xl p-3 border text-sm flex items-center gap-2 ${PERFIL_COR[role] ?? 'bg-gray-50 border-gray-200 text-gray-700'}`}>
          <span className="text-base">🧭</span>
          <span>
            Você está logado como <strong>{PERFIL_LABEL[role] ?? role}</strong>.
            {filtroPerfil === 'TODOS'
              ? ' Use os filtros de perfil para ver apenas suas etapas.'
              : filtroPerfil === role
                ? ' Exibindo apenas as etapas do seu perfil.'
                : ` Visualizando etapas do perfil: ${PERFIL_LABEL[filtroPerfil] ?? filtroPerfil}.`}
          </span>
          {filtroPerfil !== role && (
            <button
              type="button"
              onClick={() => setFiltroPerfil(role)}
              className="ml-auto text-xs underline whitespace-nowrap"
            >
              Ver meu fluxo
            </button>
          )}
        </div>
      )}

      {/* ── Linha do tempo ── */}
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 z-0" />

        <div className="space-y-3">
          {etapasFiltradas.map((etapa, idx) => {
            const c = COR[etapa.cor] ?? COR.blue;
            const aberta = expandida === etapa.ordem;
            const euParticipo = etapa.perfis.includes(role);

            return (
              <div key={etapa.ordem} className="relative pl-14">
                {/* Dot */}
                <div className={`absolute left-3.5 top-4 w-4 h-4 rounded-full border-2 border-white z-10 ${c.dot} ${euParticipo ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} />

                {/* Número */}
                <div className="absolute left-0 top-3 w-7 text-center text-[10px] font-bold text-gray-400">
                  {etapa.ordem}
                </div>

                {/* Card */}
                <div className={`border rounded-xl overflow-hidden ${c.border} ${euParticipo ? 'shadow-md' : 'shadow-sm opacity-90'}`}>

                  {/* Cabeçalho clicável */}
                  <button
                    type="button"
                    onClick={() => toggle(etapa.ordem)}
                    className={`w-full text-left px-4 py-3 ${c.bg} flex items-start justify-between gap-3`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${c.text}`}>{etapa.status}</span>
                        {etapa.tipo !== 'AMBAS' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-white">
                            {etapa.tipo}
                          </span>
                        )}
                        {euParticipo && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                            sua etapa
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {etapa.perfis.filter(p => p !== 'ADMIN').map(p => (
                          <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${PERFIL_COR[p] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {PERFIL_LABEL[p] ?? p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg className={`h-4 w-4 shrink-0 mt-0.5 text-gray-500 transition-transform ${aberta ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Corpo expandido */}
                  {aberta && (
                    <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4 text-sm">

                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Descrição</p>
                        <p className="text-gray-700 leading-relaxed">{etapa.descricao}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Responsável</p>
                          <p className="text-gray-800 font-medium">{etapa.responsavel}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Ação no sistema</p>
                          <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{etapa.acao}</code>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">✅ Se aprovado</p>
                          <p className="text-emerald-700">{etapa.resultado.ok}</p>
                        </div>
                        {etapa.resultado.nok && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">❌ Se negado</p>
                            <p className="text-red-700">{etapa.resultado.nok}</p>
                          </div>
                        )}
                      </div>

                      {etapa.artefatos.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">📎 Artefatos / Documentos</p>
                          <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                            {etapa.artefatos.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Atalho para emendas nesse status */}
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/emendas?status=${encodeURIComponent(etapa.status)}`)}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" clipRule="evenodd"/>
                          </svg>
                          Ver emendas com status "{etapa.status}"
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {etapasFiltradas.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold">Nenhuma etapa encontrada para os filtros selecionados.</p>
        </div>
      )}

    </div>
  );
};

export default WorkflowPage;



