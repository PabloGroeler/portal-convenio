import React, { useEffect, useMemo, useState } from 'react';
import userAdminService, {
  type UserAdminCreateRequest,
  type UserAdminDTO,
  type UserAdminUpdateRequest,
} from '../services/userAdminService';
import UserFormModal from '../components/UserFormModal';

const formatCpf = (cpf: string) => {
  const digits = (cpf ?? '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const maskDocument = (doc: string) => {
  const digits = (doc ?? '').replace(/\D/g, '');

  // CPF (11 dígitos): 123.***.***-09
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
  }

  // CNPJ (14 dígitos): 12.***.***/**09-90
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/**${digits.slice(10, 12)}-${digits.slice(12)}`;
  }

  // Documento inválido ou vazio
  return '***';
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'ATIVO':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'INATIVO':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'BLOQUEADO':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<UserAdminDTO | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await userAdminService.list();
      // Stable ordering: name then email
      data.sort((a, b) => (a.nomeCompleto || '').localeCompare(b.nomeCompleto || '') || (a.email || '').localeCompare(b.email || ''));
      setUsers(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const documento = (u.documento ?? '').toLowerCase();
      return (
        (u.nomeCompleto ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        documento.includes(q) ||
        maskDocument(documento).toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const openCreate = () => {
    setModalMode('create');
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (u: UserAdminDTO) => {
    setModalMode('edit');
    setSelected(u);
    setModalOpen(true);
  };

  const onCreate = async (payload: UserAdminCreateRequest) => {
    await userAdminService.create(payload);
    setMessage({ type: 'success', text: 'Usuário criado com sucesso' });
    await load();
  };

  const onUpdate = async (id: number, payload: UserAdminUpdateRequest) => {
    await userAdminService.update(id, payload);
    setMessage({ type: 'success', text: 'Usuário atualizado com sucesso' });
    await load();
  };

  const onToggleStatus = async (u: UserAdminDTO) => {
    const newStatus: UserStatus = u.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    const action = newStatus === 'INATIVO' ? 'desabilitar' : 'habilitar';
    const ok = window.confirm(`Deseja ${action} o usuário "${u.nomeCompleto}"?`);
    if (!ok) return;

    try {
      await userAdminService.update(u.id, { status: newStatus });
      setMessage({ type: 'success', text: `Usuário ${action} com sucesso` });
      await load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.error || `Erro ao ${action} usuário` });
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-600">Cadastro e controle de acesso</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          + Novo Usuário
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou documento..."
            className="w-full md:max-w-md border rounded px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded border text-sm font-medium hover:bg-gray-50"
          >
            Recarregar
          </button>

          <div className="md:ml-auto text-sm text-gray-600">
            Total: <span className="font-semibold text-gray-900">{filtered.length}</span>
          </div>
        </div>
      </div>

      {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-600">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-600">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Nome</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">E-mail</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Documento</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Perfil</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Status</th>
                  <th className="text-right font-semibold text-gray-700 px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.nomeCompleto}</div>
                      {u.cargoFuncao && <div className="text-xs text-gray-500">{u.cargoFuncao}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{maskDocument(u.documento || '')}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {u.role === 'ADMIN'
                        ? 'Admin'
                        : u.role === 'GESTOR'
                          ? 'Gestor'
                          : u.role === 'JURIDICO'
                            ? 'Jurídico'
                            : u.role === 'ANALISTA'
                              ? 'Analista'
                              : u.role === 'ORCAMENTO'
                                ? 'Orçamento'
                                : 'Operador'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${statusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="px-3 py-1.5 rounded border text-sm hover:bg-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(u)}
                          className="px-3 py-1.5 rounded border text-sm text-red-700 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        user={selected}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      {message && (
        <div className={`fixed bottom-4 right-4 mb-4 mr-4 p-3 rounded shadow-md text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default UsersPage;

