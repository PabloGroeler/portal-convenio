// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as any)?.message as string | undefined;

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';
  const expiredMessage = isExpired ? 'Sua sessão expirou. Por favor, faça login novamente.' : null;

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setDocument(value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'));
    } else {
      setDocument(value
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2'));
    }
  };

  useEffect(() => {
    if (successMessage) {
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
    setLoading(true);
    const cleanDocument = document.replace(/\D/g, '');
    try {
      const success = await login(cleanDocument, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('CPF/CNPJ ou senha inválidos. Verifique e tente novamente.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor. Tente novamente mais tarde.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">

      {/* ── Header — igual à tela inicial ── */}
      <div className="flex flex-col items-center pt-14 pb-8 px-6 text-center">
        {/* Brasão */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 border-blue-400/40 shadow-2xl bg-white/5 overflow-hidden">
          <img
            src="https://www.sinop.mt.gov.br/wp-content/uploads/2022/01/brasao-sinop.png"
            alt="Brasão de Sinop"
            className="w-20 h-20 object-contain drop-shadow-lg"
            onError={e => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:#93c5fd"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>`;
              }
            }}
          />
        </div>

        <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">
          Prefeitura Municipal de Sinop — MT
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-2">SIGEM</h1>
        <p className="text-blue-300 text-base font-medium mb-1">
          Sistema de Gestão de Emendas Municipais
        </p>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-sm">

          {/* Alerts */}
          {expiredMessage && (
            <div className="mb-4 flex items-start gap-3 p-3.5 bg-amber-900/40 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {expiredMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 flex items-start gap-3 p-3.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-3 p-3.5 bg-red-900/40 border border-red-500/30 rounded-xl text-red-200 text-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CPF / CNPJ */}
            <div>
              <label htmlFor="document" className="block text-sm font-medium text-slate-300 mb-1.5">
                CPF ou CNPJ
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="document"
                  value={document}
                  onChange={handleDocumentChange}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">Senha</label>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-base mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  Acessar o Sistema
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-5 text-center text-slate-500 text-xs space-y-1">
        <div>&copy; {new Date().getFullYear()} SIGEM &mdash; Prefeitura Municipal de Sinop &mdash; MT &middot; Todos os direitos reservados</div>
        <div>Desenvolvido em Parceria com a Diretoria de Softwares e Suporte a TIC.</div>
      </div>

    </div>
  );
};

export default LoginPage;

