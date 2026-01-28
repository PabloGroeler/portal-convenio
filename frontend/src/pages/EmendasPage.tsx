import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EmendasStats from '../components/EmendasStats';
import emendaService from '../services/emendaService';
import institutionService, { type InstitutionDTO } from '../services/institutionService';
import councilorService, { type CouncilorDTO } from '../services/councilorService';
import type { EmendaHistoricoDTO } from '../services/emendaService';

interface Emenda {
  id: string;
  councilorId?: string;
  councilorName?: string;
  officialCode?: string;
  date?: string;
  value: string;
  classification?: string;
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

  // Current emenda being created/edited/viewed in the modal
  const [editForm, setEditForm] = useState<Emenda>({
    id: '',
    councilorId: '',
    officialCode: '',
    date: new Date().toISOString().split('T')[0],
    value: 'R$ 0,00',
    classification: '',
    category: '',
    status: 'Pendente',
    institutionId: '',
    signedLink: '',
    attachments: [],
    description: '',
    objectDetail: '',
  });

  // Dropdown data for councilor/institution selectors
  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [councilors, setCouncilors] = useState<CouncilorDTO[]>([]);
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
        const mappedEmendas: Emenda[] = data.map((e) => ({
          id: e.id || '',
          councilorId: e.councilorId,
          councilorName: e.councilorName,
          councilorPoliticalParty: e.councilorPoliticalParty,
          officialCode: e.officialCode,
          date: e.date,
          value: e.value ? `R$ ${e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
          classification: e.classification,
          category: e.category,
          status: e.status || 'Pendente',
          institutionId: e.institutionId,
          institutionName: e.institutionName,
          signedLink: e.signedLink,
          attachments: Array.isArray(e.attachments) ? e.attachments : [],
          description: e.description,
          objectDetail: e.objectDetail,
        }));
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
      } catch (e) {
        if (cancelled) return;
        // keep empty arrays on failure
        setInstitutions([]);
        setCouncilors([]);
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
      category: '',
      status: 'Pendente',
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
        classification: editForm.classification,
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

      // Map to local state
      const mappedEmenda: Emenda = {
        id: result.id || '',
        councilorId: result.councilorId,
        officialCode: result.officialCode,
        date: result.date,
        value: result.value ? `R$ ${result.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
        classification: result.classification,
        category: result.category,
        status: result.status || 'Pendente',
        institutionId: result.institutionId,
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

    setExecutingAction(true);
    try {
      console.log(`[EmendasPage] Executing action ${acao} on emenda ID ${selectedEmenda.id}`);
      const updatedEmenda = await emendaService.executarAcao(selectedEmenda.id, {
        acao,
        observacao: despachoObservacao,
      });
      console.log('[EmendasPage] Action result:', updatedEmenda);

      // Update the emenda in the local state
      const updatedLocal: Emenda = {
        ...selectedEmenda,
        status: updatedEmenda.status || selectedEmenda.status,
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
            status: e.status || 'Pendente',
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

    // status filter logic (Portuguese labels)
    if (statusFilter && statusFilter !== 'Todas') {
      const sf = statusFilter;
      if (sf === 'Pendentes') {
        // treat 'Em Andamento' as pendente
        if (!(e.status === 'Em Andamento' || e.status === 'Pendente')) return false;
      } else if (sf === 'Aprovadas') {
        if (e.status !== 'Aprovada') return false;
      } else if (sf === 'Retificar') {
        if (e.status !== 'Retificar') return false;
      } else if (sf === 'Reprovadas') {
        if (e.status !== 'Rejeitada' && e.status !== 'Reprovada') return false;
      }
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/"
                aria-label="Início"
                className="inline-flex items-center justify-center h-12 w-12 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ring-offset-background"
              >
                <img
                  src="/favicon.ico"
                  alt="Sistema de Emendas"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  loading="lazy"
                />
              </Link>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Sistema de Emendas</h1>
              </div>
            </div>

            <nav aria-label="Navegação principal" className="flex items-center space-x-2 sm:space-x-4">
               <Link
                 to="/"
                 className="text-gray-600 hover:text-gray-900 px-4 py-3 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ring-offset-background inline-flex items-center"
               >
                 Sair
               </Link>
             </nav>
          </div>
        </div>
      </header>

      {/* Summary stats (from provided file) */}
      <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="max-w-6xl mx-auto">
              <EmendasStats
                total={emendas.length}
                pending={emendas.filter((e) => e.status === 'Pendente' || e.status === 'Em Andamento').length}
                approved={emendas.filter((e) => e.status === 'Aprovada').length}
                toRectify={emendas.filter((e) => e.status === 'Retificar').length}
                rejected={emendas.filter((e) => e.status === 'Rejeitada' || e.status === 'Reprovada').length}
              />
            </div>

          {/* Page actions (moved from header) */}
          <div className="mt-6 mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700"
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
                 <option>Pendentes</option>
                 <option>Aprovadas</option>
                 <option>Retificar</option>
                 <option>Reprovadas</option>
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
                     className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700"
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
                           {e.institutionName || e.institutionId || '—'}
                         </div>
                       </div>

                       <span
                         className={`shrink-0 px-2 py-1 text-xs rounded-full ${
                           (e.status === 'Aprovada' || e.status === 'APROVADA' || e.status === 'APROVADO.' || e.status === 'Aprovado' || e.status === 'Aprovada pelo Gestor')
                             ? 'bg-emerald-100 text-emerald-800'
                             : (e.status === 'Rejeitada' || e.status === 'REJEITADA' || e.status === 'REJEITADO' || e.status === 'Rejeitado')
                               ? 'bg-red-100 text-red-800'
                               : 'bg-yellow-100 text-yellow-800'
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
                      institutions.find((i) => i.institutionId === editForm.institutionId)?.name ||
                      'Instituição')}
               </span>
               <h2 className="text-xl font-bold text-gray-900 text-center leading-tight mb-1">
                 {isCreateMode
                   ? 'Criar Nova Emenda'
                   : (editForm.officialCode || 'Detalhes da Emenda')}
               </h2>
               <div className="mt-2 flex gap-2">
                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                   editForm.status === 'Aprovada' ? 'bg-green-100 text-green-800 border-green-200' :
                   editForm.status === 'Rejeitada' ? 'bg-red-100 text-red-800 border-red-200' :
                   editForm.status === 'Retificar' ? 'bg-amber-100 text-amber-800 border-amber-200' :
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
                     {/* Número e Valor */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Código Oficial</span>
                         {(isCreateMode || isEditMode) ? (
                           <input
                             type="text"
                             value={editForm.code || ''}
                             onChange={(e) => handleFormChange('code', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Ex: 004-132-2025"
                           />
                         ) : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.code || '—'}</span>
                         )}
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
                     </div>

                     {/* Descrição Inicial */}
                     <div>
                       <span className="text-xs text-slate-500 uppercase block">Descrição Inicial</span>
                       {isCreateMode ? (
                         <textarea
                           value={editForm.description || ''}
                           onChange={(e) => handleFormChange('description', e.target.value)}
                           className="mt-1 w-full border rounded px-3 py-2 text-sm min-h-[60px]"
                           placeholder="Descrição da emenda..."
                         />
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

                     {/* Data, Classificação e Categoria */}
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
                         <span className="text-xs text-slate-500 uppercase block">Classificação</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.classification || ''}
                             onChange={(e) => handleFormChange('classification', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Ex: Custeio"
                           />
                         ) : (
                           <span className="text-slate-700 text-sm">{editForm.classification || '—'}</span>
                         )}
                       </div>
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

                     {/* Councilor ID, Institution ID e Signed Link */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">{(isCreateMode || isEditMode) ? 'ID Parlamentar' : 'Parlamentar'}</span>
                         {(isCreateMode || isEditMode) ? (
                           <div className="mt-1 space-y-2">
                             <input
                               type="text"
                               value={councilorSearch}
                               onChange={(e) => setCouncilorSearch(e.target.value)}
                               className="w-full border rounded px-3 py-2 text-sm"
                               placeholder="Buscar por nome ou ID do parlamentar..."
                             />
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
                                 .slice(0, 50)
                                 .map((c) => (
                                   <option key={c.councilorId} value={c.councilorId}>
                                     {c.fullName}{c.politicalParty ? ` (${c.politicalParty})` : ''} — {c.councilorId}
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
                         <span className="text-xs text-slate-500 uppercase block">{(isCreateMode || isEditMode) ? 'ID Instituição' : 'Instituição'}</span>
                         {(isCreateMode || isEditMode) ? (
                           <div className="mt-1 space-y-2">
                             <input
                               type="text"
                               value={institutionSearch}
                               onChange={(e) => setInstitutionSearch(e.target.value)}
                               className="w-full border rounded px-3 py-2 text-sm"
                               placeholder="Buscar por nome ou ID da instituição..."
                             />
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
                                     i.institutionId.toLowerCase().includes(q) ||
                                     i.name.toLowerCase().includes(q)
                                   );
                                 })
                                 .slice(0, 50)
                                 .map((i) => (
                                   <option key={i.institutionId} value={i.institutionId}>
                                     {i.name} — {i.institutionId}
                                   </option>
                                 ))}
                             </select>
                           </div>
                         ) : (
                           <span className="text-slate-700 text-sm">
                             {editForm.institutionName ||
                               institutions.find((i) => i.institutionId === editForm.institutionId)?.name ||
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
                                 (h.acao === 'APROVADA' || h.acao === 'APROVADO' || h.acao === 'Aprovada pelo Gestor') ? 'text-emerald-600' :
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
                                 (h.acao === 'APROVADA' || h.acao === 'APROVADO' || h.acao === 'Aprovada pelo Gestor') ? 'text-emerald-700' :
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

