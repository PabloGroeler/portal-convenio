import React, { useEffect, useState } from 'react';
import parlamentarService from '../services/parlamentarLimitesService';
import councilorService, { CouncilorDTO } from '../services/councilorService';

const AdminParlamentarLimitesPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [parlamentares, setParlamentares] = useState<CouncilorDTO[]>([]);
  const [limitsLoading, setLimitsLoading] = useState(true);
  const [councilorLoading, setCouncilorLoading] = useState(true);
  const [councilorError, setCouncilorError] = useState<string | null>(null);
  const [form, setForm] = useState({parlamentarId: '', ano: new Date().getFullYear(), valorAnual: ''});
  const [editingId, setEditingId] = useState<number | null>(null);

  const formatCurrency = (value: string | number) => {
    const raw = String(value ?? '').replace(/\D/g, '');
    if (!raw) return '';
    const numberValue = Number(raw) / 100;
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const parseCurrencyToNumber = (value: string) => {
    const raw = value.replace(/[^\d]/g, '');
    if (!raw) return 0;
    return Number(raw) / 100;
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatCurrency(e.target.value);
    setForm(f => ({ ...f, valorAnual: masked }));
  };

  const loadCouncilors = async () => {
    setCouncilorLoading(true);
    setCouncilorError(null);
    try {
      const pcs = await councilorService.list();
      setParlamentares(Array.isArray(pcs) ? pcs : (pcs?.data || []));
    } catch (err) {
      console.error(err);
      setCouncilorError('Erro ao carregar parlamentares');
    } finally {
      setCouncilorLoading(false);
    }
  };

  const loadLimites = async () => {
    setLimitsLoading(true);
    try {
      const res = await parlamentarService.listAll();
      setList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLimitsLoading(false); }
  };

  useEffect(() => {
    loadCouncilors();
    loadLimites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await parlamentarService.create({ parlamentarId: form.parlamentarId, ano: Number(form.ano), valorAnual: parseCurrencyToNumber(form.valorAnual) });
      await loadLimites();
      setForm({parlamentarId: '', ano: new Date().getFullYear(), valorAnual: ''});
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Erro');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirma exclusão?')) return;
    try {
      await parlamentarService.remove(id);
      setList(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert('Erro ao excluir'); }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({parlamentarId: item.parlamentarId, ano: item.ano, valorAnual: formatCurrency(item.valorAnual)});
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await parlamentarService.update(editingId, { valorAnual: parseCurrencyToNumber(form.valorAnual) });
      await loadLimites();
      setEditingId(null);
      setForm({parlamentarId: '', ano: new Date().getFullYear(), valorAnual: ''});
    } catch (err: any) { alert(err?.response?.data?.error || err.message || 'Erro'); }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">Limites Anuais por Parlamentar</h1>
      <div className="bg-white p-4 rounded shadow-sm">
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Parlamentar</label>
            <select required disabled={councilorLoading || !!councilorError} value={form.parlamentarId} onChange={e => setForm(f => ({...f, parlamentarId: e.target.value}))} className="w-full border rounded px-2 py-1">
              <option value="">{councilorLoading ? 'Carregando parlamentares...' : 'Selecione um parlamentar'}</option>
              {!councilorLoading && councilorError && <option disabled>{councilorError}</option>}
              {!councilorLoading && !councilorError && parlamentares.length === 0 && <option disabled>Nenhum parlamentar encontrado</option>}
              {parlamentares.map((p:any) => <option key={p.councilorId} value={p.councilorId}>{p.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ano</label>
            <input type="number" value={form.ano} onChange={e => setForm(f => ({...f, ano: Number(e.target.value)}))} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Valor Anual</label>
            <input type="text" inputMode="decimal" value={form.valorAnual} onChange={handleValorChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{editingId ? 'Salvar' : 'Adicionar'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({parlamentarId: '', ano: new Date().getFullYear(), valorAnual: ''}); }} className="ml-2 px-3 py-1 border rounded">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="mt-4 bg-white rounded shadow-sm p-3">
        {limitsLoading ? <div>Carregando...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b"><th className="py-2">Parlamentar</th><th className="py-2">Ano</th><th className="py-2">Valor Anual</th><th className="py-2"></th></tr>
            </thead>
            <tbody>
              {list.map(l => (
                <tr key={l.id} className="border-b">
                  <td className="py-2">{parlamentares.find(p => p.councilorId === l.parlamentarId)?.fullName || l.parlamentarId}</td>
                  <td className="py-2">{l.ano}</td>
                  <td className="py-2">{Number(l.valorAnual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="py-2 text-right"><button onClick={() => startEdit(l)} className="text-blue-600 mr-3">Editar</button><button onClick={() => handleDelete(l.id)} className="text-red-600">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminParlamentarLimitesPage;
