// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [document, setDocument] = useState(''); // CPF or CNPJ
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as any)?.message as string | undefined;

  // Verificar se foi redirecionado por token expirado
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';
  const expiredMessage = isExpired ? 'Sua sessão expirou. Por favor, faça login novamente.' : null;

  // Format document (CPF or CNPJ) as user types
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length <= 11) {
      // Format as CPF: 000.000.000-00
      setDocument(value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'));
    } else {
      // Format as CNPJ: 00.000.000/0000-00
      setDocument(value
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2'));
    }
  };

  // Clear the navigation state after reading the success message so it doesn't persist
  useEffect(() => {
    if (successMessage) {
      // Replace the current history entry with the same path but empty state
      // Use a microtask to let the UI render the message first
      const t = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [successMessage, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Remove formatting from document
    const cleanDocument = document.replace(/\D/g, '');

    try {
      const success = await login(cleanDocument, password);
      if (success) {
        // Task-6: redirect to the dashboard layout after login
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente mais tarde.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {expiredMessage && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {expiredMessage}
          </div>
        </div>
      )}
      {successMessage && <div className="mb-4 p-2 bg-emerald-100 text-emerald-700 rounded">{successMessage}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700">
            CPF ou CNPJ
          </label>
          <input
            type="text"
            id="document"
            value={document}
            onChange={handleDocumentChange}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            maxLength={18}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            required
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Entrar
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <span>Não tem uma conta? </span>
        <Link to="/register" className="text-blue-600 hover:underline font-medium">Cadastrar-se</Link>
      </div>
    </div>
  );
};

export default LoginPage;