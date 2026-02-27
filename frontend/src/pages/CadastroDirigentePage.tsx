import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dirigenteService from '../services/dirigenteService';
import type { Dirigente } from '../types/dirigente.types';
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  CARGO_OPTIONS,
  UF_OPTIONS
} from '../types/dirigente.types';
import { lookupCep } from '../services/cepService';
import { isValidEmail } from '../utils/formatters';

const CadastroDirigentePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instituicaoId = searchParams.get('instituicaoId');
  const dirigenteId = searchParams.get('id');
  const isEditMode = !!dirigenteId;

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Dirigente>({
    instituicaoId: instituicaoId || '',
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

  useEffect(() => {
    if (isEditMode && dirigenteId) {
      loadDirigente();
    }
  }, [dirigenteId]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const loadDirigente = async () => {
    try {
      setLoading(true);
      const data = await dirigenteService.obter(dirigenteId!);
      setFormData(data);
    } catch (error) {
      console.error('Erro ao carregar dirigente:', error);
      alert('Erro ao carregar dados do dirigente');
    } finally {
      setLoading(false);
    }
  };

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

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.nomeCompleto || formData.nomeCompleto.trim().length < 3) {
      errors.nomeCompleto = 'Nome completo deve ter no mínimo 3 caracteres';
    }

    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) {
      errors.cpf = 'CPF inválido (deve ter 11 dígitos)';
    }

    if (!formData.rg || formData.rg.trim().length < 5) {
      errors.rg = 'RG inválido';
    }

    if (!formData.orgaoExpedidor || formData.orgaoExpedidor.trim().length < 2) {
      errors.orgaoExpedidor = 'Órgão expedidor inválido';
    }

    if (!formData.ufOrgaoExpedidor) {
      errors.ufOrgaoExpedidor = 'Selecione a UF';
    }

    if (!formData.dataExpedicao) {
      errors.dataExpedicao = 'Data de expedição obrigatória';
    } else if (new Date(formData.dataExpedicao) > new Date()) {
      errors.dataExpedicao = 'Data não pode ser futura';
    }

    if (!formData.dataNascimento) {
      errors.dataNascimento = 'Data de nascimento obrigatória';
    } else {
      const idade = new Date().getFullYear() - new Date(formData.dataNascimento).getFullYear();
      if (idade < 18) {
        errors.dataNascimento = 'Dirigente deve ter no mínimo 18 anos';
      }
      if (idade > 120) {
        errors.dataNascimento = 'Data de nascimento inválida';
      }
    }

    if (!formData.sexo) {
      errors.sexo = 'Selecione o sexo';
    }

    if (!formData.estadoCivil) {
      errors.estadoCivil = 'Selecione o estado civil';
    }

    if (!formData.cargo) {
      errors.cargo = 'Selecione o cargo';
    }

    if (!formData.dataInicioCargo) {
      errors.dataInicioCargo = 'Data de início obrigatória';
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) {
      errors.telefone = 'Telefone inválido (mínimo 10 dígitos)';
    }

    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      errors.cep = 'CEP inválido (deve ter 8 dígitos)';
    }

    if (!formData.logradouro || formData.logradouro.trim().length < 3) {
      errors.logradouro = 'Logradouro inválido';
    }

    if (!formData.numero || formData.numero.trim().length === 0) {
      errors.numero = 'Número obrigatório';
    }

    if (!formData.bairro || formData.bairro.trim().length < 2) {
      errors.bairro = 'Bairro inválido';
    }

    if (!formData.cidade || formData.cidade.trim().length < 2) {
      errors.cidade = 'Cidade inválida';
    }

    if (!formData.uf) {
      errors.uf = 'Selecione a UF';
    }

    return errors;
  };

  const handleBuscarCep = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      alert('CEP inválido. Digite 8 dígitos.');
      return;
    }

    try {
      setLoadingCep(true);
      const endereco = await lookupCep(cepLimpo);

      setFormData({
        ...formData,
        logradouro: endereco.logradouro || '',
        bairro: endereco.bairro || '',
        cidade: endereco.localidade || '',
        uf: endereco.uf || ''
      });

      const newErrors = { ...errors };
      delete newErrors.cep;
      delete newErrors.logradouro;
      delete newErrors.bairro;
      delete newErrors.cidade;
      delete newErrors.uf;
      setErrors(newErrors);

      alert('Endereço preenchido com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('CEP não encontrado. Preencha manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const camposComErro = Object.entries(validationErrors).map(([campo, mensagem]) => {
        const nomeCampo = getNomeCampo(campo);
        return `• ${nomeCampo}: ${mensagem}`;
      }).join('\n');

      alert(`Por favor, corrija os seguintes erros:\n\n${camposComErro}`);

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
      setLoading(true);
      if (isEditMode) {
        await dirigenteService.atualizar(dirigenteId!, formData);
        setSuccessMessage('Dirigente atualizado com sucesso!');
      } else {
        await dirigenteService.criar(formData);
        setSuccessMessage('Dirigente cadastrado com sucesso!');
      }
      navigate(`/dashboard/cadastro-dados-institucionais?id=${instituicaoId}`);
    } catch (error: any) {
      console.error('Erro ao salvar dirigente:', error);
      alert(error.response?.data?.error || 'Erro ao salvar dirigente');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Carregando dados do dirigente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Editar Dirigente' : 'Cadastrar Novo Dirigente'}
        </h1>
        <p className="text-gray-600 mt-1">
          Preencha os dados do dirigente. Campos marcados com * são obrigatórios.
        </p>
      </header>

      {successMessage && <div className="mb-4 p-2 bg-emerald-100 text-emerald-700 rounded">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.nomeCompleto}
                onChange={(e) => {
                  setFormData({ ...formData, nomeCompleto: e.target.value });
                  clearError('nomeCompleto');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.nomeCompleto ? 'border-red-500' : ''}`}
              />
              {errors.nomeCompleto && (
                <p className="text-red-500 text-xs mt-1">{errors.nomeCompleto}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium mb-1">CPF *</label>
              <input
                type="text"
                required
                value={formatCPF(formData.cpf)}
                onChange={(e) => {
                  setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') });
                  clearError('cpf');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.cpf ? 'border-red-500' : ''}`}
                maxLength={14}
                placeholder="000.000.000-00"
              />
              {errors.cpf && (
                <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
              )}
            </div>

            {/* RG */}
            <div>
              <label className="block text-sm font-medium mb-1">RG *</label>
              <input
                type="text"
                required
                value={formData.rg}
                onChange={(e) => {
                  setFormData({ ...formData, rg: e.target.value });
                  clearError('rg');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.rg ? 'border-red-500' : ''}`}
              />
              {errors.rg && (
                <p className="text-red-500 text-xs mt-1">{errors.rg}</p>
              )}
            </div>

            {/* Órgão Expedidor */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Órgão Expedidor *</label>
                          <input
                            type="text"
                            required
                            value={formData.orgaoExpedidor}
                            onChange={(e) => {
                              setFormData({ ...formData, orgaoExpedidor: e.target.value });
                              clearError('orgaoExpedidor');
                            }}
                            className={`w-full border rounded px-3 py-2 ${errors.orgaoExpedidor ? 'border-red-500' : ''}`}
                            placeholder="Ex: SSP"
                          />
                          {errors.orgaoExpedidor && (
                            <p className="text-red-500 text-xs mt-1">{errors.orgaoExpedidor}</p>
                          )}
                        </div>

                        {/* UF Órgão */}
                        <div>
                          <label className="block text-sm font-medium mb-1">UF Órgão *</label>
                          <select
                            required
                            value={formData.ufOrgaoExpedidor}
                            onChange={(e) => {
                              setFormData({ ...formData, ufOrgaoExpedidor: e.target.value });
                              clearError('ufOrgaoExpedidor');
                            }}
                            className={`w-full border rounded px-3 py-2 ${errors.ufOrgaoExpedidor ? 'border-red-500' : ''}`}
                          >
                            <option value="">Selecione</option>
                            {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                          </select>
                          {errors.ufOrgaoExpedidor && (
                            <p className="text-red-500 text-xs mt-1">{errors.ufOrgaoExpedidor}</p>
                          )}
                        </div>

                        {/* Data Expedição */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Data Expedição *</label>
                          <input
                            type="date"
                            required
                            value={formData.dataExpedicao}
                            onChange={(e) => {
                              setFormData({ ...formData, dataExpedicao: e.target.value });
                              clearError('dataExpedicao');
                            }}
                            className={`w-full border rounded px-3 py-2 ${errors.dataExpedicao ? 'border-red-500' : ''}`}
                          />
                          {errors.dataExpedicao && (
                            <p className="text-red-500 text-xs mt-1">{errors.dataExpedicao}</p>
                          )}
                        </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento *</label>
              <input
                type="date"
                required
                value={formData.dataNascimento}
                onChange={(e) => {
                  setFormData({ ...formData, dataNascimento: e.target.value });
                  clearError('dataNascimento');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.dataNascimento ? 'border-red-500' : ''}`}
              />
              {errors.dataNascimento && (
                <p className="text-red-500 text-xs mt-1">{errors.dataNascimento}</p>
              )}
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium mb-1">Sexo *</label>
              <select
                required
                value={formData.sexo}
                onChange={(e) => {
                  setFormData({ ...formData, sexo: e.target.value });
                  clearError('sexo');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.sexo ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione</option>
                {SEXO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.sexo && (
                <p className="text-red-500 text-xs mt-1">{errors.sexo}</p>
              )}
            </div>

            {/* Estado Civil */}
            <div>
              <label className="block text-sm font-medium mb-1">Estado Civil *</label>
              <select
                required
                value={formData.estadoCivil}
                onChange={(e) => {
                  setFormData({ ...formData, estadoCivil: e.target.value });
                  clearError('estadoCivil');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.estadoCivil ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione</option>
                {ESTADO_CIVIL_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {errors.estadoCivil && (
                <p className="text-red-500 text-xs mt-1">{errors.estadoCivil}</p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium mb-1">Cargo *</label>
              <select
                required
                value={formData.cargo}
                onChange={(e) => {
                  setFormData({ ...formData, cargo: e.target.value });
                  clearError('cargo');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.cargo ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione</option>
                {CARGO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.cargo && (
                <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>
              )}
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium mb-1">Data Início *</label>
              <input
                type="date"
                required
                value={formData.dataInicioCargo}
                onChange={(e) => {
                  setFormData({ ...formData, dataInicioCargo: e.target.value });
                  clearError('dataInicioCargo');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.dataInicioCargo ? 'border-red-500' : ''}`}
              />
              {errors.dataInicioCargo && (
                <p className="text-red-500 text-xs mt-1">{errors.dataInicioCargo}</p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium mb-1">E-mail *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearError('email');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="text"
                required
                value={formatPhone(formData.telefone)}
                onChange={(e) => {
                  setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, '') });
                  clearError('telefone');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.telefone ? 'border-red-500' : ''}`}
                maxLength={15}
                placeholder="(00) 00000-0000"
              />
              {errors.telefone && (
                <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
              )}
            </div>

            {/* Nacionalidade */}
            <div>
              <label className="block text-sm font-medium mb-1">Nacionalidade *</label>
              <input
                type="text"
                required
                value={formData.nacionalidade}
                onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* CEP */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">CEP *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formatCEP(formData.cep)}
                  onChange={(e) => {
                    setFormData({ ...formData, cep: e.target.value.replace(/\D/g, '') });
                    clearError('cep');
                  }}
                  className={`flex-1 border rounded px-3 py-2 ${errors.cep ? 'border-red-500' : ''}`}
                  maxLength={9}
                  placeholder="00000-000"
                />
                <button
                  type="button"
                  onClick={handleBuscarCep}
                  disabled={loadingCep}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                >
                  {loadingCep ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar CEP
                    </>
                  )}
                </button>
              </div>
              {errors.cep && (
                <p className="text-red-500 text-xs mt-1">{errors.cep}</p>
              )}
            </div>

            {/* Logradouro */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Logradouro *</label>
              <input
                type="text"
                required
                value={formData.logradouro}
                onChange={(e) => {
                  setFormData({ ...formData, logradouro: e.target.value });
                  clearError('logradouro');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.logradouro ? 'border-red-500' : ''}`}
              />
              {errors.logradouro && (
                <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>
              )}
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-medium mb-1">Número *</label>
              <input
                type="text"
                required
                value={formData.numero}
                onChange={(e) => {
                  setFormData({ ...formData, numero: e.target.value });
                  clearError('numero');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.numero ? 'border-red-500' : ''}`}
              />
              {errors.numero && (
                <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
              )}
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-sm font-medium mb-1">Bairro *</label>
              <input
                type="text"
                required
                value={formData.bairro}
                onChange={(e) => {
                  setFormData({ ...formData, bairro: e.target.value });
                  clearError('bairro');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.bairro ? 'border-red-500' : ''}`}
              />
              {errors.bairro && (
                <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={formData.cidade}
                onChange={(e) => {
                  setFormData({ ...formData, cidade: e.target.value });
                  clearError('cidade');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.cidade ? 'border-red-500' : ''}`}
              />
              {errors.cidade && (
                <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
              )}
            </div>

            {/* UF */}
            <div>
              <label className="block text-sm font-medium mb-1">UF *</label>
              <select
                required
                value={formData.uf}
                onChange={(e) => {
                  setFormData({ ...formData, uf: e.target.value });
                  clearError('uf');
                }}
                className={`w-full border rounded px-3 py-2 ${errors.uf ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione</option>
                {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {errors.uf && (
                <p className="text-red-500 text-xs mt-1">{errors.uf}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/cadastro-dados-institucionais?id=${instituicaoId}`)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Cadastrar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroDirigentePage;

