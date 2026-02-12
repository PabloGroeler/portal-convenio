import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import institutionService from '../services/institutionService';
import type { InstitutionDTO } from '../services/institutionService';
import { getCurrentUserData } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { lookupCep } from '../services/cepService';
import {
  formatCep,
  formatCnpj,
  formatPhoneBR,
  isValidCnpj,
  isValidEmail,
  isValidUrl,
  onlyDigits,
} from '../utils/formatters';
import dirigenteService from '../services/dirigenteService';
import type { Dirigente } from '../types/dirigente.types';
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  CARGO_OPTIONS,
  UF_OPTIONS
} from '../types/dirigente.types';
import documentoService from '../services/documentoService';
import type { DocumentoInstitucional } from '../types/documento.types';
import { TIPOS_DOCUMENTO, formatFileSize, getFileIcon } from '../types/documento.types';
import documentoInstitucionalService from '../services/documentoInstitucionalService';
import type { DocumentoInstitucional as DocInstitucional, TipoDocumentoInstitucional, StatusDocumento } from '../types/documentoInstitucional.types';
import {
  TIPOS_DOCUMENTO_LABELS,
  STATUS_DOCUMENTO_LABELS,
  STATUS_DOCUMENTO_COLORS,
  DOCUMENTOS_OBRIGATORIOS,
  DOCUMENTOS_INSTITUICAO,
  FORMATOS_ACEITOS,
  TAMANHO_MAXIMO_BYTES,
  formatFileSize as formatFileSize2,
  getFileIcon as getFileIcon2,
  calcularDiasParaVencimento,
  verificarDocumentoVencido,
  verificarDocumentoProximoVencimento,
} from '../types/documentoInstitucional.types';
import {
  StatusOSC,
  calcularStatusAutomatico,
  STATUS_OSC_LABELS,
  STATUS_OSC_COLORS,
} from '../types/statusOSC.types';
import { StatusOSCBadge, StatusOSCPanel } from '../components/StatusOSCComponents';
import tipoDocumentoConfigService from '../services/tipoDocumentoConfigService';
import type { TipoDocumentoConfig } from '../services/tipoDocumentoConfigService';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const AREAS_ATUACAO_OPTIONS = [
  'Assistência Social',
  'Saúde',
  'Educação',
  'Cultura',
  'Esporte',
  'Meio Ambiente',
  'Direitos Humanos',
  'Outra',
];

type FormState = Partial<InstitutionDTO>;

const CadastroDadosInstitucionaisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const editId = searchParams.get('id');

  const [loadingExisting, setLoadingExisting] = useState(false);

  const [form, setForm] = useState<FormState>({
     razaoSocial: '',
     nomeFantasia: '',
     cnpj: '',
     inscricaoEstadual: '',
     inscricaoMunicipal: '',
     dataFundacao: '',
     areasAtuacao: [],

     telefone: '',
     celular: '',
     emailInstitucional: '',
     emailSecundario: '',
     website: '',

     cep: '',
     logradouro: '',
     numero: '',
     complemento: '',
     bairro: '',
     cidade: '',
     uf: 'MT',
     pontoReferencia: '',

     numeroRegistroConselhoMunicipal: '',
     dataRegistroConselho: '',
     objetoSocial: '',
     quantidadeBeneficiarios: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para abas e dirigentes
  const [activeTab, setActiveTab] = useState<'instituicao' | 'dirigentes' | 'documentos'>('instituicao');
  const [dirigentes, setDirigentes] = useState<Dirigente[]>([]);
  const [loadingDirigentes, setLoadingDirigentes] = useState(false);
  const [showDirigenteModal, setShowDirigenteModal] = useState(false);
  const [editingDirigente, setEditingDirigente] = useState<Dirigente | null>(null);
  const [apenasAtivos, setApenasAtivos] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);

  // Estados para validação de dirigente
  const [dirigenteErrors, setDirigenteErrors] = useState<Record<string, string>>({});
  const [loadingCepDirigente, setLoadingCepDirigente] = useState(false);

  // Estados para documentos institucionais
  const [documentosInstitucionais, setDocumentosInstitucionais] = useState<DocInstitucional[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumentoSelecionado, setTipoDocumentoSelecionado] = useState<TipoDocumentoInstitucional | ''>('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [observacoesDoc, setObservacoesDoc] = useState('');
  const [editingDocumento, setEditingDocumento] = useState<DocInstitucional | null>(null);
  const [showModalDocumento, setShowModalDocumento] = useState(false);

  // RF-02.3 - Status da OSC
  const [statusOSC, setStatusOSC] = useState<StatusOSC>(StatusOSC.EM_CADASTRO);

  // Document type configurations
  const [documentConfigs, setDocumentConfigs] = useState<TipoDocumentoConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [selectedDocConfig, setSelectedDocConfig] = useState<TipoDocumentoConfig | null>(null);

  const [dirigenteFormData, setDirigenteFormData] = useState<Dirigente>({
    instituicaoId: editId || '',
    nomeCompleto: '',
    cpf: '',
    rg: '',
    orgaoExpedidor: '',
    ufOrgaoExpedidor: '',
    dataExpedicao: '',
    dataNascimento: '',
    sexo: '',
    nacionalidade: 'Brasileira',
    estadoCivil: '',
    cargo: '',
    dataInicioCargo: '',
    statusCargo: 'Ativo',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    const required = (key: keyof FormState, msg: string) => {
      const v = (form[key] as unknown as string) ?? '';
      if (!String(v).trim()) e[String(key)] = msg;
    };

    // Dados básicos
    required('razaoSocial', 'Razão Social é obrigatória.');
    if ((form.razaoSocial ?? '').length > 200) e.razaoSocial = 'Máx. 200 caracteres.';

    if ((form.nomeFantasia ?? '').length > 200) e.nomeFantasia = 'Máx. 200 caracteres.';

    required('cnpj', 'CNPJ é obrigatório.');
    if (form.cnpj && !isValidCnpj(form.cnpj)) e.cnpj = 'CNPJ inválido.';

    if ((form.inscricaoEstadual ?? '').length > 20) e.inscricaoEstadual = 'Máx. 20 caracteres.';

    required('inscricaoMunicipal', 'Inscrição Municipal é obrigatória.');
    if ((form.inscricaoMunicipal ?? '').length > 20) e.inscricaoMunicipal = 'Máx. 20 caracteres.';

    // Contato
    required('telefone', 'Telefone é obrigatório.');
    if (form.telefone) {
      const digits = onlyDigits(form.telefone);
      if (digits.length < 10) e.telefone = 'Telefone inválido.';
    }

    if (form.celular) {
      const digits = onlyDigits(form.celular);
      if (digits.length !== 11) e.celular = 'Celular inválido.';
    }

    required('emailInstitucional', 'E-mail institucional é obrigatório.');
    if (form.emailInstitucional && !isValidEmail(form.emailInstitucional)) e.emailInstitucional = 'E-mail inválido.';

    if (form.emailSecundario && !isValidEmail(form.emailSecundario)) e.emailSecundario = 'E-mail inválido.';

    if (form.website && !isValidUrl(form.website)) e.website = 'Website inválido (use http/https).';

    // Endereço
    required('cep', 'CEP é obrigatório.');
    if (form.cep) {
      const digits = onlyDigits(form.cep);
      if (digits.length !== 8) e.cep = 'CEP inválido.';
    }

    required('logradouro', 'Logradouro é obrigatório.');
    required('numero', 'Número é obrigatório.');
    required('bairro', 'Bairro é obrigatório.');
    required('cidade', 'Cidade é obrigatória.');
    required('uf', 'UF é obrigatória.');

    // Adicionais
    required('numeroRegistroConselhoMunicipal', 'Número de registro no Conselho Municipal é obrigatório.');

    if (form.quantidadeBeneficiarios != null) {
      const n = Number(form.quantidadeBeneficiarios);
      if (Number.isNaN(n) || n < 0) e.quantidadeBeneficiarios = 'Informe um número válido (>= 0).';
    }

    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleToggleArea = (area: string) => {
    const current = form.areasAtuacao ?? [];
    if (current.includes(area)) {
      setField('areasAtuacao', current.filter((a) => a !== area));
    } else {
      setField('areasAtuacao', [...current, area]);
    }
  };

  // Funções para gerenciar dirigentes
  const loadDirigentes = async () => {
    if (!editId) return;

    try {
      setLoadingDirigentes(true);
      const data = await dirigenteService.listar(editId, apenasAtivos);
      setDirigentes(data);

      // Carregar avisos
      const response = await dirigenteService.verificarAvisos(editId);
      setAvisos(response.avisos);
    } catch (error) {
      console.error('Erro ao carregar dirigentes:', error);
    } finally {
      setLoadingDirigentes(false);
    }
  };

  const handleOpenDirigenteModal = (dirigente?: Dirigente) => {
    if (dirigente) {
      setEditingDirigente(dirigente);
      setDirigenteFormData(dirigente);
    } else {
      setEditingDirigente(null);
      setDirigenteFormData({
        instituicaoId: editId || '',
        nomeCompleto: '',
        cpf: '',
        rg: '',
        orgaoExpedidor: '',
        ufOrgaoExpedidor: '',
        dataExpedicao: '',
        dataNascimento: '',
        sexo: '',
        nacionalidade: 'Brasileira',
        estadoCivil: '',
        cargo: '',
        dataInicioCargo: '',
        statusCargo: 'Ativo',
        telefone: '',
        email: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: ''
      });
    }
    setShowDirigenteModal(true);
  };

  const handleSaveDirigente = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    const errors = validateDirigenteForm();
    if (Object.keys(errors).length > 0) {
      setDirigenteErrors(errors);

      // Criar lista de campos com erro
      const camposComErro = Object.entries(errors).map(([campo, mensagem]) => {
        const nomeCampo = getNomeCampo(campo);
        return `• ${nomeCampo}: ${mensagem}`;
      }).join('\n');

      alert(`Por favor, corrija os seguintes erros:\n\n${camposComErro}`);

      // Scroll para o primeiro campo com erro
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500') as HTMLElement;
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }, 100);

      return;
    }

    try {
      if (editingDirigente) {
        await dirigenteService.atualizar(editingDirigente.id!, dirigenteFormData);
        alert('Dirigente atualizado com sucesso!');
      } else {
        await dirigenteService.criar(dirigenteFormData);
        alert('Dirigente cadastrado com sucesso!');
      }

      setShowDirigenteModal(false);
      setDirigenteErrors({});
      loadDirigentes();
    } catch (error: any) {
      console.error('Erro ao salvar dirigente:', error);
      alert(error.response?.data?.error || 'Erro ao salvar dirigente');
    }
  };

  // Validação do formulário de dirigente
  const getNomeCampo = (campo: string): string => {
    const nomes: Record<string, string> = {
      nomeCompleto: 'Nome Completo',
      cpf: 'CPF',
      rg: 'RG',
      orgaoExpedidor: 'Órgão Expedidor',
      ufOrgaoExpedidor: 'UF do Órgão',
      dataExpedicao: 'Data de Expedição',
      dataNascimento: 'Data de Nascimento',
      sexo: 'Sexo',
      estadoCivil: 'Estado Civil',
      cargo: 'Cargo',
      dataInicioCargo: 'Data de Início do Cargo',
      email: 'E-mail',
      telefone: 'Telefone',
      cep: 'CEP',
      logradouro: 'Logradouro',
      numero: 'Número',
      bairro: 'Bairro',
      cidade: 'Cidade',
      uf: 'UF'
    };
    return nomes[campo] || campo;
  };

  const validateDirigenteForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Nome completo
    if (!dirigenteFormData.nomeCompleto || dirigenteFormData.nomeCompleto.trim().length < 3) {
      errors.nomeCompleto = 'Nome completo deve ter no mínimo 3 caracteres';
    }

    // CPF
    if (!dirigenteFormData.cpf || dirigenteFormData.cpf.replace(/\D/g, '').length !== 11) {
      errors.cpf = 'CPF inválido (deve ter 11 dígitos)';
    }

    // RG
    if (!dirigenteFormData.rg || dirigenteFormData.rg.trim().length < 5) {
      errors.rg = 'RG inválido';
    }

    // Órgão expedidor
    if (!dirigenteFormData.orgaoExpedidor || dirigenteFormData.orgaoExpedidor.trim().length < 2) {
      errors.orgaoExpedidor = 'Órgão expedidor inválido';
    }

    // UF do órgão
    if (!dirigenteFormData.ufOrgaoExpedidor) {
      errors.ufOrgaoExpedidor = 'Selecione a UF';
    }

    // Data de expedição
    if (!dirigenteFormData.dataExpedicao) {
      errors.dataExpedicao = 'Data de expedição obrigatória';
    } else if (new Date(dirigenteFormData.dataExpedicao) > new Date()) {
      errors.dataExpedicao = 'Data não pode ser futura';
    }

    // Data de nascimento
    if (!dirigenteFormData.dataNascimento) {
      errors.dataNascimento = 'Data de nascimento obrigatória';
    } else {
      const idade = new Date().getFullYear() - new Date(dirigenteFormData.dataNascimento).getFullYear();
      if (idade < 18) {
        errors.dataNascimento = 'Dirigente deve ter no mínimo 18 anos';
      }
      if (idade > 120) {
        errors.dataNascimento = 'Data de nascimento inválida';
      }
    }

    // Sexo
    if (!dirigenteFormData.sexo) {
      errors.sexo = 'Selecione o sexo';
    }

    // Estado civil
    if (!dirigenteFormData.estadoCivil) {
      errors.estadoCivil = 'Selecione o estado civil';
    }

    // Cargo
    if (!dirigenteFormData.cargo) {
      errors.cargo = 'Selecione o cargo';
    }

    // Data início cargo
    if (!dirigenteFormData.dataInicioCargo) {
      errors.dataInicioCargo = 'Data de início obrigatória';
    }

    // Email
    if (!dirigenteFormData.email || !isValidEmail(dirigenteFormData.email)) {
      errors.email = 'Email inválido';
    }

    // Telefone
    if (!dirigenteFormData.telefone || dirigenteFormData.telefone.replace(/\D/g, '').length < 10) {
      errors.telefone = 'Telefone inválido (mínimo 10 dígitos)';
    }

    // CEP
    if (!dirigenteFormData.cep || dirigenteFormData.cep.replace(/\D/g, '').length !== 8) {
      errors.cep = 'CEP inválido (deve ter 8 dígitos)';
    }

    // Logradouro
    if (!dirigenteFormData.logradouro || dirigenteFormData.logradouro.trim().length < 3) {
      errors.logradouro = 'Logradouro inválido';
    }

    // Número
    if (!dirigenteFormData.numero || dirigenteFormData.numero.trim().length === 0) {
      errors.numero = 'Número obrigatório';
    }

    // Bairro
    if (!dirigenteFormData.bairro || dirigenteFormData.bairro.trim().length < 2) {
      errors.bairro = 'Bairro inválido';
    }

    // Cidade
    if (!dirigenteFormData.cidade || dirigenteFormData.cidade.trim().length < 2) {
      errors.cidade = 'Cidade inválida';
    }

    // UF
    if (!dirigenteFormData.uf) {
      errors.uf = 'Selecione a UF';
    }

    return errors;
  };

  // Buscar CEP para dirigente
  const handleBuscarCepDirigente = async () => {
    const cepLimpo = dirigenteFormData.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      alert('CEP inválido. Digite 8 dígitos.');
      return;
    }

    try {
      setLoadingCepDirigente(true);
      const endereco = await lookupCep(cepLimpo);

      setDirigenteFormData({
        ...dirigenteFormData,
        logradouro: endereco.logradouro || '',
        bairro: endereco.bairro || '',
        cidade: endereco.localidade || '',
        uf: endereco.uf || ''
      });

      // Limpar erros de endereço
      const newErrors = { ...dirigenteErrors };
      delete newErrors.cep;
      delete newErrors.logradouro;
      delete newErrors.bairro;
      delete newErrors.cidade;
      delete newErrors.uf;
      setDirigenteErrors(newErrors);

      alert('Endereço preenchido com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('CEP não encontrado. Preencha manualmente.');
    } finally {
      setLoadingCepDirigente(false);
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCEPDirigente = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Carregar dirigentes e documentos imediatamente (eager load) quando editId estiver disponível
  useEffect(() => {
    if (editId) {
      loadDirigentes();
      loadDocumentos();
    }
  }, [editId, apenasAtivos]);

  // Load document type configurations on mount
  useEffect(() => {
    loadDocumentConfigs();
  }, []);

  const loadDocumentConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const configs = await tipoDocumentoConfigService.listar();
      console.log('[loadDocumentConfigs] Loaded configs from backend:', configs);
      console.log('[loadDocumentConfigs] Config details:', configs.map(c => ({
        codigo: c.codigo,
        nome: c.nome,
        numeroObrigatorio: c.numeroDocumentoObrigatorio,
        dataEmissaoObrigatoria: c.dataEmissaoObrigatoria,
        dataValidadeObrigatoria: c.dataValidadeObrigatoria
      })));
      setDocumentConfigs(configs);
    } catch (error) {
      console.error('Erro ao carregar configurações de documentos:', error);
    } finally {
      setLoadingConfigs(false);
    }
  };

  // Handle tipo documento selection change
  const handleTipoDocumentoChange = (codigo: string) => {
    setTipoDocumentoSelecionado(codigo as TipoDocumentoInstitucional);

    if (codigo) {
      console.log('[handleTipoDocumentoChange] Looking for codigo:', codigo);
      console.log('[handleTipoDocumentoChange] Available configs:', documentConfigs.map(c => c.codigo));

      const config = documentConfigs.find(c => c.codigo === codigo);
      console.log('[handleTipoDocumentoChange] Found config:', config);

      setSelectedDocConfig(config || null);

      // Clear fields based on configuration
      if (config && !config.numeroDocumentoObrigatorio) {
        setNumeroDocumento('');
      }
      if (config && !config.dataEmissaoObrigatoria) {
        setDataEmissao('');
      }
      if (config && !config.dataValidadeObrigatoria) {
        setDataValidade('');
      }
    } else {
      setSelectedDocConfig(null);
    }
  };


  // Funções para gerenciamento de documentos institucionais
  const loadDocumentos = async () => {
    if (!editId) return;

    try {
      setLoadingDocumentos(true);
      const data = await documentoInstitucionalService.listar(editId);
      setDocumentosInstitucionais(data);

      // RF-02.3 - Calcular status automático após carregar documentos
      await calcularEAtualizarStatus(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      alert('Erro ao carregar documentos');
    } finally {
      setLoadingDocumentos(false);
    }
  };

  // RF-02.3 - Função para calcular e atualizar status automaticamente
  const calcularEAtualizarStatus = async (documentos: DocInstitucional[]) => {
    const temDocumentos = documentos.length > 0;
    const documentosObrigatoriosEnviados = DOCUMENTOS_OBRIGATORIOS.filter(tipo =>
      documentos.some(d => d.tipoDocumento === tipo)
    );
    const todosObrigatoriosEnviados = documentosObrigatoriosEnviados.length === DOCUMENTOS_OBRIGATORIOS.length;

    const novoStatus = calcularStatusAutomatico({
      temDocumentos,
      todosObrigatoriosEnviados,
      statusAtual: statusOSC,
    });

    if (novoStatus !== statusOSC) {
      console.log(`[StatusOSC] Mudança automática: ${statusOSC} → ${novoStatus}`);
      setStatusOSC(novoStatus);

      // TODO: Chamar backend para persistir mudança
      // await institutionService.alterarStatus(editId, novoStatus, 'Atualização automática');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > TAMANHO_MAXIMO_BYTES) {
      alert(`Arquivo muito grande! Tamanho máximo: ${TAMANHO_MAXIMO_BYTES / (1024 * 1024)}MB`);
      e.target.value = '';
      return;
    }

    // Validar formato
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FORMATOS_ACEITOS.includes(ext)) {
      alert(`Formato não aceito! Formatos permitidos: ${FORMATOS_ACEITOS.join(', ')}`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadDocumento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !tipoDocumentoSelecionado || !editId) {
      alert('Selecione o tipo de documento e o arquivo');
      return;
    }

    // Validate based on document type configuration
    if (selectedDocConfig) {
      const validationErrors: string[] = [];

      if (selectedDocConfig.numeroDocumentoObrigatorio && !numeroDocumento.trim()) {
        validationErrors.push('Número do Documento é obrigatório para este tipo de documento');
      }

      if (selectedDocConfig.dataEmissaoObrigatoria && !dataEmissao) {
        validationErrors.push('Data de Emissão é obrigatória para este tipo de documento');
      }

      if (selectedDocConfig.dataValidadeObrigatoria && !dataValidade) {
        validationErrors.push('Data de Validade é obrigatória para este tipo de documento');
      }

      if (validationErrors.length > 0) {
        alert('Por favor, corrija os seguintes erros:\n\n' + validationErrors.map(e => `• ${e}`).join('\n'));
        return;
      }
    }

    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('idInstituicao', editId);
      formData.append('tipoDocumento', tipoDocumentoSelecionado);

      if (dataEmissao) formData.append('dataEmissao', dataEmissao);
      if (dataValidade) formData.append('dataValidade', dataValidade);
      if (numeroDocumento) formData.append('numeroDocumento', numeroDocumento);
      if (observacoesDoc) formData.append('observacoes', observacoesDoc);

      await documentoInstitucionalService.upload(formData);

      alert('Documento enviado com sucesso!');

      // Limpar formulário
      setSelectedFile(null);
      setTipoDocumentoSelecionado('');
      setSelectedDocConfig(null);
      setDataEmissao('');
      setDataValidade('');
      setNumeroDocumento('');
      setObservacoesDoc('');

      // Limpar input file
      const fileInput = document.getElementById('file-input-inst') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Recarregar lista
      await loadDocumentos();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert(error.response?.data?.error || 'Erro ao enviar documento');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadDocumento = async (id: string) => {
    try {
      const url = documentoInstitucionalService.downloadUrl(id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento');
    }
  };

  const handleDeleteDocumento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await documentoInstitucionalService.deletar(id);
      alert('Documento excluído com sucesso!');
      await loadDocumentos();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Erro ao excluir documento');
    }
  };

  const handleAprovarDocumento = async (id: string) => {
    const observacoes = prompt('Observações (opcional):');
    if (observacoes === null) return; // Cancelou

    try {
      await documentoInstitucionalService.aprovar(id, observacoes || undefined);
      alert('Documento aprovado!');
      await loadDocumentos();
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      alert('Erro ao aprovar documento');
    }
  };

  const handleReprovarDocumento = async (id: string) => {
    const motivo = prompt('Motivo da reprovação (obrigatório):');
    if (!motivo) {
      alert('É necessário informar o motivo da reprovação');
      return;
    }

    try {
      await documentoInstitucionalService.reprovar(id, motivo);
      alert('Documento reprovado!');
      await loadDocumentos();
    } catch (error) {
      console.error('Erro ao reprovar documento:', error);
      alert('Erro ao reprovar documento');
    }
  };

  const renderStatusBadge = (status: StatusDocumento) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_DOCUMENTO_COLORS[status]}`}>
        {STATUS_DOCUMENTO_LABELS[status]}
      </span>
    );
  };

  const renderAlertaVencimento = (dataValidade?: string) => {
    if (!dataValidade) return null;

    const dias = verificarDocumentoProximoVencimento(dataValidade);
    if (dias !== null) {
      return (
        <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
          ⚠️ Vence em {dias} dia{dias !== 1 ? 's' : ''}
        </span>
      );
    }

    if (verificarDocumentoVencido(dataValidade)) {
      return (
        <span className="text-xs text-red-600 font-bold flex items-center gap-1">
          ❌ Vencido
        </span>
      );
    }

    return null;
  };

  const documentosPorCategoria = useMemo(() => {
    const obrigatorios = documentosInstitucionais.filter(doc =>
      DOCUMENTOS_OBRIGATORIOS.includes(doc.tipoDocumento)
    );
    const opcionais = documentosInstitucionais.filter(doc =>
      !DOCUMENTOS_OBRIGATORIOS.includes(doc.tipoDocumento)
    );

    return { obrigatorios, opcionais };
  }, [documentosInstitucionais]);

  const dashboard = useMemo(() => {
    const total = documentosInstitucionais.length;
    const aprovados = documentosInstitucionais.filter(d => d.statusDocumento === 'APROVADO').length;
    const pendentes = documentosInstitucionais.filter(d =>
      d.statusDocumento === 'PENDENTE_ENVIO' || d.statusDocumento === 'ENVIADO'
    ).length;
    const reprovados = documentosInstitucionais.filter(d => d.statusDocumento === 'REPROVADO').length;
    const vencidos = documentosInstitucionais.filter(d =>
      d.dataValidade && verificarDocumentoVencido(d.dataValidade)
    ).length;
    const proximosVencimento = documentosInstitucionais.filter(d =>
      d.dataValidade && verificarDocumentoProximoVencimento(d.dataValidade) !== null
    ).length;

    const obrigatoriosEnviados = DOCUMENTOS_OBRIGATORIOS.filter(tipo =>
      documentosInstitucionais.some(d => d.tipoDocumento === tipo)
    ).length;
    const obrigatoriosFaltando = DOCUMENTOS_OBRIGATORIOS.length - obrigatoriosEnviados;

    return {
      total,
      aprovados,
      pendentes,
      reprovados,
      vencidos,
      proximosVencimento,
      obrigatoriosEnviados,
      obrigatoriosFaltando,
      percentualCompleto: Math.round((obrigatoriosEnviados / DOCUMENTOS_OBRIGATORIOS.length) * 100),
    };
  }, [documentosInstitucionais]);


  const handleCepBlur = async () => {
    setError(null);
    setSuccess(null);

    const digits = onlyDigits(form.cep ?? '');
    if (digits.length !== 8) {
      setError('Informe um CEP válido para buscar o endereço.');
      return;
    }

    setLoadingCep(true);
    try {
      const result = await lookupCep(digits);
      if (!result) {
        setError('CEP não encontrado.');
        return;
      }
      setField('logradouro', result.logradouro ?? form.logradouro ?? '');
      setField('bairro', result.bairro ?? form.bairro ?? '');
      setField('cidade', result.localidade ?? form.cidade ?? '');
      setField('uf', (result.uf as any) ?? form.uf ?? '');
      if (result.complemento && !form.complemento) setField('complemento', result.complemento);
    } catch {
      setError('Falha ao consultar CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  // If an id is provided, load the record to edit and prefill the form.
  useEffect(() => {
    if (!editId) return;

    let cancelled = false;
    (async () => {
      setLoadingExisting(true);
      setError(null);
      setSuccess(null);
      try {
        const existing = await institutionService.getById(editId);
        if (cancelled) return;

        setForm((prev) => ({
          ...prev,
          ...existing,
          // Ensure arrays are always arrays
          areasAtuacao: Array.isArray(existing.areasAtuacao) ? existing.areasAtuacao : [],
        }));
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.error || 'Não foi possível carregar a instituição para edição.');
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (hasErrors) {
      setError('Revise os campos destacados.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<InstitutionDTO> = {
         razaoSocial: (form.razaoSocial ?? '').trim(),
         nomeFantasia: (form.nomeFantasia ?? '').trim() || undefined,
         cnpj: onlyDigits(form.cnpj ?? ''),
         inscricaoEstadual: (form.inscricaoEstadual ?? '').trim() || undefined,
         inscricaoMunicipal: (form.inscricaoMunicipal ?? '').trim(),
         dataFundacao: (form.dataFundacao ?? '').trim() || undefined,
         areasAtuacao: form.areasAtuacao ?? [],

         telefone: (form.telefone ?? '').trim(),
         celular: (form.celular ?? '').trim() || undefined,
         emailInstitucional: (form.emailInstitucional ?? '').trim(),
         emailSecundario: (form.emailSecundario ?? '').trim() || undefined,
         website: (form.website ?? '').trim() || undefined,

         cep: onlyDigits(form.cep ?? ''),
         logradouro: (form.logradouro ?? '').trim(),
         numero: (form.numero ?? '').trim(),
         complemento: (form.complemento ?? '').trim() || undefined,
         bairro: (form.bairro ?? '').trim(),
         cidade: (form.cidade ?? '').trim(),
         uf: (form.uf ?? '').trim(),
         pontoReferencia: (form.pontoReferencia ?? '').trim() || undefined,

         numeroRegistroConselhoMunicipal: (form.numeroRegistroConselhoMunicipal ?? '').trim(),
         dataRegistroConselho: (form.dataRegistroConselho ?? '').trim() || undefined,
         objetoSocial: (form.objetoSocial ?? '').trim() || undefined,
         quantidadeBeneficiarios: form.quantidadeBeneficiarios != null ? Number(form.quantidadeBeneficiarios) : undefined,
      };

      const isEdit = Boolean(editId && editId.trim().length > 0);
      console.debug('[CadastroDadosInstitucionais] submit', { isEdit, editId, payload });

      if (isEdit) {
        await institutionService.update(editId as string, payload);
        setSuccess('Cadastro atualizado com sucesso.');
        setTimeout(() => navigate('/dashboard/instituicoes'), 500);
      } else {
        await institutionService.create(payload);
        setSuccess('Cadastro realizado com sucesso e vinculado ao seu usuário.');

        // Buscar dados atualizados do usuário
        try {
          await getCurrentUserData();
          refreshUser();
        } catch (err) {
          console.error('Erro ao atualizar dados do usuário:', err);
        }

        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: any) {
      console.error('[CadastroDadosInstitucionais] submit error', err);
      setError(err?.response?.data?.error || 'Erro ao cadastrar dados institucionais.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (key: keyof FormState) =>
    `w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
      errors[String(key)] ? 'border-red-400' : 'border-gray-300'
    }`;

  const help = (key: keyof FormState) =>
    errors[String(key)] ? (
      <p className="text-xs text-red-600 mt-1">{errors[String(key)]}</p>
    ) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Dados Institucionais</h1>
            <p className="text-gray-600 mt-1">
              Preencha os dados cadastrais. Campos marcados com * são obrigatórios.
            </p>
          </div>
          {editId && (
            <div className="flex-shrink-0">
              <StatusOSCBadge status={statusOSC} size="lg" showDescription={false} />
            </div>
          )}
        </div>
      </header>

      {/* RF-02.3 - Card de Status da OSC */}
      {editId && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Status do Cadastro</h3>
                  <p className="text-sm text-gray-600">
                    {statusOSC === StatusOSC.EM_CADASTRO && 'Cadastro iniciado - Aguardando documentos'}
                    {statusOSC === StatusOSC.DOCUMENTOS_INCOMPLETOS && `${dashboard.obrigatoriosFaltando} documento(s) obrigatório(s) faltando`}
                    {statusOSC === StatusOSC.EM_ANALISE && 'Todos os documentos enviados - Aguardando análise'}
                    {statusOSC === StatusOSC.APROVADO && 'Cadastro aprovado e ativo'}
                    {statusOSC === StatusOSC.REPROVADO && 'Cadastro reprovado - Necessita correções'}
                    {statusOSC === StatusOSC.SUSPENSA && 'Cadastro temporariamente suspenso'}
                    {statusOSC === StatusOSC.INATIVA && 'OSC desativada'}
                  </p>
                </div>
              </div>
              <StatusOSCBadge status={statusOSC} size="md" />
            </div>

            {/* Progresso de documentos obrigatórios */}
            {(statusOSC === StatusOSC.EM_CADASTRO || statusOSC === StatusOSC.DOCUMENTOS_INCOMPLETOS) && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">Documentos Obrigatórios</span>
                  <span className="text-blue-600 font-semibold">{dashboard.percentualCompleto}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dashboard.percentualCompleto}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {dashboard.obrigatoriosEnviados} de {DOCUMENTOS_OBRIGATORIOS.length} documentos enviados
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {loadingExisting && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">
          Carregando dados da instituição...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
          {success}
        </div>
      )}

      {/* Sistema de Abas */}
      {editId && (
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('instituicao')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'instituicao'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Dados da Instituição
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dirigentes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dirigentes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Diretoria ({dirigentes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documentos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'documentos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 Documentos ({documentosInstitucionais.length})
            </button>
          </nav>
        </div>
      )}

      {/* Aba 1: Formulário da Instituição */}
      {activeTab === 'instituicao' && (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Básicos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
              <input
                type="text"
                maxLength={200}
                value={form.razaoSocial ?? ''}
                onChange={(e) => setField('razaoSocial', e.target.value)}
                className={fieldClass('razaoSocial')}
              />
              {help('razaoSocial')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <input
                type="text"
                maxLength={200}
                value={form.nomeFantasia ?? ''}
                onChange={(e) => setField('nomeFantasia', e.target.value)}
                className={fieldClass('nomeFantasia')}
              />
              {help('nomeFantasia')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatCnpj(form.cnpj ?? '')}
                onChange={(e) => setField('cnpj', onlyDigits(e.target.value))}
                className={fieldClass('cnpj')}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              {help('cnpj')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
              <input
                type="text"
                maxLength={20}
                value={form.inscricaoEstadual ?? ''}
                onChange={(e) => setField('inscricaoEstadual', e.target.value)}
                className={fieldClass('inscricaoEstadual')}
              />
              {help('inscricaoEstadual')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal *</label>
              <input
                type="text"
                maxLength={20}
                value={form.inscricaoMunicipal ?? ''}
                onChange={(e) => setField('inscricaoMunicipal', e.target.value)}
                className={fieldClass('inscricaoMunicipal')}
              />
              {help('inscricaoMunicipal')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fundação</label>
              <input
                type="date"
                value={form.dataFundacao ?? ''}
                onChange={(e) => setField('dataFundacao', e.target.value)}
                className={fieldClass('dataFundacao')}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Área de Atuação</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AREAS_ATUACAO_OPTIONS.map((opt) => {
                const checked = (form.areasAtuacao ?? []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleArea(opt)}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dados de Contato */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados de Contato</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input
                type="text"
                value={form.telefone ?? ''}
                onChange={(e) => setField('telefone', formatPhoneBR(e.target.value))}
                className={fieldClass('telefone')}
                placeholder="(00) 0000-0000"
              />
              {help('telefone')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                type="text"
                value={form.celular ?? ''}
                onChange={(e) => setField('celular', formatPhoneBR(e.target.value))}
                className={fieldClass('celular')}
                placeholder="(00) 00000-0000"
              />
              {help('celular')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional *</label>
              <input
                type="email"
                value={form.emailInstitucional ?? ''}
                onChange={(e) => setField('emailInstitucional', e.target.value)}
                className={fieldClass('emailInstitucional')}
              />
              {help('emailInstitucional')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Secundário</label>
              <input
                type="email"
                value={form.emailSecundario ?? ''}
                onChange={(e) => setField('emailSecundario', e.target.value)}
                className={fieldClass('emailSecundario')}
              />
              {help('emailSecundario')}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={form.website ?? ''}
                onChange={(e) => setField('website', e.target.value)}
                className={fieldClass('website')}
                placeholder="https://..."
              />
              {help('website')}
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Endereço</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formatCep(form.cep ?? '')}
                  onChange={(e) => setField('cep', e.target.value)}
                  className={fieldClass('cep')}
                  placeholder="00000-000"
                />
                <button
                  type="button"
                  onClick={handleCepBlur}
                  disabled={loadingCep}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-60"
                >
                  {loadingCep ? 'Buscando...' : 'Buscar CEP'}
                </button>
              </div>
              {help('cep')}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
              <input
                type="text"
                value={form.logradouro ?? ''}
                onChange={(e) => setField('logradouro', e.target.value)}
                className={fieldClass('logradouro')}
              />
              {help('logradouro')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                type="text"
                value={form.numero ?? ''}
                onChange={(e) => setField('numero', e.target.value)}
                className={fieldClass('numero')}
              />
              {help('numero')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                type="text"
                value={form.complemento ?? ''}
                onChange={(e) => setField('complemento', e.target.value)}
                className={fieldClass('complemento')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input
                type="text"
                value={form.bairro ?? ''}
                onChange={(e) => setField('bairro', e.target.value)}
                className={fieldClass('bairro')}
              />
              {help('bairro')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input
                type="text"
                value={form.cidade ?? ''}
                onChange={(e) => setField('cidade', e.target.value)}
                className={fieldClass('cidade')}
              />
              {help('cidade')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
              <select
                value={form.uf ?? ''}
                onChange={(e) => setField('uf', e.target.value)}
                className={fieldClass('uf')}
              >
                <option value="">Selecione</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {help('uf')}
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ponto de Referência</label>
              <input
                type="text"
                value={form.pontoReferencia ?? ''}
                onChange={(e) => setField('pontoReferencia', e.target.value)}
                className={fieldClass('pontoReferencia')}
              />
            </div>
          </div>
        </section>

        {/* Informações Adicionais */}
        <section className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Adicionais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº de Registro no Conselho Municipal *
              </label>
              <input
                type="text"
                value={form.numeroRegistroConselhoMunicipal ?? ''}
                onChange={(e) => setField('numeroRegistroConselhoMunicipal', e.target.value)}
                className={fieldClass('numeroRegistroConselhoMunicipal')}
              />
              {help('numeroRegistroConselhoMunicipal')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Registro no Conselho</label>
              <input
                type="date"
                value={form.dataRegistroConselho ?? ''}
                onChange={(e) => setField('dataRegistroConselho', e.target.value)}
                className={fieldClass('dataRegistroConselho')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Objeto Social</label>
              <textarea
                value={form.objetoSocial ?? ''}
                onChange={(e) => setField('objetoSocial', e.target.value)}
                className={fieldClass('objetoSocial')}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de Beneficiários Atendidos
              </label>
              <input
                type="number"
                min={0}
                value={form.quantidadeBeneficiarios ?? ''}
                onChange={(e) => setField('quantidadeBeneficiarios', e.target.value ? Number(e.target.value) : undefined)}
                className={fieldClass('quantidadeBeneficiarios')}
              />
              {help('quantidadeBeneficiarios')}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : (editId ? 'Salvar Alterações' : 'Salvar Cadastro')}
          </button>
        </div>
      </form>
      )}

      {/* Aba 2: Diretoria */}
      {activeTab === 'dirigentes' && editId && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Diretoria</h2>
              <p className="text-gray-600 mt-1">Gerenciamento dos dirigentes da instituição</p>
            </div>
            <button
              onClick={() => navigate(`/dashboard/cadastro-dirigente?instituicaoId=${editId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              + Novo Dirigente
            </button>
          </div>

          {avisos.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Atenção: Cargos obrigatórios não preenchidos</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {avisos.map((aviso, idx) => (
                        <li key={idx}>{aviso}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={apenasAtivos}
                onChange={(e) => setApenasAtivos(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Mostrar apenas ativos</span>
            </label>
          </div>

          {loadingDirigentes ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando dirigentes...</p>
            </div>
          ) : dirigentes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum dirigente cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dirigentes.map((dirigente) => (
                <div
                  key={dirigente.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{dirigente.nomeCompleto}</h3>
                      <p className="text-sm text-gray-600">{dirigente.cargo}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dirigente.statusCargo === 'Ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {dirigente.statusCargo}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {dirigente.email}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {dirigente.telefone}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Início: {new Date(dirigente.dataInicioCargo).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/dashboard/cadastro-dirigente?instituicaoId=${editId}&id=${dirigente.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aba 3: Documentos */}
      {activeTab === 'documentos' && editId && (
        <div className="space-y-6">
          {/* Header com Dashboard */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestão de Documentos</h2>
                <p className="text-gray-600 mt-1">Gerenciamento completo de documentos institucionais</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{dashboard.percentualCompleto}%</div>
                <div className="text-xs text-gray-600">Documentos obrigatórios</div>
              </div>
            </div>

            {/* Cards de Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{dashboard.total}</div>
                <div className="text-xs text-gray-600">Total de Documentos</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                <div className="text-2xl font-bold text-green-600">{dashboard.aprovados}</div>
                <div className="text-xs text-gray-600">Aprovados</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{dashboard.pendentes}</div>
                <div className="text-xs text-gray-600">Pendentes</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                <div className="text-2xl font-bold text-red-600">{dashboard.obrigatoriosFaltando}</div>
                <div className="text-xs text-gray-600">Obrigatórios Faltando</div>
              </div>
            </div>

            {/* Alertas */}
            {dashboard.vencidos > 0 && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ {dashboard.vencidos} documento{dashboard.vencidos > 1 ? 's' : ''} vencido{dashboard.vencidos > 1 ? 's' : ''}
                </p>
              </div>
            )}
            {dashboard.proximosVencimento > 0 && (
              <div className="mt-2 bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ {dashboard.proximosVencimento} documento{dashboard.proximosVencimento > 1 ? 's próximos' : ' próximo'} ao vencimento (30 dias)
                </p>
              </div>
            )}
          </div>

          {/* Formulário de Upload */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload de Novo Documento
              </h3>
            </div>
            <form onSubmit={handleUploadDocumento} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento * <span className="text-xs text-gray-500">(Selecione o tipo correto)</span>
                  </label>
                  <select
                    required
                    disabled={loadingConfigs}
                    value={tipoDocumentoSelecionado}
                    onChange={(e) => handleTipoDocumentoChange(e.target.value)}
                    className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                  >
                    <option value="">{loadingConfigs ? 'Carregando...' : 'Selecione o tipo de documento'}</option>
                    <optgroup label="📄 Documentos Institucionais">
                      {DOCUMENTOS_INSTITUICAO.slice(0, 7).map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {TIPOS_DOCUMENTO_LABELS[tipo]}
                          {DOCUMENTOS_OBRIGATORIOS.includes(tipo) ? ' (Obrigatório)' : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✅ Certidões Negativas">
                      {DOCUMENTOS_INSTITUICAO.slice(7).map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {TIPOS_DOCUMENTO_LABELS[tipo]}
                          {DOCUMENTOS_OBRIGATORIOS.includes(tipo) ? ' (Obrigatório)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {selectedDocConfig && (
                    <div className="mt-2 text-xs bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="font-medium text-blue-900">Campos obrigatórios para este documento:</p>
                      <ul className="mt-1 space-y-0.5 text-blue-700">
                        {selectedDocConfig.numeroDocumentoObrigatorio && <li>• Número do Documento</li>}
                        {selectedDocConfig.dataEmissaoObrigatoria && <li>• Data de Emissão</li>}
                        {selectedDocConfig.dataValidadeObrigatoria && <li>• Data de Validade</li>}
                        {!selectedDocConfig.numeroDocumentoObrigatorio &&
                         !selectedDocConfig.dataEmissaoObrigatoria &&
                         !selectedDocConfig.dataValidadeObrigatoria && (
                          <li className="text-green-700">✓ Apenas o arquivo é obrigatório</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo * <span className="text-xs text-gray-500">(Máx: 5MB - PDF, JPG, PNG)</span>
                  </label>
                  <input
                    id="file-input-inst"
                    type="file"
                    required
                    onChange={handleFileSelect}
                    className="w-full border rounded px-3 py-2"
                    accept={FORMATOS_ACEITOS.join(',')}
                  />
                  {selectedFile && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      ✓ {selectedFile.name} ({formatFileSize2(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Documento {selectedDocConfig?.numeroDocumentoObrigatorio ? (
                      <span className="text-red-600">*</span>
                    ) : (
                      <span className="text-xs text-gray-500">(opcional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required={selectedDocConfig?.numeroDocumentoObrigatorio}
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${selectedDocConfig?.numeroDocumentoObrigatorio ? 'border-blue-300' : ''}`}
                    placeholder="Ex: 123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Emissão {selectedDocConfig?.dataEmissaoObrigatoria ? (
                      <span className="text-red-600">*</span>
                    ) : (
                      <span className="text-xs text-gray-500">(opcional)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    required={selectedDocConfig?.dataEmissaoObrigatoria}
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${selectedDocConfig?.dataEmissaoObrigatoria ? 'border-blue-300' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade {selectedDocConfig?.dataValidadeObrigatoria ? (
                      <span className="text-red-600">*</span>
                    ) : (
                      <span className="text-xs text-gray-500">(opcional)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    required={selectedDocConfig?.dataValidadeObrigatoria}
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${selectedDocConfig?.dataValidadeObrigatoria ? 'border-blue-300' : ''}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={observacoesDoc}
                    onChange={(e) => setObservacoesDoc(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={2}
                    maxLength={500}
                    placeholder="Observações adicionais sobre o documento (opcional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{observacoesDoc.length}/500</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={uploadingFile || !selectedFile || !tipoDocumentoSelecionado}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {uploadingFile ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Enviar Documento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Documentos */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Documentos Anexados</h3>
              <p className="text-sm text-gray-600 mt-1">
                {documentosInstitucionais.length} documento{documentosInstitucionais.length !== 1 ? 's' : ''} cadastrado{documentosInstitucionais.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-6">
              {loadingDocumentos ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-500">Carregando documentos...</p>
                </div>
              ) : documentosInstitucionais.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Nenhum documento anexado</p>
                  <p className="text-sm text-gray-500 mt-1">Faça o upload do primeiro documento usando o formulário acima</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Documentos Obrigatórios */}
                  {documentosPorCategoria.obrigatorios.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Documentos Obrigatórios ({documentosPorCategoria.obrigatorios.length})
                      </h4>
                      <div className="space-y-3">
                        {documentosPorCategoria.obrigatorios.map((doc) => (
                          <div
                            key={doc.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                          >
                            <div className="flex items-start gap-4">
                              {/* Ícone */}
                              <div className="text-4xl flex-shrink-0">
                                {getFileIcon2(doc.nomeArquivo)}
                              </div>

                              {/* Informações */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-sm">
                                      {TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento]}
                                    </h5>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{doc.nomeOriginal}</p>
                                  </div>
                                  {renderStatusBadge(doc.statusDocumento)}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-600">
                                  <div>
                                    <span className="text-gray-400">Tamanho:</span> {formatFileSize2(doc.tamanhoBytes)}
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Upload:</span> {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                                  </div>
                                  {doc.dataEmissao && (
                                    <div>
                                      <span className="text-gray-400">Emissão:</span> {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                  {doc.dataValidade && (
                                    <div>
                                      <span className="text-gray-400">Validade:</span> {new Date(doc.dataValidade).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                  {doc.numeroDocumento && (
                                    <div>
                                      <span className="text-gray-400">Nº Doc:</span> {doc.numeroDocumento}
                                    </div>
                                  )}
                                </div>

                                {doc.dataValidade && renderAlertaVencimento(doc.dataValidade)}

                                {doc.observacoes && (
                                  <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                    💬 {doc.observacoes}
                                  </p>
                                )}

                                {doc.motivoReprovacao && (
                                  <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border-l-2 border-red-500">
                                    ❌ <strong>Motivo da reprovação:</strong> {doc.motivoReprovacao}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleDownloadDocumento(doc.id!)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1.5 font-medium"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Baixar
                              </button>

                              {doc.statusDocumento !== 'APROVADO' && (
                                <button
                                  onClick={() => handleAprovarDocumento(doc.id!)}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center gap-1.5 font-medium"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Aprovar
                                </button>
                              )}

                              {doc.statusDocumento !== 'REPROVADO' && (
                                <button
                                  onClick={() => handleReprovarDocumento(doc.id!)}
                                  className="px-3 py-1.5 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 flex items-center gap-1.5 font-medium"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reprovar
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteDocumento(doc.id!)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center gap-1.5 font-medium"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documentos Opcionais */}
                  {documentosPorCategoria.opcionais.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Documentos Opcionais ({documentosPorCategoria.opcionais.length})
                      </h4>
                      <div className="space-y-3">
                        {documentosPorCategoria.opcionais.map((doc) => (
                          <div
                            key={doc.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                          >
                            {/* Mesmo layout dos obrigatórios */}
                            <div className="flex items-start gap-4">
                              <div className="text-4xl flex-shrink-0">
                                {getFileIcon2(doc.nomeArquivo)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-sm">
                                      {TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento]}
                                    </h5>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{doc.nomeOriginal}</p>
                                  </div>
                                  {renderStatusBadge(doc.statusDocumento)}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-600">
                                  <div>
                                    <span className="text-gray-400">Tamanho:</span> {formatFileSize2(doc.tamanhoBytes)}
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Upload:</span> {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                                  </div>
                                  {doc.dataEmissao && (
                                    <div>
                                      <span className="text-gray-400">Emissão:</span> {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                  {doc.dataValidade && (
                                    <div>
                                      <span className="text-gray-400">Validade:</span> {new Date(doc.dataValidade).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                </div>

                                {doc.dataValidade && renderAlertaVencimento(doc.dataValidade)}

                                {doc.observacoes && (
                                  <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                    💬 {doc.observacoes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleDownloadDocumento(doc.id!)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1.5 font-medium"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Baixar
                              </button>

                              <button
                                onClick={() => handleDeleteDocumento(doc.id!)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center gap-1.5 font-medium"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Dirigente - REMOVIDO - Agora usa página separada */}
    </div>
  );
};

export default CadastroDadosInstitucionaisPage;
