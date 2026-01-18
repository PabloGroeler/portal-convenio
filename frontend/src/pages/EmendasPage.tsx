import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EmendasStats from '../components/EmendasStats';
import emendaService from '../services/emendaService';
import type { EmendaHistoricoDTO } from '../services/emendaService';

interface Emenda {
  id: number;
  title: string;
  year: number;
  value: string;
  status: string;
  description?: string;
  code?: string;
  institution?: string;
  parlamentar?: string;
  hasDetail?: boolean;
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
  const [historico, setHistorico] = useState<EmendaHistoricoDTO[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [despachoObservacao, setDespachoObservacao] = useState('');
  const [executingAction, setExecutingAction] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Emenda>({
    id: 0,
    title: '',
    year: new Date().getFullYear(),
    value: '',
    status: 'Pendente',
    description: '',
    code: '',
    institution: '',
    parlamentar: '',
    hasDetail: false,
  });

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  // Fetch emendas from API on mount
  useEffect(() => {
    const fetchEmendas = async () => {
      setLoading(true);
      try {
        console.log('[EmendasPage] Fetching emendas from API...');
        const data = await emendaService.list();
        console.log('[EmendasPage] Received data:', data);
        // Map API data to frontend Emenda interface
        const mappedEmendas: Emenda[] = data.map((e) => ({
          id: e.id || 0,
          title: e.name || '',
          year: e.year || new Date().getFullYear(),
          value: e.value ? `R$ ${e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
          status: e.status || 'Pendente',
          description: e.description,
          code: e.code,
          institution: e.institution,
          parlamentar: e.parlamentar,
          hasDetail: e.hasDetail,
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

  const openCreateModal = () => {
    setEditForm({
      id: 0,
      title: '',
      year: new Date().getFullYear(),
      value: '',
      status: 'Pendente',
      description: '',
      code: '',
      institution: '',
      parlamentar: '',
      hasDetail: false,
    });
    setIsCreateMode(true);
  };

  const openViewModal = async (emenda: Emenda) => {
    setSelectedEmenda(emenda);
    setEditForm({ ...emenda });
    setIsCreateMode(false);
    setDespachoObservacao('');

    // Fetch history for this emenda
    if (emenda.id > 0) {
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
        name: editForm.title,
        code: editForm.code,
        year: editForm.year,
        value: valueNum,
        status: editForm.status,
        description: editForm.description,
        institution: editForm.institution,
        parlamentar: editForm.parlamentar,
        hasDetail: editForm.hasDetail,
      };

      console.log('[EmendasPage] Creating emenda:', emendaDTO);
      const created = await emendaService.create(emendaDTO);
      console.log('[EmendasPage] Created emenda:', created);

      // Add to local state
      const newEmenda: Emenda = {
        id: created.id || 0,
        title: created.name || '',
        year: created.year || new Date().getFullYear(),
        value: created.value ? `R$ ${created.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
        status: created.status || 'Pendente',
        description: created.description,
        code: created.code,
        institution: created.institution,
        parlamentar: created.parlamentar,
        hasDetail: created.hasDetail,
      };
      setEmendas((prev) => [newEmenda, ...prev]);

      closeModal();
    } catch (err) {
      console.error('[EmendasPage] Error saving emenda:', err);
      alert('Erro ao salvar emenda');
    } finally {
      setSaving(false);
    }
  };

  const handleAcao = async (acao: 'APROVAR' | 'DEVOLVER' | 'REPROVAR' | 'SOLICITAR_APROVACAO') => {
    if (!selectedEmenda || selectedEmenda.id <= 0) {
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
            id: e.id || 0,
            title: e.name || '',
            year: e.year || new Date().getFullYear(),
            value: e.value ? `R$ ${e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
            status: e.status || 'Pendente',
            description: e.description,
            code: e.code,
            institution: e.institution,
            parlamentar: e.parlamentar,
            hasDetail: e.hasDetail,
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
      const hay = `${e.title} ${e.status} ${e.description ?? ''} ${e.code ?? ''} ${e.institution ?? ''} ${e.parlamentar ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (year && String(e.year) !== year) return false;

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
      if (detailFilter === 'Com Detalhamento' && !e.hasDetail) return false;
      if (detailFilter === 'Sem Detalhamento' && e.hasDetail) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      {/* Summary stats (from provided file) */}
     <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Emendas</h1>
            <p className="text-gray-600 mt-1">Gestão e consulta de emendas — área administrativa</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700"
            >
              + Nova Emenda
            </button>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border rounded bg-white text-sm text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
            <EmendasStats
              total={emendas.length}
              pending={emendas.filter((e) => e.status === 'Pendente' || e.status === 'Em Andamento').length}
              approved={emendas.filter((e) => e.status === 'Aprovada').length}
              toRectify={emendas.filter((e) => e.status === 'Retificar').length}
              rejected={emendas.filter((e) => e.status === 'Rejeitada' || e.status === 'Reprovada').length}
            />
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filtered.map((e) => (
                   <div key={e.id} className="border rounded p-4 bg-gray-50">
                     <div className="flex items-center justify-between">
                       <h3 className="font-semibold">{e.title}</h3>
                       <span className="text-sm text-gray-600">{e.year}</span>
                     </div>
                     <p className="text-gray-700 mt-2">Valor: {e.value}</p>
                     <p className="mt-3 inline-flex items-center gap-2">
                       <span
                         className={`px-2 py-1 text-xs rounded-full ${
                           e.status === 'Aprovada' ? 'bg-green-100 text-green-800' : e.status === 'Rejeitada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                         }`}
                       >
                         {e.status}
                       </span>
                     </p>

                     <div className="mt-4 flex gap-2">
                       <button
                         type="button"
                         onClick={() => openViewModal(e)}
                         className="px-3 py-1 border rounded text-sm"
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
           <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
             <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
               <div>
                 <h2 id="emenda-title" className="text-2xl font-bold">
                   {isCreateMode ? 'Nova Emenda' : editForm.title}
                 </h2>
                 <p className="text-sm text-gray-600">
                   {isCreateMode ? 'Preencha os dados para criar uma nova emenda' : 'Área administrativa — Emenda'}
                 </p>
               </div>
               <div className="flex items-center gap-2">
                 {!isCreateMode && selectedEmenda && (
                   <Link to={`/emendas/${selectedEmenda.id}`} className="px-3 py-1 border rounded text-sm">Abrir página</Link>
                 )}
                 {isCreateMode && (
                   <button
                     type="button"
                     onClick={handleSave}
                     disabled={saving}
                     className="px-3 py-1 bg-emerald-600 text-white rounded disabled:bg-emerald-400"
                   >
                     {saving ? 'Salvando...' : 'Salvar'}
                   </button>
                 )}
                 <button
                   ref={closeButtonRef}
                   type="button"
                   onClick={closeModal}
                   className="px-3 py-1 bg-red-600 text-white rounded"
                   aria-label="Fechar detalhes da emenda"
                 >
                   Fechar
                 </button>
               </div>
             </div>

             <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-6">
                 <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                   <h3 className="text-base font-semibold text-slate-800 mb-4 border-b pb-2">Dados da Emenda</h3>
                   <div className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Nome</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.title}
                             onChange={(e) => handleFormChange('title', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Título da emenda"
                           />
                         ) : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.title}</span>
                         )}
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Ano</span>
                         {isCreateMode ? (
                           <input
                             type="number"
                             value={editForm.year}
                             onChange={(e) => handleFormChange('year', parseInt(e.target.value) || 0)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Ano"
                           />
                         ) : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.year}</span>
                         )}
                       </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Código</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.code || ''}
                             onChange={(e) => handleFormChange('code', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Código da emenda"
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

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Instituição</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.institution || ''}
                             onChange={(e) => handleFormChange('institution', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Nome da instituição"
                           />
                         ) : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.institution || '—'}</span>
                         )}
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Parlamentar</span>
                         {isCreateMode ? (
                           <input
                             type="text"
                             value={editForm.parlamentar || ''}
                             onChange={(e) => handleFormChange('parlamentar', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                             placeholder="Nome do parlamentar"
                           />
                         ) : (
                           <span className="font-mono text-slate-700 font-medium">{editForm.parlamentar || '—'}</span>
                         )}
                       </div>
                     </div>

                     <div>
                       <span className="text-xs text-slate-500 uppercase block">Descrição</span>
                       {isCreateMode ? (
                         <textarea
                           value={editForm.description || ''}
                           onChange={(e) => handleFormChange('description', e.target.value)}
                           className="mt-1 w-full border rounded px-3 py-2 text-sm min-h-[100px]"
                           placeholder="Descrição detalhada da emenda..."
                         />
                       ) : (
                         <p className="text-slate-700 text-sm mt-1">{editForm.description || '—'}</p>
                       )}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Status</span>
                         {isCreateMode ? (
                           <select
                             value={editForm.status}
                             onChange={(e) => handleFormChange('status', e.target.value)}
                             className="mt-1 w-full border rounded px-3 py-2 text-sm"
                           >
                             <option value="Pendente">Pendente</option>
                             <option value="Aprovada">Aprovada</option>
                             <option value="Em Andamento">Em Andamento</option>
                             <option value="Retificar">Retificar</option>
                             <option value="Rejeitada">Rejeitada</option>
                           </select>
                         ) : (
                           <div className="mt-2">
                             <span className={`px-2 py-1 text-xs rounded-full ${editForm.status === 'Aprovada' ? 'bg-green-100 text-green-800' : editForm.status === 'Rejeitada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                               {editForm.status}
                             </span>
                           </div>
                         )}
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Detalhamento</span>
                         {isCreateMode ? (
                           <label className="mt-2 flex items-center gap-2">
                             <input
                               type="checkbox"
                               checked={editForm.hasDetail || false}
                               onChange={(e) => handleFormChange('hasDetail', e.target.checked)}
                               className="rounded"
                             />
                             <span className="text-sm text-slate-700">Com detalhamento</span>
                           </label>
                         ) : (
                           <p className="text-slate-700 text-sm mt-1">{editForm.hasDetail ? 'Com detalhamento' : 'Sem detalhamento'}</p>
                         )}
                       </div>
                     </div>
                   </div>
                 </section>

                 {!isCreateMode && (
                   <section className="bg-white p-3 rounded border border-slate-200 space-y-3">
                     <p className="font-semibold text-xs text-slate-500 uppercase">Área de Despacho</p>
                     <textarea
                       className="w-full min-h-[120px] rounded-md border p-3"
                       placeholder="Descreva o parecer do gestor..."
                       value={despachoObservacao}
                       onChange={(e) => setDespachoObservacao(e.target.value)}
                       disabled={executingAction}
                     ></textarea>
                     <div className="flex gap-3">
                       <button
                         className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-emerald-400"
                         onClick={() => handleAcao('APROVAR')}
                         disabled={executingAction}
                       >
                         {executingAction ? 'Processando...' : 'Aprovar'}
                       </button>
                       <button
                         className="flex-1 px-4 py-2 bg-amber-500 text-white rounded disabled:bg-amber-300"
                         onClick={() => handleAcao('DEVOLVER')}
                         disabled={executingAction}
                       >
                         Devolver p/ Retificar
                       </button>
                       <button
                         className="flex-1 px-4 py-2 bg-red-600 text-white rounded disabled:bg-red-400"
                         onClick={() => handleAcao('REPROVAR')}
                         disabled={executingAction}
                       >
                         Reprovar
                       </button>
                       <button
                         className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
                         onClick={() => handleAcao('SOLICITAR_APROVACAO')}
                         disabled={executingAction}
                       >
                         Solicitar Aprovação
                       </button>
                     </div>
                   </section>
                 )}
               </div>

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
                     <div className="space-y-4 max-h-64 overflow-y-auto">
                       {historico.map((h) => (
                         <div key={h.id} className="border-l-2 border-slate-300 pl-3 py-1">
                           <div className="flex items-center gap-2">
                             <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                               h.acao === 'APROVADA' ? 'bg-green-100 text-green-800' :
                               h.acao === 'REPROVADA' ? 'bg-red-100 text-red-800' :
                               h.acao === 'DEVOLVIDA' ? 'bg-amber-100 text-amber-800' :
                               h.acao === 'SOLICITADA_APROVACAO' ? 'bg-blue-100 text-blue-800' :
                               'bg-slate-100 text-slate-800'
                             }`}>
                               {h.acao === 'SOLICITADA_APROVACAO' ? 'SOLICITOU APROVAÇÃO' : h.acao}
                             </span>
                           </div>
                           <div className="text-xs text-slate-500 mt-1">
                             {h.statusAnterior && h.statusNovo && (
                               <span>{h.statusAnterior} → {h.statusNovo}</span>
                             )}
                           </div>
                           {h.observacao && (
                             <p className="text-xs text-slate-600 mt-1 italic">"{h.observacao}"</p>
                           )}
                           <div className="text-xs text-slate-400 mt-1">
                             {h.usuario && <span>Por: {h.usuario} • </span>}
                             {new Date(h.dataHora).toLocaleString('pt-BR')}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contatos da Instituição</h4>
                   <div className="space-y-2 text-sm">
                     <p><span className="text-slate-500">Email:</span> —</p>
                     <p><span className="text-slate-500">Fone:</span> —</p>
                   </div>
                 </div>
               </aside>
             </div>
           </div>
          </div>
        )}
     </div>
   );
};

export default EmendasPage;

