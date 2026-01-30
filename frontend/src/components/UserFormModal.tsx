import React, { useEffect, useMemo, useState } from 'react';
import type {
  UserAdminCreateRequest,
  UserAdminDTO,
  UserAdminUpdateRequest,
  UserRole,
  UserStatus,
} from '../services/userAdminService';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  user?: UserAdminDTO | null;
  onClose: () => void;
  onCreate: (payload: UserAdminCreateRequest) => Promise<void>;
  onUpdate: (id: number, payload: UserAdminUpdateRequest) => Promise<void>;
};

const normalizeCpf = (cpf: string) => cpf.replace(/\D/g, '').slice(0, 11);

const UserFormModal: React.FC<Props> = ({ open, mode, user, onClose, onCreate, onUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = useMemo(() => {
    if (mode === 'edit' && user) {
      return {
        nomeCompleto: user.nomeCompleto ?? '',
        cpf: user.cpf ?? '',
        email: user.email ?? '',
        telefone: user.telefone ?? '',
        cargoFuncao: user.cargoFuncao ?? '',
        status: user.status ?? 'ATIVO',
        role: user.role ?? 'OPERADOR',
        password: '',
      };
    }

    return {
      nomeCompleto: '',
      cpf: '',
      email: '',
      telefone: '',
      cargoFuncao: '',
      status: 'ATIVO' as UserStatus,
      role: 'OPERADOR' as UserRole,
      password: '',
    };
  }, [mode, user]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(initial);
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = async () => {
    setError(null);

    if (!form.nomeCompleto.trim()) return setError('Nome completo é obrigatório');
    if (!form.email.trim()) return setError('E-mail é obrigatório');
    if (normalizeCpf(form.cpf).length !== 11) return setError('CPF deve conter 11 dígitos');

    try {
      setSaving(true);
      if (mode === 'create') {
        if (!form.password.trim()) return setError('Senha é obrigatória');
        await onCreate({
          nomeCompleto: form.nomeCompleto.trim(),
          cpf: normalizeCpf(form.cpf),
          email: form.email.trim(),
          telefone: (form.telefone || '').trim() || undefined,
          cargoFuncao: (form.cargoFuncao || '').trim() || undefined,
          status: form.status,
          role: form.role,
          password: form.password,
        });
      } else if (mode === 'edit' && user) {
        const payload: UserAdminUpdateRequest = {
          nomeCompleto: form.nomeCompleto.trim(),
          cpf: normalizeCpf(form.cpf),
          email: form.email.trim(),
          telefone: (form.telefone || '').trim() || undefined,
          cargoFuncao: (form.cargoFuncao || '').trim() || undefined,
          status: form.status,
          role: form.role,
        };
        if (form.password.trim()) payload.password = form.password;
        await onUpdate(user.id, payload);
      }
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded hover:bg-gray-100"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome completo</label>
              <input
                value={form.nomeCompleto}
                onChange={(e) => setForm((p) => ({ ...p, nomeCompleto: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input
                value={form.cpf}
                onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cargo / Função</label>
              <input
                value={form.cargoFuncao}
                onChange={(e) => setForm((p) => ({ ...p, cargoFuncao: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as UserStatus }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Perfil</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="OPERADOR">Operador</option>
                <option value="GESTOR">Gestor</option>
                <option value="JURIDICO">Jurídico</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {mode === 'create' ? 'Senha' : 'Senha (opcional)'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;

