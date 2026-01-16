import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EmendasStats from '../components/EmendasStats';

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

const mockData: Emenda[] = [
  { id: 1, title: 'Emenda 001/2024', year: 2024, value: 'R$ 50.000,00', status: 'Aprovada', description: 'Apoio a projeto social', code: 'E-001', institution: 'CAOPA', parlamentar: 'Deputado A', hasDetail: true },
  { id: 2, title: 'Emenda 002/2024', year: 2024, value: 'R$ 120.000,00', status: 'Em Andamento', description: 'Infraestrutura escolar', code: 'E-002', institution: 'Escola B', parlamentar: 'Deputado B', hasDetail: false },
  { id: 3, title: 'Emenda 003/2023', year: 2023, value: 'R$ 30.000,00', status: 'Rejeitada', description: 'Programa cultural', code: 'E-003', institution: 'Instituto C', parlamentar: 'Deputado C', hasDetail: true },
];

const EmendasPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [detailFilter, setDetailFilter] = useState('Todas');
  const [selectedEmenda, setSelectedEmenda] = useState<Emenda | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

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
    if (selectedEmenda) {
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
  }, [selectedEmenda]);

  const filtered = mockData.filter((e) => {
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
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border rounded bg-white text-sm text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
            <EmendasStats total={441} pending={439} approved={0} toRectify={2} rejected={0} />
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
             {filtered.length === 0 ? (
               <p className="text-gray-500">Nenhuma emenda encontrada.</p>
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
                         onClick={() => setSelectedEmenda(e)}
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

       {/* Modal: show details when selectedEmenda is set */}
       {selectedEmenda && (
         <div
           role="dialog"
           aria-modal="true"
           aria-labelledby="emenda-title"
           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
           onClick={(e) => {
             // close when clicking the overlay (not the modal content)
             if (e.target === e.currentTarget) setSelectedEmenda(null);
           }}
         >
           <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-auto">
             <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
               <div>
                 <h2 id="emenda-title" className="text-2xl font-bold">{selectedEmenda.title}</h2>
                 <p className="text-sm text-gray-600">Área administrativa — Emenda</p>
               </div>
               <div className="flex items-center gap-2">
                 <Link to={`/emendas/${selectedEmenda.id}`} className="px-3 py-1 border rounded text-sm">Abrir página</Link>
                 <button
                   ref={closeButtonRef}
                   type="button"
                   onClick={() => setSelectedEmenda(null)}
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
                         <span className="font-mono text-slate-700 font-medium">{selectedEmenda.title}</span>
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Ano</span>
                         <span className="font-mono text-slate-700 font-medium">{selectedEmenda.year}</span>
                       </div>
                     </div>

                     <div>
                       <span className="text-xs text-slate-500 uppercase block">Valor</span>
                       <p className="text-slate-700 text-sm">{selectedEmenda.value}</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Status</span>
                         <div className="mt-2">
                           <span className={`px-2 py-1 text-xs rounded-full ${selectedEmenda.status === 'Aprovada' ? 'bg-green-100 text-green-800' : selectedEmenda.status === 'Rejeitada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                             {selectedEmenda.status}
                           </span>
                         </div>
                       </div>
                       <div>
                         <span className="text-xs text-slate-500 uppercase block">Link</span>
                         <p className="text-slate-700 text-sm">—</p>
                       </div>
                     </div>
                   </div>
                 </section>

                 <section className="bg-white p-3 rounded border border-slate-200 space-y-3">
                   <p className="font-semibold text-xs text-slate-500 uppercase">Área de Despacho</p>
                   <textarea className="w-full min-h-[120px] rounded-md border p-3" placeholder="Descreva o parecer do gestor..."></textarea>
                   <div className="flex gap-3">
                     <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded">Aprovar</button>
                     <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded">Devolver p/ Retificar</button>
                     <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded">Reprovar</button>
                   </div>
                 </section>
               </div>

               <aside className="lg:col-span-4 space-y-6">
                 <div className="bg-white border border-slate-200 rounded-xl p-4">
                   <h3 className="text-sm font-semibold text-slate-800 mb-4">Linha do Tempo</h3>
                   <div className="space-y-4 text-sm text-slate-600">
                     <div>
                       <div className="font-semibold text-slate-700">Emenda registrada</div>
                       <div className="text-xs text-slate-400">—</div>
                     </div>
                     <div>
                       <div className="font-semibold text-slate-700">Última atualização</div>
                       <div className="text-xs text-slate-400">—</div>
                     </div>
                   </div>
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

