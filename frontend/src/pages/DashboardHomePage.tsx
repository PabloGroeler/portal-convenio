import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMinhasInstituicoesDetalhadas, getMinhasEmendas } from '../services/userService';
import type { InstituicaoDetalhada, EmendaResumida } from '../types/user.types';

const DashboardHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instituicoes, setInstituicoes] = useState<InstituicaoDetalhada[]>([]);
  const [emendas, setEmendas] = useState<EmendaResumida[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInstituicoes, setHasInstituicoes] = useState(false);

  const handleVisualizarInstituicao = (inst: InstituicaoDetalhada) => {
    navigate(`/dashboard/cadastro-dados-institucionais?id=${inst.id}`);
  };

  const handleVisualizarEmenda = (emenda: EmendaResumida) => {
    navigate(`/dashboard/emendas`); // Pode adicionar ?id=${emenda.id} se quiser abrir modal
  };

  useEffect(() => {
    const fetchInstituicoes = async () => {
      console.log('🔍 Dashboard: Checking user data:', user);
      console.log('🔍 Dashboard: user.instituicoes:', user?.instituicoes);

      try {
        // Sempre buscar do backend para garantir dados atualizados
        const dataInstituicoes = await getMinhasInstituicoesDetalhadas();
        console.log('✅ Dashboard: Instituições carregadas do backend:', dataInstituicoes);

        setInstituicoes(dataInstituicoes);
        setHasInstituicoes(dataInstituicoes.length > 0);

        // Buscar emendas das instituições
        if (dataInstituicoes.length > 0) {
          const dataEmendas = await getMinhasEmendas();
          console.log('✅ Dashboard: Emendas carregadas do backend:', dataEmendas);
          setEmendas(dataEmendas);
        }
      } catch (error) {
        console.error('❌ Dashboard: Erro ao buscar instituições:', error);
        // Fallback: verificar user.instituicoes se a chamada falhar
        const hasFromUser = user?.instituicoes && user.instituicoes.length > 0;
        setHasInstituicoes(hasFromUser || false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInstituicoes();
    } else {
      console.warn('⚠️ Dashboard: Nenhum usuário logado');
      setLoading(false);
    }
  }, [user]);

  const handleVincularInstituicao = () => {
    navigate('/dashboard/cadastro-dados-institucionais');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {!hasInstituicoes && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Ação Necessária
              </h3>
              <p className="text-yellow-700 mb-4">
                Você ainda não está vinculado a nenhuma instituição. Para ter acesso completo ao sistema,
                você precisa cadastrar ou vincular-se a uma instituição.
              </p>
              <button
                onClick={handleVincularInstituicao}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Vincular Instituição
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Bem-vindo{user?.name ? `, ${user.name}` : ''}</h2>
        {hasInstituicoes ? (
          <>
            <p className="text-gray-600 mb-4">Você está vinculado a {instituicoes.length} instituição(ões).</p>
          </>
        ) : (
          <p className="text-gray-600 mb-4">
            Complete seu cadastro vinculando-se a uma instituição para ter acesso completo às funcionalidades do sistema.
          </p>
        )}
      </div>

      {hasInstituicoes && !loading && instituicoes.length > 0 && (
        <div className="space-y-4">
          {/* Header com título e botão */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Instituições</h2>
            <button
              onClick={() => navigate('/dashboard/cadastro-dados-institucionais')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
              title="Cadastrar nova instituição"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nova</span> Instituição
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instituicoes.map((inst) => (
              <div
                key={inst.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {inst.nomeFantasia || inst.razaoSocial}
                    </h3>
                    {inst.nomeFantasia && inst.razaoSocial !== inst.nomeFantasia && (
                      <p className="text-sm text-gray-600">{inst.razaoSocial}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    inst.ativo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {inst.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{inst.emailInstitucional}</span>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{inst.telefone}</span>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{inst.cidade} - {inst.uf}</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Vinculado em {new Date(inst.dataVinculo).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleVisualizarInstituicao(inst)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Visualizar Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasInstituicoes && !loading && emendas.length > 0 && (
        <div className="space-y-4">
          {/* Header com título e botão */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Emendas</h2>
            <button
              onClick={() => navigate('/dashboard/cadastro-emenda')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
              title="Cadastrar nova emenda"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nova</span> Emenda
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emendas.slice(0, 6).map((emenda) => (
              <div
                key={emenda.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVisualizarEmenda(emenda)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {emenda.codigoOficial}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{emenda.descricao}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Valor:</span>
                    <span className="text-green-600 font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(emenda.valor)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="truncate">{emenda.instituicaoNome}</span>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{emenda.parlamentarNome}</span>
                  </div>

                  {emenda.categoria && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="truncate">{emenda.categoria}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      emenda.status === 'Recebido' || emenda.status === 'Aprovada'
                        ? 'bg-blue-100 text-blue-800'
                        : emenda.status === 'Concluído'
                        ? 'bg-green-100 text-green-800'
                        : emenda.status === 'Em execução'
                        ? 'bg-yellow-100 text-yellow-800'
                        : emenda.status === 'Devolvido'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {emenda.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(emenda.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {emendas.length > 6 && (
            <div className="text-center">
              <Link
                to="/dashboard/emendas"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Ver Todas as Emendas ({emendas.length})
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {hasInstituicoes && loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardHomePage;

