import React, { useEffect, useState } from 'react';
import funcionalidadesService from '../services/funcionalidadesService';

interface Funcionalidade {
  id: number;
  chave: string;
  descricao: string;
  percentualSaude?: number;
  percentualEducacao?: number;
  ativo: boolean;
}

const FuncionalidadesConfigPage: React.FC = () => {
  const [items, setItems] = useState<Funcionalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Funcionalidade | null>(null);
  const [form, setForm] = useState({ chave: '', descricao: '', percentualSaude: '', percentualEducacao: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await funcionalidadesService.listAll();
      setItems(res.data || []);
    } catch (err) { console.error(err); alert('Erro ao carregar funcionalidades'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await funcionalidadesService.update(editing.id, { percentualSaude: Number(form.percentualSaude), percentualEducacao: Number(form.percentualEducacao), descricao: form.descricao });
      } else {
        await funcionalidadesService.create({ chave: form.chave, descricao: form.descricao, percentualSaude: Number(form.percentualSaude), percentualEducacao: Number(form.percentualEducacao) });
      }
      await fetchItems();
      setEditing(null);
      setForm({ chave: '', descricao: '', percentualSaude: '', percentualEducacao: '' });
    } catch (err: any) { alert(err?.response?.data?.error || 'Erro ao salvar'); }
  };

  const startEdit = (it: Funcionalidade) => {
    setEditing(it);
    setForm({ chave: it.chave, descricao: it.descricao, percentualSaude: String(it.percentualSaude ?? ''), percentualEducacao: String(it.percentualEducacao ?? '') });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir funcionalidade?')) return;
    try { await funcionalidadesService.remove(id); await fetchItems(); } catch { alert('Erro ao excluir'); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações de Funcionalidades</h1>
      <p className="mb-4 text-sm text-gray-600">Aqui você pode definir percentuais destinados à Saúde e Educação por funcionalidade.</p>

      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Chave</label>
            <input required disabled={!!editing} value={form.chave} onChange={e => setForm(f => ({...f, chave: e.target.value}))} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Descrição</label>
            <input value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">% Saúde</label>
            <input type="number" step="0.01" value={form.percentualSaude} onChange={e => setForm(f => ({...f, percentualSaude: e.target.value}))} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">% Educação</label>
            <input type="number" step="0.01" value={form.percentualEducacao} onChange={e => setForm(f => ({...f, percentualEducacao: e.target.value}))} className="w-full border rounded px-2 py-1" />
          </div>

          <div className="sm:col-span-4 flex gap-2 mt-2">
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{editing ? 'Salvar' : 'Criar'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ chave: '', descricao: '', percentualSaude: '', percentualEducacao: '' }); }} className="px-3 py-1 border rounded">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chave</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Saúde</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Educação</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(it => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{it.chave}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{it.descricao}</td>
                  <td className="px-6 py-4 text-center text-sm">{(it.percentualSaude ?? 0).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center text-sm">{(it.percentualEducacao ?? 0).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center text-sm"><button onClick={() => startEdit(it)} className="text-blue-600 mr-3">Editar</button><button onClick={() => handleDelete(it.id)} className="text-red-600">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FuncionalidadesConfigPage;

