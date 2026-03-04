import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

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

  useEffect(() => {
    if (!infoMessage) return;
    const t = setTimeout(() => setInfoMessage(null), 4000);
    return () => clearTimeout(t);
  }, [infoMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
    alert('Funcionalidade de alteração de senha será implementada');
    setIsChangingPassword(false);
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-2 text-sm text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        {infoMessage && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            {infoMessage}
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSaveProfile}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
                  <input type="text" id="username" name="username" value={formData.username}
                    onChange={handleChange} disabled={!isEditingProfile}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input type="email" id="email" name="email" value={formData.email}
                    onChange={handleChange} disabled={!isEditingProfile}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName}
                    onChange={handleChange} disabled={!isEditingProfile}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {!isEditingProfile ? (
                  <button type="button" onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      Salvar Alterações
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
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
              <button type="button" onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Alterar Senha
              </button>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Senha Atual</label>
                    <input type="password" id="currentPassword" name="currentPassword" value={formData.currentPassword}
                      onChange={handleChange} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                    <input type="password" id="newPassword" name="newPassword" value={formData.newPassword}
                      onChange={handleChange} required minLength={6}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                    <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} required minLength={6}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Alterar Senha
                  </button>
                  <button type="button" onClick={() => {
                    setIsChangingPassword(false);
                    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                  }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Informação do Sistema</h3>
              <p className="mt-1 text-sm text-blue-700">Usuário: <strong>{user?.username || 'Desconhecido'}</strong></p>
              <p className="text-sm text-blue-700">Perfil: <strong>{user?.role || 'Usuário'}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

