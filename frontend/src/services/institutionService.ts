import api from './api';
import { StatusOSC } from '../types/statusOSC.types';

export interface InstitutionDTO {
  id?: string;
  institutionId: string;

  // Dados Básicos
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal: string;
  dataFundacao?: string; // yyyy-MM-dd
  areasAtuacao?: string[];

  // Contato
  telefone: string;
  celular?: string;
  emailInstitucional: string;
  emailSecundario?: string;
  website?: string;

  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  pontoReferencia?: string;

  // Adicionais
  numeroRegistroConselhoMunicipal: string;
  dataRegistroConselho?: string; // yyyy-MM-dd
  objetoSocial?: string;
  quantidadeBeneficiarios?: number;

  // RF-02.3 - Status da OSC
  statusOSC?: StatusOSC;
  justificativaSuspensao?: string;

  // Status de Aprovação da Instituição
  statusAprovacao?: 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REPROVADA';
  dataAprovacao?: string;
  dataReprovacao?: string;
  observacoesAprovacao?: string;
  motivoReprovacao?: string;
  usuarioAprovador?: string;

  // Auditoria
  createTime?: string;
  updateTime?: string;
}

const institutionService = {
  // Lista TODAS as instituições (admin only / uso interno)
  list: async (): Promise<InstitutionDTO[]> => {
    const response = await api.get('/institutions');
    return response.data;
  },

  // Lista apenas instituições visíveis para o usuário logado (filtro por role no backend)
  listForUser: async (): Promise<InstitutionDTO[]> => {
    const response = await api.get('/institutions/for-user');
    return response.data;
  },

  getById: async (id: string): Promise<InstitutionDTO> => {
    // Backend uses institutionId as the identifier (@Id).
    const response = await api.get(`/institutions/by-institution-id/${encodeURIComponent(id)}`);
    return response.data;
  },

  getByInstitutionId: async (institutionId: string): Promise<InstitutionDTO> => {
    const response = await api.get(`/institutions/by-institution-id/${institutionId}`);
    return response.data;
  },

  getByCnpj: async (cnpj: string): Promise<InstitutionDTO> => {
    const response = await api.get(`/institutions/by-cnpj/${cnpj}`);
    return response.data;
  },

  create: async (institution: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    console.log('📤 institutionService.create CHAMADO');
    console.log('⚠️ ATENÇÃO: Criando NOVA instituição (POST)');
    console.log('URL: /institutions');
    console.log('Payload:', institution);
    console.log('Método HTTP: POST');

    const response = await api.post('/institutions', institution);

    console.log('✅ institutionService.create SUCESSO');
    console.log('Response:', response.data);

    return response.data;
  },

  update: async (id: string, institution: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    // Backend uses institutionId as the identifier (@Id).
    console.log('📤 institutionService.update CHAMADO');
    console.log('ID:', id);
    console.log('URL completa:', `/institutions/${encodeURIComponent(id)}`);
    console.log('Payload:', institution);
    console.log('Método HTTP: PUT');

    const response = await api.put(`/institutions/${encodeURIComponent(id)}`, institution);

    console.log('✅ institutionService.update SUCESSO');
    console.log('Response:', response.data);

    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/institutions/${encodeURIComponent(id)}`);
  },

  // RF-02.3 - Gerenciamento de Status
  alterarStatus: async (id: string, novoStatus: StatusOSC, justificativa?: string): Promise<InstitutionDTO> => {
    const response = await api.post(`/institutions/${encodeURIComponent(id)}/status`, {
      novoStatus,
      justificativa,
    });
    return response.data;
  },

  calcularStatusAutomatico: async (id: string): Promise<{ statusCalculado: StatusOSC; mudou: boolean }> => {
    const response = await api.get(`/institutions/${encodeURIComponent(id)}/calcular-status`);
    return response.data;
  },

  getHistoricoStatus: async (id: string): Promise<any[]> => {
    const response = await api.get(`/institutions/${encodeURIComponent(id)}/historico-status`);
    return response.data;
  },

  // Vincular usuário logado à instituição
  vincularUsuario: async (id: string): Promise<{ message: string; usuario: string; instituicao: string }> => {
    console.log('🔗 institutionService.vincularUsuario CHAMADO');
    console.log('   Institution ID:', id);
    console.log('   URL:', `/institutions/${encodeURIComponent(id)}/vincular`);
    console.log('   Método: POST');

    const response = await api.post(`/institutions/${encodeURIComponent(id)}/vincular`);

    console.log('✅ institutionService.vincularUsuario SUCESSO');
    console.log('   Response:', response.data);

    return response.data;
  },

  // Aprovar instituição (após análise de documentos)
  aprovar: async (id: string, observacoes?: string): Promise<InstitutionDTO> => {
    console.log('✅ institutionService.aprovar CHAMADO');
    console.log('   Institution ID:', id);
    console.log('   Observações:', observacoes);

    const response = await api.post(`/institutions/${encodeURIComponent(id)}/aprovar`, { observacoes });

    console.log('✅ institutionService.aprovar SUCESSO');
    return response.data;
  },

  // Reprovar instituição (após análise de documentos)
  reprovar: async (id: string, motivo: string): Promise<InstitutionDTO> => {
    console.log('❌ institutionService.reprovar CHAMADO');
    console.log('   Institution ID:', id);
    console.log('   Motivo:', motivo);

    const response = await api.post(`/institutions/${encodeURIComponent(id)}/reprovar`, { motivo });

    console.log('❌ institutionService.reprovar SUCESSO');
    return response.data;
  },
};

export default institutionService;

