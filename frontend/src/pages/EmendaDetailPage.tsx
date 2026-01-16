import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';

interface Emenda {
  id: number;
  name?: string;
  legalName?: string;
  cnpj?: string;
  category?: string;
  link?: string;
  contactEmail?: string;
  contactPhone?: string;
  createTime?: string;
  updateTime?: string;
}

const EmendaDetailPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const [emenda, setEmenda] = useState<Emenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If navigation state includes an emenda object, use it immediately so the page renders
    const stateEmenda = (location && (location.state as any))?.emenda;
    if (stateEmenda) {
      // map possible mock fields (title/value/status) to the detail shape
      const mapped: Emenda = {
        id: stateEmenda.id,
        name: stateEmenda.name ?? stateEmenda.title,
        legalName: stateEmenda.legalName ?? '',
        cnpj: stateEmenda.cnpj ?? '',
        category: stateEmenda.category ?? '',
        link: stateEmenda.link ?? '',
        contactEmail: stateEmenda.contactEmail ?? stateEmenda.contact?.email ?? '',
        contactPhone: stateEmenda.contactPhone ?? stateEmenda.contact?.phone ?? '',
        createTime: stateEmenda.createTime ?? '',
        updateTime: stateEmenda.updateTime ?? '',
      };
      setEmenda(mapped);
      setLoading(false);
      return;
    }

    const fetchEmenda = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/emendas/${id}`);
        setEmenda(data);
      } catch (e) {
        // If backend 404, but we have no state, show friendly message — user requested to ignore the error when clicking from list
        setError('Falha ao carregar a emenda');
      } finally {
        setLoading(false);
      }
    };
    fetchEmenda();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !emenda) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error ?? 'Emenda não encontrada'}</p>
          <Link to="/emendas" className="text-blue-600 underline">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{emenda.name ?? 'Detalhes da Emenda'}</h1>
            <p className="text-sm text-gray-600">Visualize e despache a emenda</p>
          </div>
          <div>
            <Link to="/emendas" className="inline-flex items-center px-4 py-2 border rounded bg-white text-sm text-gray-700 hover:bg-gray-100">
              Voltar
            </Link>
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
                    <span className="font-mono text-slate-700 font-medium">{emenda.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">CNPJ</span>
                    <span className="font-mono text-slate-700 font-medium">{emenda.cnpj}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 uppercase block">Categoria</span>
                  <p className="text-slate-700 text-sm">{emenda.category}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">Link</span>
                    <a href={emenda.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">Abrir link</a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase block">Contato</span>
                    <div className="text-slate-700">{emenda.contactEmail || '—'}<br />{emenda.contactPhone || ''}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-slate-500 uppercase block mb-1">Metadados</span>
                  <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 min-h-[60px]">Criado: {emenda.createTime || '-'}<br/>Atualizado: {emenda.updateTime || '-'}</div>
                </div>

              </div>
            </section>

            <section className="bg-white p-3 rounded border border-slate-200 space-y-3">
              <p className="font-semibold text-xs text-slate-500 uppercase">Área de Despacho</p>
              <textarea className="w-full min-h-[80px] rounded-md border p-3" placeholder="Descreva o parecer do gestor..."></textarea>
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
                  <div className="font-semibold text-slate-700">Emenda Criada</div>
                  <div className="text-xs text-slate-400">{emenda.createTime || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Última Atualização</div>
                  <div className="text-xs text-slate-400">{emenda.updateTime || '-'}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contatos da Instituição</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500">Email:</span> {emenda.contactEmail || '—'}</p>
                <p><span className="text-slate-500">Fone:</span> {emenda.contactPhone || '—'}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EmendaDetailPage;

