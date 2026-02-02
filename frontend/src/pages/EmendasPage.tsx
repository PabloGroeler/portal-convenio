import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EmendasStats from '../components/EmendasStats';
import emendaService from '../services/emendaService';
import institutionService, { type InstitutionDTO } from '../services/institutionService';
import councilorService, { type CouncilorDTO } from '../services/councilorService';
import tipoEmendaService, { type TipoEmendaDTO } from '../services/tipoEmendaService';
import type { EmendaHistoricoDTO } from '../services/emendaService';

interface Emenda {
  id: string;
  councilorId?: string;
  councilorName?: string;
  officialCode?: string;
  date?: string;
  value: string;
  classification?: string;
  esfera?: string;
  existeConvenio?: boolean;
  numeroConvenio?: string;
  anoConvenio?: number;
  category?: string;
  status: string;
  institutionId?: string;
  institutionName?: string;
  institutionEmail?: string;
  signedLink?: string;
  attachments?: string[];
  description?: string;
  objectDetail?: string;
}

const EmendasPage: React.FC = () => {
  const [emendas, setEmendas] = useState<Emenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [detailFilter, setDetailFilter] = useState('Todas');
  const [selectedEmenda, setSelectedEmenda] = useState<Emenda | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [historico, setHistorico] = useState<EmendaHistoricoDTO[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [despachoObservacao, setDespachoObservacao] = useState('');
  const [executingAction, setExecutingAction] = useState(false);
  const [saving, setSaving] = useState(false);

  // Track last action taken per emenda to prevent duplicate consecutive actions
  const [lastActionByEmenda, setLastActionByEmenda] = useState<Record<string, string>>({});

  // Current emenda being created/edited/viewed in the modal
  const [editForm, setEditForm] = useState<Emenda>({
    id: '',
    councilorId: '',
    officialCode: '',
    date: new Date().toISOString().split('T')[0],
    value: 'R$ 0,00',
    classification: '',
    esfera: 'Municipal',
    existeConvenio: false,
    numeroConvenio: '',
    anoConvenio: undefined,
    category: '',
    status: 'Recebido',
    institutionId: '',
    signedLink: '',
    attachments: [],
    description: '',
    objectDetail: '',
  });

  // Dropdown data for councilor/institution selectors
  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [councilors, setCouncilors] = useState<CouncilorDTO[]>([]);
  const [tiposEmenda, setTiposEmenda] = useState<TipoEmendaDTO[]>([]);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [councilorSearch, setCouncilorSearch] = useState('');

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  // Fetch emendas from API on mount
  useEffect(() => {
    const fetchEmendas = async () => {
      setLoading(true);
      try {
        console.log('[EmendasPage] Fetching emendas from API...');
        const data = await emendaService.listWithDetails();
        console.log('[EmendasPage] Received data:', data);
        // Map API data to frontend Emenda interface
        const mappedEmendas: Emenda[] = data.map((e) => {
          const status = (e.status || 'Recebido') as string;
          const safeStatus = typeof status === 'string' && status.trim() ? status : 'Recebido';
          return ({
            id: e.id || '',
            councilorId: e.councilorId,
            councilorName: e.councilorName,
            councilorPoliticalParty: e.councilorPoliticalParty,
            officialCode: e.officialCode,
            date: e.date,
            value: e.value ? `R$ ${e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
            classification: e.classification,
            esfera: (e as any).esfera,
            existeConvenio: (e as any).existeConvenio,
            numeroConvenio: (e as any).numeroConvenio,
            anoConvenio: (e as any).anoConvenio,
            category: e.category,
            status: safeStatus,
            institutionId: e.institutionId,
            institutionName: e.institutionName,
            signedLink: e.signedLink,
            attachments: Array.isArray(e.attachments) ? e.attachments : [],
            description: e.description,
            objectDetail: e.objectDetail,
          });
        });
        console.log('[EmendasPage] Mapped emendas:', mappedEmendas);
        setEmendas(mappedEmendas);
      } catch (err) {
        console.error('[EmendasPage] Error fetching emendas:', err);
        // Keep empty array if API fails
        setEmendas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmendas();
  }, []);

  // Load "Tipos de Emenda" catalog on page mount so the select always has data.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tipos = await tipoEmendaService.list();
        if (!cancelled) setTiposEmenda(tipos);
      } catch (e) {
        console.error('[EmendasPage] Error fetching tipos de emenda:', e);
        if (!cancelled) setTiposEmenda([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // close modal on Escape globally
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEmenda(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // manage focus and scroll locking when modal opens/closes
  useEffect(() => {
    if (selectedEmenda || isCreateMode) {
      // store previously focused element
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      // prevent background scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus close button after paint
      setTimeout(() => closeButtonRef.current?.focus(), 0);
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
    // restore focus when closed
    if (previousActiveRef.current) {
      previousActiveRef.current.focus();
      previousActiveRef.current = null;
    }
    return undefined;
  }, [selectedEmenda, isCreateMode]);

  // Load institutions/councilors whenever the modal opens (create or view/edit)
  useEffect(() => {
    const shouldLoad = isCreateMode || isEditMode || selectedEmenda != null;
    if (!shouldLoad) return;

    let cancelled = false;
    (async () => {
      try {
        const [inst, coun] = await Promise.all([
          institutionService.list(),
          councilorService.list(),
        ]);
        if (cancelled) return;
        setInstitutions(inst);
        setCouncilors(coun);

        // Tipos de emenda (JIRA 3)
        try {
          const tipos = await tipoEmendaService.list();
          if (!cancelled) setTiposEmenda(tipos);
        } catch {
          if (!cancelled) setTiposEmenda([]);
        }
      } catch (e) {
        if (cancelled) return;
        // keep empty arrays on failure
        setInstitutions([]);
        setCouncilors([]);
        setTiposEmenda([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isCreateMode, isEditMode, selectedEmenda]);

  const openCreateModal = () => {
    setEditForm({
      id: '',
      councilorId: '',
      officialCode: '',
      date: new Date().toISOString().split('T')[0],
      value: 'R$ 0,00',
      classification: '',
      esfera: 'Municipal',
      existeConvenio: false,
      numeroConvenio: '',
      anoConvenio: undefined,
      category: '',
      status: 'Recebido',
      institutionId: '',
      signedLink: '',
      attachments: [],
      description: '',
      objectDetail: '',
    });
    setIsCreateMode(true);
  };

  const openViewModal = async (emenda: Emenda) => {
    setSelectedEmenda(emenda);
    setEditForm({ ...emenda });
    setIsCreateMode(false);
    setDespachoObservacao('');

    // Fetch history for this emenda
    if (emenda.id) {
      setLoadingHistorico(true);
      try {
        const hist = await emendaService.getHistorico(emenda.id);
        setHistorico(hist);
      } catch (err) {
        console.error('Error fetching history:', err);
        setHistorico([]);
      } finally {
        setLoadingHistorico(false);
      }
    }
  };

  const closeModal = () => {
    // Clear last action tracking for the emenda being closed
    if (selectedEmenda?.id) {
      setLastActionByEmenda((prev) => {
        const updated = { ...prev };
        delete updated[selectedEmenda.id];
        return updated;
      });
    }

    setSelectedEmenda(null);
    setIsCreateMode(false);
    setIsEditMode(false);
    setHistorico([]);
    setDespachoObservacao('');
  };

  const handleFormChange = (field: keyof Emenda, value: string | number | boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: string): string => {
    // Remove any non-numeric characters except comma and dot
    let cleaned = value.replace(/[^\d.,]/g, '');
    // Replace comma with dot for parsing
    cleaned = cleaned.replace(',', '.');
    // Parse to number
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 'R$ 0,00';
    // Format to Brazilian currency
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleValorBlur = () => {
    if (editForm.value) {
      const formatted = formatCurrency(editForm.value);
      setEditForm((prev) => ({ ...prev, value: formatted }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // JIRA 3: tipo de emenda is mandatory (using existing 'classification' field for now).
      if (!(editForm.classification ?? '').trim()) {
        alert('Selecione o tipo de emenda.');
        return;
      }

      // Parse value string to number (remove R$ and formatting)
      let valueNum = 0;
      if (editForm.value) {
        const cleanedValue = editForm.value.replace(/[R$\s.]/g, '').replace(',', '.');
        valueNum = parseFloat(cleanedValue) || 0;
      }

      const emendaDTO = {
        councilorId: editForm.councilorId,
        officialCode: editForm.officialCode,
        date: editForm.date,
        value: valueNum,
        // NOTE: mapped as codigo (e.g. EMENDA_PIX) until backend adds a dedicated field (JIRA 4/5).
        classification: editForm.classification,
        esfera: editForm.esfera,
        existeConvenio: Boolean(editForm.existeConvenio),
        numeroConvenio: editForm.existeConvenio ? (editForm.numeroConvenio || '').trim() : null,
        anoConvenio: editForm.existeConvenio ? (editForm.anoConvenio ?? null) : null,
        category: editForm.category,
        status: editForm.status,
        institutionId: editForm.institutionId,
        signedLink: editForm.signedLink,
        attachments: (editForm.attachments || []).filter((a) => (a ?? '').trim().length > 0),
        description: editForm.description,
        objectDetail: editForm.objectDetail,
      };

      let result;
      if (editForm.id) {
        // Update existing emenda
        console.log('[EmendasPage] Updating emenda:', emendaDTO);
        result = await emendaService.update(editForm.id, emendaDTO);
        console.log('[EmendasPage] Updated emenda:', result);
      } else {
        // Create new emenda
        console.log('[EmendasPage] Creating emenda:', emendaDTO);
        result = await emendaService.create(emendaDTO);
        console.log('[EmendasPage] Created emenda:', result);
      }

      // Enrich with details so the UI shows names instead of IDs immediately.
      // Prefer server-enriched endpoint, fallback to local lookup.
      try {
        if (result?.id) {
          const detailed = await emendaService.getByIdWithDetails(result.id);
          result = { ...result, ...detailed };
        }
      } catch {
        // ignore and fallback to local lookups below
      }

      const institutionFromList = result.institutionId
        ? institutions.find((i) => i.institutionId === result.institutionId)
        : undefined;
      const councilorFromList = result.councilorId
        ? councilors.find((c) => c.councilorId === result.councilorId)
        : undefined;

      const institutionName =
        result.institutionName ||
        editForm.institutionName ||
        (institutionFromList?.razaoSocial ?? (institutionFromList as any)?.name);
      const councilorName =
        result.councilorName ||
        editForm.councilorName ||
        councilorFromList?.fullName;

      // Map to local state
      const mappedEmenda: Emenda = {
        id: result.id || '',
        councilorId: result.councilorId,
        councilorName,
        officialCode: result.officialCode,
        date: result.date,
        value: result.value ? `R$ ${result.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
        classification: result.classification,
        esfera: (result as any).esfera,
        existeConvenio: (result as any).existeConvenio,
        numeroConvenio: (result as any).numeroConvenio,
        anoConvenio: (result as any).anoConvenio,
        category: result.category,
        status: (result.status || 'Recebido') as string,
        institutionId: result.institutionId,
        institutionName,
        signedLink: result.signedLink,
        attachments: Array.isArray(result.attachments) ? result.attachments : [],
        description: result.description,
        objectDetail: result.objectDetail,
      };

      if (editForm.id) {
        // Update in list
        setEmendas((prev) => prev.map((e) => (e.id === editForm.id ? mappedEmenda : e)));
      } else {
        // Add to list
        setEmendas((prev) => [mappedEmenda, ...prev]);
      }

      closeModal();
    } catch (err) {
      console.error('[EmendasPage] Error saving emenda:', err);
      alert('Erro ao salvar emenda');
    } finally {
      setSaving(false);
    }
  };

  const handleAcao = async (acao: 'APROVAR' | 'DEVOLVER' | 'REPROVAR') => {
    if (!selectedEmenda || !selectedEmenda.id) {
      alert('Emenda inválida ou não selecionada');
      return;
    }

    // Check if this is a duplicate action (same action on same emenda)
    const lastAction = lastActionByEmenda[selectedEmenda.id];
    if (lastAction === acao) {
      console.log(`[EmendasPage] Duplicate action ${acao} ignored for emenda ${selectedEmenda.id}`);
      alert(`A ação "${acao}" já foi executada nesta emenda. Escolha uma ação diferente ou feche e reabra a emenda.`);
      return;
    }

    // Prevent multiple simultaneous actions
    if (executingAction) {
      console.log('[EmendasPage] Action already in progress, ignoring click');
      return;
    }

    setExecutingAction(true);
    try {
      console.log(`[EmendasPage] Executing action ${acao} on emenda ID ${selectedEmenda.id}`);
      const updatedEmenda = await emendaService.executarAcao(selectedEmenda.id, {
        acao,
        observacao: despachoObservacao,
      });
      console.log('[EmendasPage] Action result:', updatedEmenda);

      // Record this action as the last one for this emenda
      setLastActionByEmenda((prev) => ({
        ...prev,
        [selectedEmenda.id]: acao,
      }));

      // Update the emenda in the local state
      const updatedLocal: Emenda = {
        ...selectedEmenda,
        status: (updatedEmenda.status || selectedEmenda.status) as string,
      };
      setSelectedEmenda(updatedLocal);
      setEditForm(updatedLocal);

      // Update emendas list
      setEmendas((prev) =>
        prev.map((e) => (e.id === selectedEmenda.id ? updatedLocal : e))
      );

      // Refresh history
      const hist = await emendaService.getHistorico(selectedEmenda.id);
      setHistorico(hist);

      // Clear observation
      setDespachoObservacao('');
    } catch (err: any) {
      console.error('[EmendasPage] Error executing action:', err);
      const status = err?.response?.status;
      if (status === 404) {
        alert('Emenda não encontrada no servidor. Ela pode ter sido excluída.');
        // Refresh the list to get current data
        try {
          const data = await emendaService.list();
          const mappedEmendas: Emenda[] = data.map((e) => ({
            id: e.id || '',
            councilorId: e.councilorId,
            officialCode: e.officialCode,
            date: e.date,
            value: e.value ? `R$ ${e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
            classification: e.classification,
            category: e.category,
            status: (e.status || 'Recebido') as string,
            institutionId: e.institutionId,
            signedLink: e.signedLink,
            description: e.description,
            objectDetail: e.objectDetail,
          }));
          setEmendas(mappedEmendas);
        } catch (refreshErr) {
          console.error('[EmendasPage] Error refreshing list:', refreshErr);
        }
        closeModal();
      } else {
        alert(`Erro ao executar ação: ${err?.response?.data?.error || err.message || 'Erro desconhecido'}`);
      }
    } finally {
      setExecutingAction(false);
    }
  };

  const filtered = emendas.filter((e) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const hay = [
        e.status,
        e.description,
        e.officialCode,
        e.institutionName,
        e.institutionId,
        e.councilorName,
        e.councilorId,
        e.category,
        e.classification,
      ]
        .filter((v): v is string => Boolean(v && String(v).trim()))
        .join(' ')
        .toLowerCase();

      if (!hay.includes(q)) return false;
    }

    // NOTE: year filter is still based on the legacy data model; keep it until the API provides a year field.
    if (year && String((e as any).year) !== year) return false;

    // status filter relies on the emenda "status" field with NEW lifecycle values
    if (statusFilter && statusFilter !== 'Todas') {
      const st = (e.status || '').trim().toLowerCase();
      const sf = statusFilter.trim().toLowerCase();
      if (st !== sf) return false;
    }

    // detail filter
    if (detailFilter && detailFilter !== 'Todas') {
      const hasDetail = Boolean((e.objectDetail ?? '').trim());
      if (detailFilter === 'Com Detalhamento' && !hasDetail) return false;
      if (detailFilter === 'Sem Detalhamento' && hasDetail) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Summary stats (from provided file) */}
      <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="max-w-6xl mx-auto">
              <EmendasStats
                total={emendas.length}
                pending={emendas.filter((e) => e.status === 'Recebido' || e.status === 'Iniciado').length}
                approved={emendas.filter((e) => e.status === 'Concluído').length}
                toRectify={emendas.filter((e) => e.status === 'Devolvido').length}
                rejected={0}
              />
            </div>

          {/* Page actions (moved from header) */}
          <div className="mt-6 mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              + Nova Emenda
            </button>

            <Link
              to="/painel/institutions"
              className="inline-flex items-center px-4 py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              Gerenciar Instituições
            </Link>

            <Link
              to="/painel/councilors"
              className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Gerenciar Parlamentares
            </Link>
          </div>

           <div className="bg-white rounded shadow p-6">
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div className="flex items-center gap-3">
               <input
                 type="text"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Buscar por descrição, código, instituição ou parlamentar..."
                 className="border rounded px-3 py-2 w-72"
               />

               <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
                 <option>Todas</option>
                 <option>Recebido</option>
                 <option>Iniciado</option>
                 <option>Em execução</option>
                 <option>Concluído</option>
                 <option>Devolvido</option>
               </select>

               <select value={detailFilter} onChange={(e) => setDetailFilter(e.target.value)} className="border rounded px-3 py-2">
                 <option>Todas</option>
                 <option>Com Detalhamento</option>
                 <option>Sem Detalhamento</option>
               </select>

               <select
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="border rounded px-3 py-2"
               >
                 <option value="">Todos os anos</option>
                 <option value="2026">2026</option>
                 <option value="2025">2025</option>
                 <option value="2024">2024</option>
                 <option value="2023">2023</option>
                 <option value="2022">2022</option>
               </select>
             </div>

             <div className="flex gap-2">
               <button className="px-4 py-2 bg-blue-600 text-white rounded">Pesquisar</button>
               <button
                 onClick={() => {
                   setQuery('');
                   setYear('');
                   setStatusFilter('Todas');
                   setDetailFilter('Todas');
                 }}
                 className="px-4 py-2 border rounded"
               >
                 Limpar
               </button>
             </div>
           </div>

           <div className="mt-6">
             {loading ? (
               <p className="text-gray-500">Carregando emendas...</p>
             ) : filtered.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-gray-500 mb-4">
                   {emendas.length === 0
                     ? 'Nenhuma emenda cadastrada ainda. Clique em "Nova Emenda" para criar uma.'
                     : 'Nenhuma emenda encontrada com os filtros selecionados.'}
                 </p>
                 {emendas.length === 0 && (
                   <button
                     onClick={openCreateModal}
                     className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                   >
                     + Nova Emenda
                   </button>
                 )}
               </div>
             ) : (
               <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                 {filtered.map((e) => (
                   <div key={e.id} className="border rounded-lg p-4 bg-white shadow-sm">
                     {/* Status + Institution */}
                     <div className="flex items-start justify-between gap-3">
                       <div className="min-w-0">
                         <div className="text-xs text-gray-500">Instituição</div>
                         <div className="font-semibold text-gray-900 truncate">
                           {e.institutionName || '—'}
                         </div>
                       </div>

                       <span
                         className={`shrink-0 px-2 py-1 text-xs rounded-full ${
                           (e.status || '').toLowerCase() === 'concluído'
                             ? 'bg-emerald-100 text-emerald-800'
                             : (e.status || '').toLowerCase() === 'devolvido'
                               ? 'bg-red-100 text-red-800'
                               : (e.status || '').toLowerCase() === 'recebido'
                                 ? 'bg-blue-100 text-blue-800'
                                 : (e.status || '').toLowerCase() === 'iniciado'
                                   ? 'bg-amber-100 text-amber-800'
                                   : 'bg-gray-100 text-gray-800'
                         }`}
                       >
                         {e.status}
                       </span>
                     </div>

                     {/* Brief description */}
                     <div className="mt-3">
                       <div className="text-xs text-gray-500">Descrição</div>
                       <p className="text-sm text-gray-700 line-clamp-2">
                         {e.description || '—'}
                       </p>
                     </div>

                     {/* Category */}
                     <div className="mt-3">
                       <div className="text-xs text-gray-500">Categoria</div>
                       <div className="text-sm font-medium text-gray-900">
                         {e.category || '—'}
                       </div>
                     </div>

                     <hr className="my-4 border-gray-200" />

                     {/* Value + Parlamentar */}
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <div className="text-xs text-gray-500">Valor</div>
                         <div className="text-sm font-semibold text-gray-900">{e.value}</div>
                       </div>
                       <div className="text-right">
                         <div className="text-xs text-gray-500">Parlamentar</div>
                         <div className="text-sm font-semibold text-gray-900 truncate">
                           {e.councilorName || e.councilorId || '—'}
                         </div>
                       </div>
                     </div>

                     {/* Official code */}
                     <div className="mt-3 text-sm text-gray-700">
                       <span className="text-gray-500">Emenda:</span>{' '}
                       <span className="font-mono font-medium">{e.officialCode || '—'}</span>
                     </div>

                     <div className="mt-4 flex gap-2">
                       <button
                         type="button"
                         onClick={() => openViewModal(e)}
                         className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                       >
                         Visualizar
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       </div>

       {/* Modal: show details when selectedEmenda is set or create mode */}
       {(selectedEmenda || isCreateMode) && (
         <div
           role="dialog"
           aria-modal="true"
           aria-labelledby="emenda-title"
           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
           onClick={(e) => {
             // close when clicking the overlay (not the modal content)
             if (e.target === e.currentTarget) closeModal();
           }}
         >
           <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
             {/* Header Section */}
             <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-100 bg-gray-50/50">
               <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-purple-200">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                   <line x1="16" y1="13" x2="8" y2="13"></line>
                   <line x1="16" y1="17" x2="8" y2="17"></line>
                   <polyline points="10 9 9 9 8 9"></polyline>
                 </svg>
               </div>
               <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
                 {isCreateMode
                   ? 'Nova Emenda'
                   : (editForm.institutionName ||
                      institutions.find((i) => i.institutionId === editForm.institutionId)?.razaoSocial ||
                      (institutions as any).find?.((i: any) => i.institutionId === editForm.institutionId)?.name ||
                       'Instituição')}
               </span>
               <h2 className="text-xl font-bold text-gray-900 text-center leading-tight mb-1">
                 {isCreateMode
                   ? 'Criar Nova Emenda'
                   : (editForm.officialCode || 'Detalhes da Emenda')}
               </h2>
               <div className="mt-2 flex gap-2">
                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                   (editForm.status || '').toLowerCase() === 'concluído' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                   (editForm.status || '').toLowerCase() === 'devolvido' ? 'bg-red-100 text-red-800 border-red-200' :
                   (editForm.status || '').toLowerCase() === 'em execução' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                   (editForm.status || '').toLowerCase() === 'iniciado' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                   'bg-gray-100 text-gray-700 border-gray-200'
                 }`}>
                   Status: {editForm.status}
                 </span>
               </div>
             </div>

             {/* Close button */}
             <button
               ref={closeButtonRef}
               type="button"
               onClick={closeModal}
               className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
               aria-label="Fechar"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                 <path d="M18 6 6 18"></path>
                 <path d="m6 6 12 12"></path>
               </svg>
             </button>

             {/* Edit/Save button for non-create mode */}
             {!isCreateMode && (
               <div className="absolute left-4 top-4 flex gap-2">
                 {isEditMode ? (
                   <>
                     <button
                       type="button"
                       onClick={handleSave}
                       disabled={saving}
                       className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50"
                     >
                       {saving ? 'Salvando...' : 'Salvar'}
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         setIsEditMode(false);
                         if (selectedEmenda) {
                           setEditForm({ ...selectedEmenda });
                         }
                       }}
                       className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                     >
                       Cancelar
                     </button>
                   </>
                 ) : (
                   <button
                     type="button"
                     onClick={() => setIsEditMode(true)}
                     className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                   >
                     Editar
                   </button>
                 )}
               </div>
             )}

             {/* Content Section */}
             <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start overflow-y-auto">
               {/* Left Column - Main Content */}
               <div className="lg:col-span-8 space-y-6">
                 {/* Dados da Emenda */}
                 <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 relative">
                   <h3 className="text-base font-semibold text-slate-800 mb-4 border-b pb-2">Dados da Emenda</h3>
                   <div className="space-y-4">
                     {/* Task-10: Número e Exercício */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <label className="text-xs text-slate-500 uppercase block">
                           Número da Emenda <span className="text-red-500">*</span>
                         </label>
                         {(isCreateMode || isEditMode) ? (
                           <input
                            type="text"
                            value={editForm.officialCode || ''}
                            onChange={(e) => handleFormChange('officialCode', e.target.value)}
                            type="number"
                            value={editForm.numeroEmenda || ''}
                            onChange={(e) => handleFormChange('numeroEmenda', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="mt-1 w-full border rounded px-3 py-2 text-sm"
                            placeholder="Ex: 004-132-2025"
                            min="1"
                            required
                          />
                        )    : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.numeroEmenda || '—'}</span>
                         )}
                         <p className="text-xs text-slate-400 mt-1">Deve ser maior que zero e único por exercício</p>
                       </div>
                       <div>
                        <span className="text-xs text-slate-500 uppercase block">Valor</span>
                        {isCreateMode ? (
                          <input
                            type="text"
                            value={editForm.value}
                            onChange={(e) => handleFormChange('value', e.target.value)}
                            onBlur={handleValorBlur}
                            className="mt-1 w-full border rounded px-3 py-2 text-sm"
                            placeholder="R$ 0,00"
                          />
                        ) : (
                          <span className="font-mono text-slate-700 font-medium">{editForm.value}</span>
                        )}
                      </div>
                        <div>
                         <label className="text-xs text-slate-500 uppercase block">
                           Exercício (Ano) <span className="text-red-500">*</span>
                         </label>
                         {(isCreateMode || isEditMode) ? (
                           <input
                             type="number"
                             value={editForm.exercicio || new Date().getFullYear()}
                             onChange={(e) => handleFormChange('exercicio', e.target.value ? parseInt(e.target.value) : undefined)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Ex: 2026"
                             min="2020"
                             max="2099"
                             required
                           />
                         ) : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.exercicio || '—'}</span>
                         )}
                       </div>
                     </div>

                     {/* Descrição Inicial */}
                     <div>
                       <label className="text-xs text-slate-500 uppercase block">Objeto da Emenda (máx. 250 caracteres)</label>
                       {(isCreateMode || isEditMode) ? (
                         <>
                           <textarea
                             value={editForm.description || ''}
                             onChange={(e) => {
                               if (e.target.value.length <= 250) {
                                 handleFormChange('description', e.target.value);
                               }
                             }}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm min-h-[60px]"
                             placeholder="Descrição da emenda..."
                             maxLength={250}
                           />
                           <p className="text-xs text-slate-400 mt-1">
                             {(editForm.description || '').length}/250 caracteres
                           </p>
                         </>
                       ) : (
                         <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap break-words">{editForm.description || '—'}</p>
                       )}
                     </div>

                     {/* Objeto Detalhado */}
                     <div>
                       <span className="text-xs text-slate-500 uppercase block">Objeto Detalhado</span>
                       {isCreateMode ? (
                         <textarea
                           value={editForm.objectDetail || ''}
                           onChange={(e) => handleFormChange('objectDetail', e.target.value)}
                           className="mt-1 w-full border rounded px-3 py-2 text-sm min-h-[100px]"
                           placeholder="Detalhamento do objeto da emenda..."
                         />
                       ) : (
                         <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 min-h-[60px] whitespace-pre-wrap mt-1">
                           {editForm.objectDetail || '—'}
                         </div>
                       )}
                     </div>

                     {/* Data, Esfera e Tipo de Emenda */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Data</span>
                         {isCreateMode ? (
                           <input
                             type="date"
                             value={editForm.date || ''}
                             onChange={(e) => handleFormChange('date', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                           />
                         ) : (
                           <span className="text-slate-700 text-sm">{editForm.date ? new Date(editForm.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</span>
                         )}
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Esfera</span>
                         {(isCreateMode || isEditMode) ? (
                           <select
                             value={editForm.esfera || ''}
                             onChange={(e) => handleFormChange('esfera', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
                             required
                           >
                             <option value="">Selecione a esfera</option>
                             <option value="Municipal">Municipal</option>
                             <option value="Estadual">Estadual</option>
                             <option value="Federal">Federal</option>
                           </select>
                         ) : (
                           <span className="text-slate-700 text-sm">{editForm.esfera || '—'}</span>
                         )}
                       </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase block">Tipo de Emenda</span>
                          {(isCreateMode || isEditMode) ? (
                            <select
                              value={editForm.classification || ''}
                              onChange={(e) => handleFormChange('classification', e.target.value)}
                              className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
                              required
                            >
                              <option value="">Selecione o tipo</option>
                              {tiposEmenda.map((t) => (
                                <option key={t.codigo} value={t.codigo}>
                                  {t.nome}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-700 text-sm">
                              {tiposEmenda.find((t) => t.codigo === editForm.classification)?.nome || editForm.classification || '—'}
                            </span>
                          )}
                        </div>
                     </div>

                     {/* Categoria */}
                     <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Categoria</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.category || ''}
                             onChange={(e) => handleFormChange('category', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Ex: SAÚDE"
                           />
                         ) : (
                           <span className="text-slate-700 text-sm">{editForm.category || '—'}</span>
                         )}
                       </div>
                     </div>

                     {/* Task-10: Previsão de Conclusão e Situação */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <label className="text-xs text-slate-500 uppercase block">Previsão de Conclusão</label>
                         {(isCreateMode || isEditMode) ? (
                           <input
                             type="date"
                             value={editForm.previsaoConclusao || ''}
                             onChange={(e) => handleFormChange('previsaoConclusao', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                           />
                         ) : (
                           <span className="text-slate-700 text-sm">
                             {editForm.previsaoConclusao ? new Date(editForm.previsaoConclusao).toLocaleDateString('pt-BR') : '—'}
                           </span>
                         )}
                       </div>
                       <div>
                         <label className="text-xs text-slate-500 uppercase block">
                           Situação da Emenda <span className="text-red-500">*</span>
                         </label>
                         {(isCreateMode || isEditMode) ? (
                           <select
                             value={editForm.status || 'Recebido'}
                             onChange={(e) => handleFormChange('status', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
                             required
                           >
                             <option value="Recebido">Recebido</option>
                             <option value="Iniciado">Iniciado</option>
                             <option value="Em execução">Em execução</option>
                             <option value="Concluído">Concluído</option>
                             <option value="Devolvido">Devolvido</option>
                           </select>
                         ) : (
                           <span className="text-slate-700 text-sm">{editForm.status || '—'}</span>
                         )}
                       </div>
                     </div>

                     {/* Task-10: Justificativa */}
                     <div>
                       <label className="text-xs text-slate-500 uppercase block">
                         Justificativa (mín. 20, máx. 250 caracteres)
                       </label>
                       {(isCreateMode || isEditMode) ? (
                         <>
                           <textarea
                             value={editForm.justificativa || ''}
                             onChange={(e) => {
                               if (e.target.value.length <= 250) {
                                 handleFormChange('justificativa', e.target.value);
                               }
                             }}
                             className={`mt-1 w-full border rounded px-3 py-2 text-sm min-h-[80px] ${
                               editForm.justificativa && editForm.justificativa.length < 20
                                 ? 'border-red-300'
                                 : ''
                             }`}
                             placeholder="Justificativa da emenda (mínimo 20 caracteres)..."
                             maxLength={250}
                           />
                           <p className={`text-xs mt-1 ${
                             !editForm.justificativa || editForm.justificativa.length < 20
                               ? 'text-red-500'
                               : 'text-slate-400'
                           }`}>
                             {(editForm.justificativa || '').length}/250 caracteres
                             {editForm.justificativa && editForm.justificativa.length < 20 &&
                               ` (faltam ${20 - editForm.justificativa.length} caracteres)`
                             }
                           </p>
                         </>
                       ) : (
                         <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap break-words">{editForm.justificativa || '—'}</p>
                       )}
                     </div>

                     {/* Convênio (JIRA 7) */}
                     <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
                       <h4 className="text-sm font-semibold text-slate-800 mb-3">Convênio</h4>

                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                           <span className="text-xs text-slate-500 uppercase block">Existe Convênio?</span>
                           {(isCreateMode || isEditMode) ? (
                             <select
                               value={editForm.existeConvenio ? 'SIM' : 'NAO'}
                               onChange={(e) => {
                                 const value = e.target.value === 'SIM';
                                 setEditForm((prev) => ({
                                   ...prev,
                                   existeConvenio: value,
                                   numeroConvenio: value ? prev.numeroConvenio : '',
                                   anoConvenio: value ? prev.anoConvenio : undefined,
                                 }));
                               }}
                               className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
                             >
                               <option value="NAO">Não</option>
                               <option value="SIM">Sim</option>
                             </select>
                           ) : (
                             <span className="text-slate-700 text-sm">{editForm.existeConvenio ? 'Sim' : 'Não'}</span>
                           )}
                         </div>

                         <div>
                           <span className="text-xs text-slate-500 uppercase block">Número do Convênio</span>
                           {(isCreateMode || isEditMode) ? (
                             <input
                               type="text"
                               value={editForm.numeroConvenio || ''}
                               onChange={(e) => handleFormChange('numeroConvenio', e.target.value)}
                               maxLength={16}
                               disabled={!editForm.existeConvenio}
                               className="mt-1 w-full border rounded px-3 py-2 text-sm disabled:bg-slate-100"
                             />
                           ) : (
                             <span className="text-slate-700 text-sm">{editForm.existeConvenio ? (editForm.numeroConvenio || '—') : '—'}</span>
                           )}
                         </div>

                         <div>
                           <span className="text-xs text-slate-500 uppercase block">Ano do Convênio</span>
                           {(isCreateMode || isEditMode) ? (
                             <input
                               type="number"
                               value={editForm.anoConvenio ?? ''}
                               onChange={(e) => {
                                 const v = e.target.value;
                                 handleFormChange('anoConvenio', v === '' ? (undefined as any) : Number(v));
                               }}
                               min={1900}
                               max={new Date().getFullYear() + 5}
                               disabled={!editForm.existeConvenio}
                               className="mt-1 w-full border rounded px-3 py-2 text-sm disabled:bg-slate-100"
                               placeholder="YYYY"
                             />
                           ) : (
                             <span className="text-slate-700 text-sm">{editForm.existeConvenio ? (editForm.anoConvenio ?? '—') : '—'}</span>
                           )}
                         </div>
                       </div>
                     </div>

                     {/* Councilor, Institution e Signed Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Parlamentar</span>
                         {(isCreateMode || isEditMode) ? (
                           <div className="mt-1 space-y-2">
                             <select
                               value={editForm.councilorId || ''}
                               onChange={(e) => handleFormChange('councilorId', e.target.value)}
                               className="w-full border rounded px-3 py-2 text-sm bg-white"
                             >
                               <option value="">Selecione um parlamentar</option>
                               {councilors
                                 .filter((c) => {
                                   const q = councilorSearch.trim().toLowerCase();
                                   if (!q) return true;
                                   return (
                                     c.councilorId.toLowerCase().includes(q) ||
                                     c.fullName.toLowerCase().includes(q) ||
                                     (c.politicalParty ?? '').toLowerCase().includes(q)
                                   );
                                 })
                                 .map((c) => (
                                   <option key={c.councilorId} value={c.councilorId}>
                                     {c.fullName}
                                   </option>
                                 ))}
                             </select>
                           </div>
                         ) : (
                           <span className="text-slate-700 text-sm">
                             {editForm.councilorName ||
                               councilors.find((c) => c.councilorId === editForm.councilorId)?.fullName ||
                               '—'}
                           </span>
                         )}
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Instituição</span>
                         {(isCreateMode || isEditMode) ? (
                           <div className="mt-1 space-y-2">
                             <select
                               value={editForm.institutionId || ''}
                               onChange={(e) => handleFormChange('institutionId', e.target.value)}
                               className="w-full border rounded px-3 py-2 text-sm bg-white"
                             >
                               <option value="">Selecione uma instituição</option>
                               {institutions
                                 .filter((i) => {
                                   const q = institutionSearch.trim().toLowerCase();
                                   if (!q) return true;
                                   return (
                                     (i.razaoSocial ?? '').toLowerCase().includes(q) ||
                                     (i.nomeFantasia ?? '').toLowerCase().includes(q) ||
                                     (i as any).name?.toLowerCase?.().includes(q)
                                   );
                                 })
                                 .map((i) => (
                                   <option key={i.institutionId} value={i.institutionId}>
                                     {i.razaoSocial || (i as any).name || '—'}
                                   </option>
                                 ))}
                             </select>
                           </div>
                         ) : (
                           <span className="text-slate-700 text-sm">
                             {editForm.institutionName ||
                               institutions.find((i) => i.institutionId === editForm.institutionId)?.razaoSocial ||
                               (institutions as any).find?.((i: any) => i.institutionId === editForm.institutionId)?.name ||
                               '—'}
                           </span>
                         )}
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Link Assinado</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.signedLink || ''}
                             onChange={(e) => handleFormChange('signedLink', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="URL"
                           />
                         ) : (
                           <span className="text-slate-700 text-sm truncate block">{editForm.signedLink || '—'}</span>
                         )}
                       </div>
                     </div>
                   </div>
                 </section>

                 {/* Área de Despacho */}
                 {!isCreateMode && (
                   <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                     <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                         <circle cx="12" cy="12" r="10"></circle>
                         <line x1="12" x2="12" y1="8" y2="12"></line>
                         <line x1="12" y1="16" x2="12.01" y2="16"></line>
                       </svg>
                       Área de Despacho
                     </h3>
                     <div className="space-y-4">
                       <div>
                         <label className="text-sm font-medium leading-none text-purple-900" htmlFor="dispatch-note">
                           Motivo / Parecer do Gestor
                         </label>
                         <textarea
                           id="dispatch-note"
                           className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="Descreva o motivo da aprovação, necessidade de retificação ou reprovação..."
                           value={despachoObservacao}
                           onChange={(e) => setDespachoObservacao(e.target.value)}
                           disabled={executingAction}
                         ></textarea>
                       </div>
                       <div className="flex flex-wrap gap-3 pt-2">
                         <button
                           className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50 disabled:pointer-events-none flex-1"
                           onClick={() => handleAcao('APROVAR')}
                           disabled={executingAction}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                             <circle cx="12" cy="12" r="10"></circle>
                             <path d="m9 12 2 2 4-4"></path>
                           </svg>
                           {executingAction ? 'Processando...' : 'Aprovar'}
                         </button>
                         <button
                           className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded disabled:opacity-50 disabled:pointer-events-none flex-1"
                           onClick={() => handleAcao('DEVOLVER')}
                           disabled={executingAction}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                             <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                             <path d="M3 3v5h5"></path>
                           </svg>
                          Devolver
                         </button>
                         <button
                           className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:pointer-events-none flex-1"
                           onClick={() => handleAcao('REPROVAR')}
                           disabled={executingAction}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                             <circle cx="12" cy="12" r="10"></circle>
                             <path d="m15 9-6 6"></path>
                             <path d="m9 9 6 6"></path>
                           </svg>
                           Reprovar
                         </button>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Save button for create mode */}
                 {isCreateMode && (
                   <div className="flex justify-end gap-3">
                     <button
                       type="button"
                       onClick={closeModal}
                       className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                     >
                       Cancelar
                     </button>
                     <button
                       type="button"
                       onClick={handleSave}
                       disabled={saving}
                       className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none"
                     >
                       {saving ? 'Salvando...' : 'Salvar Emenda'}
                     </button>
                   </div>
                 )}
               </div>

               {/* Right Column - Timeline & Contacts */}
               <aside className="lg:col-span-4 space-y-6">
                 <div className="bg-white border border-slate-200 rounded-xl p-4">
                   <h3 className="text-sm font-semibold text-slate-800 mb-4">Linha do Tempo</h3>
                   {isCreateMode ? (
                     <div className="text-sm text-slate-600">
                       <div>
                         <div className="font-semibold text-slate-700">Emenda registrada</div>
                         <div className="text-xs text-slate-400">Aguardando cadastro</div>
                       </div>
                     </div>
                   ) : loadingHistorico ? (
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
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-2.5 w-2.5 ${
                                 (h.acao === 'APROVADA' || h.acao === 'concluído' || h.acao === 'Aprovada pelo Gestor') ? 'text-emerald-600' :
                                 (h.acao === 'REPROVADA' || h.acao === 'REPROVADO') ? 'text-red-600' :
                                 h.acao === 'DEVOLVIDA' ? 'text-amber-500' :
                                 h.acao === 'SOLICITADA_APROVACAO' ? 'text-blue-600' :
                                 h.acao === 'DETALHAMENTO_PENDENTE' ? 'text-purple-600' :
                                 h.acao === 'DETALHAMENTO_ENVIADO' ? 'text-purple-600' :
                                 h.acao === 'AGUARDANDO_DETALHAMENTO' ? 'text-gray-600' :
                                 h.acao === 'CRIADA' ? 'text-slate-400' :
                                 h.acao === 'PENDENTE' ? 'text-slate-400' :
                                 'text-slate-400'
                               }`}>
                                 <circle cx="12" cy="12" r="10"></circle>
                               </svg>
                             </span>
                             <div className="flex flex-col gap-1">
                               <h4 className={`text-sm font-semibold leading-tight ${
                                 (h.acao === 'APROVADA' || h.acao === 'concluído' || h.acao === 'Aprovada pelo Gestor') ? 'text-emerald-700' :
                                 (h.acao === 'REPROVADA' || h.acao === 'REPROVADO') ? 'text-red-700' :
                                 h.acao === 'DEVOLVIDA' ? 'text-amber-700' :
                                 h.acao === 'SOLICITADA_APROVACAO' ? 'text-blue-700' :
                                 h.acao === 'DETALHAMENTO_PENDENTE' ? 'text-purple-700' :
                                 h.acao === 'DETALHAMENTO_ENVIADO' ? 'text-purple-700' :
                                 h.acao === 'AGUARDANDO_DETALHAMENTO' ? 'text-gray-700' :
                                 h.acao === 'CRIADA' ? 'text-slate-700' :
                                 h.acao === 'PENDENTE' ? 'text-slate-700' :
                                 'text-slate-700'
                               }`}>
                                 {h.acao === 'SOLICITADA_APROVACAO' ? 'Solicitou Aprovação' :
                                  (h.acao === 'APROVADA' || h.acao === 'APROVADO' || h.acao === 'Aprovada pelo Gestor') ? 'Aprovada' :
                                  h.acao === 'DEVOLVIDA' ? 'Devolvida para Retificação' :
                                  (h.acao === 'REPROVADA' || h.acao === 'REPROVADO') ? 'Reprovada' :
                                  h.acao === 'CRIADA' ? 'Emenda Criada' :
                                  h.acao === 'PENDENTE' ? 'Emenda Criada' :
                                  h.acao === 'ATUALIZADA' ? 'Atualizada' :
                                  h.acao === 'DETALHAMENTO_PENDENTE' ? 'Formulário de detalhamento pendente' :
                                  h.acao === 'DETALHAMENTO_ENVIADO' ? 'Formulário de detalhamento enviado' :
                                  h.acao}
                               </h4>
                               <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                 {new Date(h.dataHora).toLocaleString('pt-BR', {
                                   day: '2-digit',
                                   month: '2-digit',
                                   year: 'numeric',
                                   hour: '2-digit',
                                   minute: '2-digit'
                                 })}
                               </span>
                             </div>
                             {h.observacao && (
                               <p className="text-sm text-slate-500 mt-1">{h.observacao}</p>
                             )}
                             {h.usuario && (
                               <p className="text-xs text-slate-400 mt-1">Por: {h.usuario}</p>
                             )}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Attachments */}
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anexos</h4>

                   {(isCreateMode || isEditMode) ? (
                     <div className="space-y-3">
                       {(editForm.attachments ?? []).length === 0 ? (
                         <p className="text-sm text-slate-500">Nenhum anexo adicionado.</p>
                       ) : (
                         <ul className="space-y-2">
                           {(editForm.attachments ?? []).map((url, idx) => (
                             <li key={`${idx}-${url}`} className="flex items-start gap-2">
                               <input
                                 type="text"
                                 value={url}
                                 onChange={(e) => {
                                   const next = [...(editForm.attachments ?? [])];
                                   next[idx] = e.target.value;
                                   setEditForm((prev) => ({ ...prev, attachments: next }));
                                 }}
                                 className="flex-1 border rounded px-3 py-2 text-sm"
                                 placeholder="https://..."
                               />
                               <button
                                 type="button"
                                 onClick={() => {
                                   const next = [...(editForm.attachments ?? [])];
                                   next.splice(idx, 1);
                                   setEditForm((prev) => ({ ...prev, attachments: next }));
                                 }}
                                 className="px-3 py-2 text-sm border rounded hover:bg-white"
                               >
                                 Remover
                               </button>
                             </li>
                           ))}
                         </ul>
                       )}

                       <button
                         type="button"
                         onClick={() => {
                           const next = [...(editForm.attachments ?? [])];
                           next.push('');
                           setEditForm((prev) => ({ ...prev, attachments: next }));
                         }}
                         className="px-4 py-2 bg-white border border-slate-300 rounded text-sm hover:bg-slate-50"
                       >
                         + Adicionar anexo
                       </button>
                     </div>
                   ) : (
                     <div className="space-y-2 text-sm">
                       {(editForm.attachments ?? []).length === 0 ? (
                         <p className="text-slate-500">—</p>
                       ) : (
                         <ul className="space-y-2">
                           {(editForm.attachments ?? []).map((url, idx) => (
                             <li key={`${idx}-${url}`}>
                               <a
                                 href={url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-600 hover:underline break-all"
                               >
                                 Abrir anexo {idx + 1}
                               </a>
                             </li>
                           ))}
                         </ul>
                       )}
                     </div>
                   )}
                 </div>

                 {!isCreateMode && editForm.signedLink && (
                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documento Assinado</h4>
                     <div className="space-y-2 text-sm">
                       <a href={editForm.signedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                         Abrir documento
                       </a>
                     </div>
                   </div>
                 )}
               </aside>
             </div>
           </div>
         </div>
        )}
     </div>
   );
};

export default EmendasPage;

