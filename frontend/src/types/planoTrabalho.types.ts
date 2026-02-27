export interface PlanoTrabalho {
  id: string;
  titulo: string;
  descricao?: string;
  instituicaoId?: string;
  emendaId?: string;
  // enriched fields returned by the API (joined from emenda)
  emendaCodigo?: string;
  emendaValor?: number;
  valor?: number;
  status?: 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REPROVADO';
  createTime?: string;
  updateTime?: string;
}
