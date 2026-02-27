import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import prestacaoService from '../services/prestacaoContaService';
import type { PrestacaoConta } from '../services/prestacaoContaService';

const PrestacaoContasPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planoId = searchParams.get('planoId') || '';
  const navigate = useNavigate();

  const [list, setList] = useState<PrestacaoConta[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [valor, setValor] = useState<number | ''>('');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planoId) return;
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planoId]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await prestacaoService.listByPlano(planoId);
      setList(data);
    } catch (err) {
      console.error('Erro ao carregar prestações:', err);
      setError('Falha ao carregar prestações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!planoId) return setError('Plano inválido');
    if (valor === '' || valor === null) return setError('Informe o valor');
    try {
      setSaving(true);
      await prestacaoService.create({ planoTrabalhoId: planoId, valorExecutado: Number(valor), observacoes });
      setValor('');
      setObservacoes('');
      await fetchList();
    } catch (err: any) {
      console.error('Erro ao criar prestação:', err);
      setError(err?.response?.data?.error || 'Erro ao salvar prestação');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Confirma exclusão da prestação de conta?')) return;
    try {
      await prestacaoService.remove(id);
      await fetchList();
    } catch (err) {
      console.error('Erro ao excluir prestação:', err);
      setError('Erro ao excluir');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prestações de Conta</h1>
        <div>
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-200 rounded">Voltar</button>
        </div>
      </div>

      {!planoId && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Parâmetro planoId ausente na URL.</div>
      )}

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSave} className="mb-6 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={valor as any}
              onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => { setValor(''); setObservacoes(''); }} className="px-4 py-2 border rounded">Limpar</button>
          </div>
        </div>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Lista</h2>

        {loading ? (
          <div>Carregando...</div>
        ) : list.length === 0 ? (
          <div className="text-gray-600">Nenhuma prestação encontrada.</div>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorExecutado || 0)}</div>
                  <div className="text-sm text-gray-600">{p.observacoes}</div>
                  <div className="text-xs text-gray-400">{p.createTime ? new Date(p.createTime).toLocaleString('pt-BR') : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestacaoContasPage;
