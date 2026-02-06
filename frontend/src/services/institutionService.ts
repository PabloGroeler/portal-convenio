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

  // Auditoria
  createTime?: string;
  updateTime?: string;
}

const institutionService = {
  list: async (): Promise<InstitutionDTO[]> => {
    const response = await api.get('/institutions');
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

  create: async (institution: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    const response = await api.post('/institutions', institution);
    return response.data;
  },

  update: async (id: string, institution: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    // Backend uses institutionId as the identifier (@Id).
    const response = await api.put(`/institutions/${encodeURIComponent(id)}`, institution);
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
};

export default institutionService;

