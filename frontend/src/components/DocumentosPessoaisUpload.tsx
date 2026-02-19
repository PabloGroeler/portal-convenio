import React, { useState, useEffect, useMemo } from 'react';
import documentoPessoalService from '../services/documentoPessoalService';
import type { DocumentoPessoalDTO } from '../types/documentoPessoal.types';
import { useAuth } from '../context/AuthContext';

interface DocumentosPessoaisUploadProps {
  dirigenteId: string;
  cargo: string;
  onDocumentosChange?: () => void;
}

interface TipoDocumento {
  tipo: string;
  nome: string;
  obrigatorio: boolean;
  numeroObrigatorio?: boolean;
  dataEmissaoObrigatoria?: boolean;
  dataValidadeObrigatoria?: boolean;
}

const DocumentosPessoaisUpload: React.FC<DocumentosPessoaisUploadProps> = ({
  dirigenteId,
  cargo,
  onDocumentosChange,
}) => {
  const { user } = useAuth();
  const [documentos, setDocumentos] = useState<DocumentoPessoalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento | null>(null);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    numeroDocumento: '',
    dataEmissao: '',
    dataValidade: '',
    descricao: '',
  });

  // Modal para aprovar
  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [documentoParaAprovar, setDocumentoParaAprovar] = useState<DocumentoPessoalDTO | null>(null);
  const [observacoesAprovacao, setObservacoesAprovacao] = useState('');

  // Modal para reprovar
  const [showReprovarModal, setShowReprovarModal] = useState(false);
  const [documentoParaReprovar, setDocumentoParaReprovar] = useState<DocumentoPessoalDTO | null>(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState('');

  // Check if user is OPERADOR (operators cannot approve/reject documents)
  const isOperador = useMemo(() => {
    if (!user || !user.role) return false;
    const roleString = typeof user.role === 'string' ? user.role : String(user.role);
    return roleString === 'OPERADOR';
  }, [user]);

  // Definir documentos obrigatórios baseado no cargo
  const isPresidente = cargo?.toLowerCase().includes('presidente');

  const tiposDocumento: TipoDocumento[] = isPresidente
    ? [
        {
          tipo: 'RG_PRESIDENTE',
          nome: 'RG',
          obrigatorio: true,
          numeroObrigatorio: true,
          dataEmissaoObrigatoria: true,
        },
        {
          tipo: 'CNH_PRESIDENTE',
          nome: 'CNH',
          obrigatorio: true,
          numeroObrigatorio: true,
          dataEmissaoObrigatoria: true,
          dataValidadeObrigatoria: true,
        },
        {
          tipo: 'DOCUMENTO_FOTO_PRESIDENTE',
          nome: 'Documento com Foto',
          obrigatorio: true,
        },
        {
          tipo: 'COMPROVANTE_ENDERECO_PRESIDENTE',
          nome: 'Comprovante de Endereço',
          obrigatorio: true,
          dataEmissaoObrigatoria: true,
        },
        {
          tipo: 'CERTIDAO_TCE_PRESIDENTE',
          nome: 'Certidão Negativa TCE',
          obrigatorio: true,
          dataEmissaoObrigatoria: true,
          dataValidadeObrigatoria: true,
        },
      ]
    : [
        {
          tipo: 'DOCUMENTO_FOTO_DIRIGENTE',
          nome: 'Documento de Identificação com Foto',
          obrigatorio: true,
          numeroObrigatorio: true,
          dataEmissaoObrigatoria: true,
        },
        {
          tipo: 'CERTIDAO_TCE_DIRIGENTE',
          nome: 'Certidão Negativa TCE',
          obrigatorio: true,
          dataEmissaoObrigatoria: true,
          dataValidadeObrigatoria: true,
        },
      ];

  useEffect(() => {
    loadDocumentos();
  }, [dirigenteId]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const data = await documentoPessoalService.listarPorDirigente(dirigenteId);
      setDocumentos(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = (tipo: TipoDocumento) => {
    setSelectedTipo(tipo);
    setUploadData({
      file: null,
      numeroDocumento: '',
      dataEmissao: '',
      dataValidade: '',
      descricao: '',
    });
    setShowUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !selectedTipo) {
      alert('Selecione um arquivo');
      return;
    }

    // Validações
    if (selectedTipo.numeroObrigatorio && !uploadData.numeroDocumento) {
      alert('Número do documento é obrigatório');
      return;
    }
    if (selectedTipo.dataEmissaoObrigatoria && !uploadData.dataEmissao) {
      alert('Data de emissão é obrigatória');
      return;
    }
    if (selectedTipo.dataValidadeObrigatoria && !uploadData.dataValidade) {
      alert('Data de validade é obrigatória');
      return;
    }

    try {
      setUploading(true);
      await documentoPessoalService.upload({
        dirigenteId,
        tipoDocumento: selectedTipo.tipo,
        file: uploadData.file,
        numeroDocumento: uploadData.numeroDocumento || undefined,
        dataEmissao: uploadData.dataEmissao || undefined,
        dataValidade: uploadData.dataValidade || undefined,
        descricao: uploadData.descricao || undefined,
      });

      alert('Documento enviado com sucesso!');
      setShowUploadModal(false);
      await loadDocumentos();
      if (onDocumentosChange) onDocumentosChange();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert(error.response?.data?.error || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentoPessoalDTO) => {
    try {
      const blob = await documentoPessoalService.download(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nomeOriginal;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento');
    }
  };

  const handleOpenAprovar = (doc: DocumentoPessoalDTO) => {
    setDocumentoParaAprovar(doc);
    setObservacoesAprovacao('');
    setShowAprovarModal(true);
  };

  const handleAprovar = async () => {
    if (!documentoParaAprovar) return;

    try {
      await documentoPessoalService.aprovar(documentoParaAprovar.id, observacoesAprovacao);
      alert('Documento aprovado com sucesso!');
      setShowAprovarModal(false);
      setDocumentoParaAprovar(null);
      setObservacoesAprovacao('');
      await loadDocumentos();
      if (onDocumentosChange) onDocumentosChange();
    } catch (error: any) {
      console.error('Erro ao aprovar documento:', error);
      alert(error.response?.data?.error || 'Erro ao aprovar documento');
    }
  };

  const handleOpenReprovar = (doc: DocumentoPessoalDTO) => {
    setDocumentoParaReprovar(doc);
    setMotivoReprovacao('');
    setShowReprovarModal(true);
  };

  const handleReprovar = async () => {
    if (!documentoParaReprovar) return;

    if (!motivoReprovacao.trim()) {
      alert('O motivo da reprovação é obrigatório');
      return;
    }

    try {
      await documentoPessoalService.reprovar(documentoParaReprovar.id, motivoReprovacao);
      alert('Documento reprovado');
      setShowReprovarModal(false);
      setDocumentoParaReprovar(null);
      setMotivoReprovacao('');
      await loadDocumentos();
      if (onDocumentosChange) onDocumentosChange();
    } catch (error: any) {
      console.error('Erro ao reprovar documento:', error);
      alert(error.response?.data?.error || 'Erro ao reprovar documento');
    }
  };

  const getDocumento = (tipo: string): DocumentoPessoalDTO | undefined => {
    return documentos.find((d) => d.tipoDocumento === tipo);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return '✅';
      case 'REPROVADO':
        return '❌';
      case 'PENDENTE':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'REPROVADO':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDENTE':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-4">Carregando documentos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          📄 Documentos Pessoais - {cargo}
        </h3>

        <div className="space-y-3">
          {tiposDocumento.map((tipo) => {
            const doc = getDocumento(tipo.tipo);
            const hasDocumento = !!doc;

            return (
              <div
                key={tipo.tipo}
                className={`border rounded-lg p-4 ${
                  hasDocumento ? 'border-gray-200' : 'border-yellow-300 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      {hasDocumento ? (
                        <span className="text-2xl">{getStatusIcon(doc.statusDocumento)}</span>
                      ) : (
                        <span className="text-2xl">⚠️</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {tipo.nome}
                        {tipo.obrigatorio && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </div>
                      {hasDocumento && (
                        <div className="text-sm text-gray-500">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(doc.statusDocumento)}`}>
                            {doc.statusDocumento}
                          </span>
                          <span className="ml-2">{doc.nomeOriginal}</span>
                          {doc.dataUpload && (
                            <span className="ml-2">
                              • {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      )}
                      {!hasDocumento && (
                        <div className="text-sm text-yellow-700">
                          Documento não enviado
                        </div>
                      )}
                      {doc?.motivoReprovacao && (
                        <div className="text-sm text-red-600 mt-1">
                          <strong>Motivo da reprovação:</strong> {doc.motivoReprovacao}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hasDocumento && (
                      <>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          📥 Download
                        </button>

                        {/* Botão Aprovar - só mostrar se não for OPERADOR e documento estiver PENDENTE */}
                        {!isOperador && doc.statusDocumento === 'PENDENTE' && (
                          <button
                            onClick={() => handleOpenAprovar(doc)}
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            ✅ Aprovar
                          </button>
                        )}

                        {/* Botão Reprovar - só mostrar se não for OPERADOR e documento estiver PENDENTE */}
                        {!isOperador && doc.statusDocumento === 'PENDENTE' && (
                          <button
                            onClick={() => handleOpenReprovar(doc)}
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            ❌ Reprovar
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleOpenUpload(tipo)}
                      className={`px-3 py-2 rounded text-sm font-medium ${
                        hasDocumento && doc.statusDocumento === 'APROVADO'
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      disabled={hasDocumento && doc.statusDocumento === 'APROVADO'}
                    >
                      {hasDocumento ? '🔄 Reenviar' : '📤 Enviar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && selectedTipo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Enviar {selectedTipo.nome}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Arquivo {selectedTipo.obrigatorio && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full border rounded px-3 py-2"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                </p>
              </div>

              {selectedTipo.numeroObrigatorio && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Número do Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadData.numeroDocumento}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, numeroDocumento: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ex: 12.345.678-9"
                  />
                </div>
              )}

              {selectedTipo.dataEmissaoObrigatoria && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data de Emissão <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={uploadData.dataEmissao}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, dataEmissao: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              {selectedTipo.dataValidadeObrigatoria && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data de Validade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={uploadData.dataValidade}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, dataValidade: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={uploadData.descricao}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, descricao: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Informações adicionais sobre o documento"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={uploading || !uploadData.file}
              >
                {uploading ? 'Enviando...' : 'Enviar Documento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aprovação */}
      {showAprovarModal && documentoParaAprovar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Aprovar Documento
            </h3>

            <div className="mb-4">
              <p>
                Você está prestes a aprovar o documento de {documentoParaAprovar.nomeOriginal}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoesAprovacao}
                  onChange={(e) => setObservacoesAprovacao(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Observações sobre a aprovação"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAprovarModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprovar}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Aprovar Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reprovação */}
      {showReprovarModal && documentoParaReprovar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Reprovar Documento
            </h3>

            <div className="mb-4">
              <p>
                Você está prestes a reprovar o documento de {documentoParaReprovar.nomeOriginal}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Motivo da Reprovação <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivoReprovacao}
                  onChange={(e) => setMotivoReprovacao(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Motivo da reprovação"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowReprovarModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReprovar}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reprovar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosPessoaisUpload;
