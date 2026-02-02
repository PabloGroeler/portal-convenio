import api from './api';

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

  // Auditoria
  dataCriacao?: string;
  dataAtualizacao?: string;
}

const institutionService = {
  list: async (): Promise<InstitutionDTO[]> => {
    const response = await api.get('/institutions');
    return response.data;
  },

  getById: async (id: string): Promise<InstitutionDTO> => {
    // Backend uses institutionId as the identifier (@Id).
    const response = await api.get(`/institutions/by-instituicao-id/${encodeURIComponent(id)}`);
    return response.data;
  },

  getByInstitutionId: async (institutionId: string): Promise<InstitutionDTO> => {
    const response = await api.get(`/institutions/by-instituicao-id/${institutionId}`);
    return response.data;
  },

  create: async (instituicao: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    const response = await api.post('/institutions', instituicao);
    return response.data;
  },

  update: async (id: string, instituicao: Partial<InstitutionDTO>): Promise<InstitutionDTO> => {
    // Backend uses institutionId as the identifier (@Id).
    const response = await api.put(`/institutions/${encodeURIComponent(id)}`, instituicao);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/institutions/${encodeURIComponent(id)}`);
  },
};

export type { InstitutionDTO };
export { institutionService };
export default institutionService;

