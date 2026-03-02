import React, { useEffect, useMemo, useState } from 'react';
import type {
  UserAdminCreateRequest,
  UserAdminDTO,
  UserAdminUpdateRequest,
  UserRole,
  UserStatus,
} from '../services/userAdminService';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface SecretariaDTO { id: number; codigo: string; nome: string; }

const normalizeDocument = (doc: string) => {
  const digits = doc.replace(/\D/g, '');
  // CPF: 11 dígitos, CNPJ: 14 dígitos
  return digits.slice(0, 14);
};

// Cargo options grouped by suggested role
const CARGO_OPTIONS: { label: string; value: string; suggestRole?: string }[] = [
  // Orçamento
  { label: 'Analista de Orçamento', value: 'Analista de Orçamento', suggestRole: 'ORCAMENTO' },
  { label: 'Técnico de Orçamento', value: 'Técnico de Orçamento', suggestRole: 'ORCAMENTO' },
  { label: 'Coordenador de Orçamento', value: 'Coordenador de Orçamento', suggestRole: 'ORCAMENTO' },
  // Secretaria
  { label: 'Servidor de Secretaria', value: 'Servidor de Secretaria', suggestRole: 'SECRETARIA' },
  { label: 'Técnico de Secretaria', value: 'Técnico de Secretaria', suggestRole: 'SECRETARIA' },
  // Convênios
  { label: 'Analista de Convênios', value: 'Analista de Convênios', suggestRole: 'CONVENIOS' },
  { label: 'Técnico de Convênios', value: 'Técnico de Convênios', suggestRole: 'CONVENIOS' },
  // Jurídico
  { label: 'Assessor Jurídico', value: 'Assessor Jurídico', suggestRole: 'JURIDICO' },
  { label: 'Procurador', value: 'Procurador', suggestRole: 'JURIDICO' },
  { label: 'Advogado', value: 'Advogado', suggestRole: 'JURIDICO' },
  // Gestor
  { label: 'Gestor de Convênios', value: 'Gestor de Convênios', suggestRole: 'GESTOR' },
  { label: 'Coordenador de Emendas', value: 'Coordenador de Emendas', suggestRole: 'GESTOR' },
  { label: 'Secretário Municipal', value: 'Secretário Municipal', suggestRole: 'GESTOR' },
  // Operador
  { label: 'Operador de Sistema', value: 'Operador de Sistema', suggestRole: 'OPERADOR' },
  { label: 'Assistente Administrativo', value: 'Assistente Administrativo', suggestRole: 'OPERADOR' },
  { label: 'Técnico Administrativo', value: 'Técnico Administrativo', suggestRole: 'OPERADOR' },
  // Outros
  { label: 'Prefeito', value: 'Prefeito' },
  { label: 'Vice-Prefeito', value: 'Vice-Prefeito' },
  { label: 'Vereador', value: 'Vereador' },
  { label: 'Outro', value: '' },
];

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  user?: UserAdminDTO | null;
  onClose: () => void;
  onCreate: (payload: UserAdminCreateRequest) => Promise<void>;
  onUpdate: (id: number, payload: UserAdminUpdateRequest) => Promise<void>;
};

const UserFormModal: React.FC<Props> = ({ open, mode, user, onClose, onCreate, onUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: secretarias = [] } = useQuery<SecretariaDTO[]>({
    queryKey: ['secretarias-municipais'],
    queryFn: async () => {
      const { data } = await api.get('/secretarias-municipais');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const initial = useMemo(() => {
    if (mode === 'edit' && user) {
      return {
        nomeCompleto: user.nomeCompleto ?? '',
        document: user.documento ?? '',
        email: user.email ?? '',
        telefone: user.telefone ?? '',
        cargoFuncao: user.cargoFuncao ?? '',
        secretaria: user.secretaria ?? '',
        status: user.status ?? 'ATIVO',
        role: user.role ?? 'OPERADOR',
        password: '',
      };
    }
    return {
      nomeCompleto: '',
      document: '',
      email: '',
      telefone: '',
      cargoFuncao: '',
      secretaria: '',
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

    const docDigits = normalizeDocument(form.document);
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      return setError('Documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)');
    }

    if (form.role === 'SECRETARIA' && !form.secretaria.trim()) {
      return setError('Selecione a secretaria para usuários com perfil Secretaria.');
    }

    try {
      setSaving(true);
      if (mode === 'create') {
        if (!form.password.trim()) return setError('Senha é obrigatória');
        const payload: UserAdminCreateRequest = {
          nomeCompleto: form.nomeCompleto.trim(),
          documento: docDigits,
          email: form.email.trim(),
          telefone: (form.telefone || '').trim() || undefined,
          cargoFuncao: (form.cargoFuncao || '').trim() || undefined,
          secretaria: form.role === 'SECRETARIA' ? form.secretaria.trim() : undefined,
          status: form.status,
          role: form.role,
          password: form.password,
        };
        await onCreate(payload);
      } else if (mode === 'edit' && user) {
        const payload: UserAdminUpdateRequest = {
          nomeCompleto: form.nomeCompleto.trim(),
          documento: docDigits,
          email: form.email.trim(),
          telefone: (form.telefone || '').trim() || undefined,
          cargoFuncao: (form.cargoFuncao || '').trim() || undefined,
          secretaria: form.role === 'SECRETARIA' ? form.secretaria.trim() : undefined,
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </h2>
          <button type="button" onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded hover:bg-gray-100" aria-label="Fechar">×</button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome completo</label>
              <input value={form.nomeCompleto} onChange={(e) => setForm((p) => ({ ...p, nomeCompleto: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Documento (CPF ou CNPJ)</label>
              <input value={form.document} onChange={(e) => setForm((p) => ({ ...p, document: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cargo / Função</label>
              <select
                value={form.cargoFuncao}
                onChange={(e) => {
                  const selected = CARGO_OPTIONS.find(o => o.value === e.target.value);
                  setForm((p) => ({
                    ...p,
                    cargoFuncao: e.target.value,
                    ...(selected?.suggestRole ? { role: selected.suggestRole as UserRole } : {}),
                  }));
                }}
                className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">Selecione um cargo...</option>
                {CARGO_OPTIONS.map((o) => (
                  <option key={o.value || 'outro'} value={o.value}>{o.label}</option>
                ))}
              </select>
              {form.cargoFuncao && CARGO_OPTIONS.find(o => o.value === form.cargoFuncao)?.suggestRole && (
                <p className="mt-1 text-xs text-blue-600">
                  Perfil sugerido: <strong>{CARGO_OPTIONS.find(o => o.value === form.cargoFuncao)?.suggestRole}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Perfil</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole, secretaria: '' }))}
                className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
              >
                <optgroup label="── Workflow de Emendas ──">
                  <option value="ORCAMENTO">Orçamento</option>
                  <option value="SECRETARIA">Secretaria</option>
                  <option value="CONVENIOS">Convênios</option>
                  <option value="ADMIN">Administrador</option>
                </optgroup>
                <optgroup label="── Gestão Institucional ──">
                  <option value="OPERADOR">Operador</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="JURIDICO">Jurídico</option>
                </optgroup>
              </select>
            </div>

            {/* Secretaria — só aparece quando perfil = SECRETARIA */}
            {form.role === 'SECRETARIA' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Secretaria <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.secretaria}
                  onChange={(e) => setForm((p) => ({ ...p, secretaria: e.target.value }))}
                  className="mt-1 w-full border border-teal-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-300 focus:outline-none"
                >
                  <option value="">Selecione a secretaria...</option>
                  {secretarias.map((s) => (
                    <option key={s.id} value={s.nome}>{s.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as UserStatus }))} className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="PENDENTE">Pendente</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{mode === 'create' ? 'Senha' : 'Senha (opcional)'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">Cancelar</button>
          <button type="button" disabled={saving} onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;

