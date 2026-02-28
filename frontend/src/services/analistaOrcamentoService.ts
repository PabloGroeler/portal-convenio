import api from './api';
import { UserAdminDTO } from './userAdminService';
export interface AnalistaOrcamentoDTO {
  id: number;
  analistaId: number;
  analistaNome: string;
  analistaEmail: string;
  atribuidoPorId: number;
  atribuidoPorNome: string;
  dataAtribuicao: string;
  ativo: boolean;
}
export async function getAnalistaAtivo(emendaId: string): Promise<AnalistaOrcamentoDTO | null> {
  const res = await api.get<AnalistaOrcamentoDTO>(`/emendas/${emendaId}/analista-orcamento`);
  if (res.status === 204) return null;
  return res.data;
}
export async function atribuirAnalista(emendaId: string, analistaId: number): Promise<AnalistaOrcamentoDTO> {
  const { data } = await api.post<AnalistaOrcamentoDTO>(`/emendas/${emendaId}/analista-orcamento`, { analistaId });
  return data;
}
export async function removerAnalista(emendaId: string): Promise<void> {
  await api.delete(`/emendas/${emendaId}/analista-orcamento`);
}
export async function listarAnalistasOrcamento(): Promise<UserAdminDTO[]> {
  const { data } = await api.get<UserAdminDTO[]>('/usuarios/analistas-orcamento');
  return data;
}
