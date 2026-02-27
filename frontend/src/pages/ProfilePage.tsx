import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import institutionService from '../services/institutionService';
import type { InstitutionDTO } from '../services/institutionService';

type TabType = 'profile' | 'institution';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Institution management
  const [userInstitution, setUserInstitution] = useState<InstitutionDTO | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [savingInstitution, setSavingInstitution] = useState(false);

  // Message state
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
      }));
    }
  }, [user]);

  // Load institutions list
  useEffect(() => {
    const loadInstitutions = async () => {
      setLoadingInstitutions(true);
      try {
        const data = await institutionService.list();
        setInstitutions(data);
      } catch (err: any) {
        console.error('Error loading institutions:', err);
        const errorMsg = err?.response?.data?.error || err?.message || 'Erro ao carregar instituições';
        console.error('Detailed error:', {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          url: err?.config?.url,
        });
        // Don't alert here, just log - user can still use profile tab
      } finally {
        setLoadingInstitutions(false);
      }
    };

    loadInstitutions();
  }, []);

  // Load user's institution (TODO: implementar endpoint no backend)
  useEffect(() => {
    const loadUserInstitution = async () => {
      try {
        // TODO: Implementar endpoint GET /api/users/profile/institution
        // const institution = await institutionService.getUserInstitution();
        // setUserInstitution(institution);
        // setSelectedInstitutionId(institution.institutionId);
      } catch (err) {
        console.error('Error loading user institution:', err);
      }
    };

    if (user) {
      loadUserInstitution();
    }
  }, [user]);

  useEffect(() => {
    if (!infoMessage) return;
    const t = setTimeout(() => setInfoMessage(null), 4000);
    return () => clearTimeout(t);
  }, [infoMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar chamada ao backend para atualizar perfil
    setInfoMessage('Funcionalidade de atualização de perfil será implementada');
    setIsEditingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    // TODO: Implementar chamada ao backend para alterar senha
    alert('Funcionalidade de alteração de senha será implementada');
    setIsChangingPassword(false);
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const handleLinkInstitution = async () => {
    if (!selectedInstitutionId) {
      alert('Selecione uma instituição');
      return;
    }

    setSavingInstitution(true);
    try {
      // TODO: Implementar endpoint POST /api/users/profile/institution
      // await institutionService.linkUserInstitution(selectedInstitutionId);

      const institution = institutions.find(i => i.institutionId === selectedInstitutionId);
      setUserInstitution(institution || null);
      setInfoMessage('Instituição vinculada com sucesso!');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Erro ao vincular instituição';
      setInfoMessage(errorMsg);
    } finally {
      setSavingInstitution(false);
    }
  };

  const handleUnlinkInstitution = async () => {
    if (!confirm('Deseja realmente desvincular esta instituição?')) {
      return;
    }

    setSavingInstitution(true);
    try {
      // TODO: Implementar endpoint DELETE /api/users/profile/institution
      // await institutionService.unlinkUserInstitution();

      setUserInstitution(null);
      setSelectedInstitutionId('');
      alert('Instituição desvinculada com sucesso! (TODO: integrar com backend)');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Erro ao desvincular instituição';
      alert(errorMsg);
    } finally {
      setSavingInstitution(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie suas informações pessoais e instituição vinculada
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {/* Profile Tab */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline-block mr-2 -mt-1">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
                Perfil
              </button>

              {/* Institution Tab */}
              <button
                onClick={() => setActiveTab('institution')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'institution'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline-block mr-2 -mt-1">
                  <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                  <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
                  <path d="M12 7.875a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
                </svg>
                Instituição
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' ? (
          <ProfileTabContent
            formData={formData}
            handleChange={handleChange}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            handleSaveProfile={handleSaveProfile}
            isChangingPassword={isChangingPassword}
            setIsChangingPassword={setIsChangingPassword}
            handleChangePassword={handleChangePassword}
            setFormData={setFormData}
            user={user}
            infoMessage={infoMessage}
          />
        ) : (
          <InstitutionTabContent
            userInstitution={userInstitution}
            institutions={institutions}
            selectedInstitutionId={selectedInstitutionId}
            setSelectedInstitutionId={setSelectedInstitutionId}
            handleLinkInstitution={handleLinkInstitution}
            handleUnlinkInstitution={handleUnlinkInstitution}
            loadingInstitutions={loadingInstitutions}
            savingInstitution={savingInstitution}
            infoMessage={infoMessage}
          />
        )}
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTabContent: React.FC<any> = ({
  formData,
  handleChange,
  isEditingProfile,
  setIsEditingProfile,
  handleSaveProfile,
  isChangingPassword,
  setIsChangingPassword,
  handleChangePassword,
  setFormData,
  user,
  infoMessage,
}) => (
  <>
    {/* Profile Info Card */}
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSaveProfile}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nome de Usuário
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>

    {/* Password Change Card */}
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Alterar Senha</h2>
      </div>
      <div className="p-6">
        {!isChangingPassword ? (
          <button
            type="button"
            onClick={() => setIsChangingPassword(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Alterar Senha
          </button>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Alterar Senha
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }));
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>

    {/* User Info Display */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-blue-900">Informação do Sistema</h3>
          <p className="mt-1 text-sm text-blue-700">
            Usuário logado como: <strong>{user?.username || 'Desconhecido'}</strong>
          </p>
          <p className="text-sm text-blue-700">
            Perfil: <strong>{user?.role || 'Usuário'}</strong>
          </p>
        </div>
      </div>
    </div>
  </>
);

// Institution Tab Component
const InstitutionTabContent: React.FC<any> = ({
  userInstitution,
  institutions,
  selectedInstitutionId,
  setSelectedInstitutionId,
  handleLinkInstitution,
  handleUnlinkInstitution,
  loadingInstitutions,
  savingInstitution,
  infoMessage,
}) => (
  <>
    {/* Current Institution Card */}
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Instituição Vinculada</h2>
      </div>
      <div className="p-6">
        {userInstitution ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-600 mr-3 flex-shrink-0">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900">{userInstitution.razaoSocial}</h3>
                  {userInstitution.nomeFantasia && (
                    <p className="text-sm text-green-700 mt-1">
                      Nome Fantasia: {userInstitution.nomeFantasia}
                    </p>
                  )}
                  {userInstitution.cnpj && (
                    <p className="text-sm text-green-700">
                      CNPJ: {userInstitution.cnpj}
                    </p>
                  )}
                  <p className="text-xs text-green-600 mt-2">
                    ID: {userInstitution.institutionId}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleUnlinkInstitution}
              disabled={savingInstitution}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingInstitution ? 'Desvinculando...' : 'Desvincular Instituição'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">Nenhuma instituição vinculada</p>
            <p className="text-gray-400 text-sm">
              Vincule uma instituição para gerenciar emendas relacionadas
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Link Institution Card */}
    {!userInstitution && (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Vincular Nova Instituição</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                Selecione uma Instituição
              </label>
              {loadingInstitutions ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Carregando instituições...</span>
                </div>
              ) : (
                <select
                  id="institution"
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Selecione uma instituição</option>
                  {institutions.map((inst) => (
                    <option key={inst.institutionId} value={inst.institutionId}>
                      {inst.razaoSocial} {inst.cnpj ? `- ${inst.cnpj}` : ''}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Total de instituições disponíveis: {institutions.length}
              </p>
            </div>

            <button
              onClick={handleLinkInstitution}
              disabled={!selectedInstitutionId || savingInstitution || loadingInstitutions}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingInstitution ? 'Vinculando...' : 'Vincular Instituição'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Info Box */}
    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-yellow-900">Importante</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Ao vincular uma instituição, você poderá gerenciar emendas relacionadas a ela.
            Cada usuário pode estar vinculado a apenas uma instituição por vez.
          </p>
        </div>
      </div>
    </div>
  </>
);

export default ProfilePage;

