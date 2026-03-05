import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/userService';
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    personType: 'PF',
    cpfCnpj: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};'"\\|,.<>\/?]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);
  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(cpf.charAt(10));
  };
  const validateCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0; let pos = size - 7;
    for (let i = size; i >= 1; i--) { sum += parseInt(numbers.charAt(size - i)) * pos--; if (pos < 2) pos = 9; }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    size++; numbers = cnpj.substring(0, size); sum = 0; pos = size - 7;
    for (let i = size; i >= 1; i--) { sum += parseInt(numbers.charAt(size - i)) * pos--; if (pos < 2) pos = 9; }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
  };
  const formatCPF = (v: string) => { const n = v.replace(/\D/g,''); if(n.length<=3)return n; if(n.length<=6)return n.slice(0,3)+'.'+n.slice(3); if(n.length<=9)return n.slice(0,3)+'.'+n.slice(3,6)+'.'+n.slice(6); return n.slice(0,3)+'.'+n.slice(3,6)+'.'+n.slice(6,9)+'-'+n.slice(9,11); };
  const formatCNPJ = (v: string) => { const n = v.replace(/\D/g,''); if(n.length<=2)return n; if(n.length<=5)return n.slice(0,2)+'.'+n.slice(2); if(n.length<=8)return n.slice(0,2)+'.'+n.slice(2,5)+'.'+n.slice(5); if(n.length<=12)return n.slice(0,2)+'.'+n.slice(2,5)+'.'+n.slice(5,8)+'/'+n.slice(8); return n.slice(0,2)+'.'+n.slice(2,5)+'.'+n.slice(5,8)+'/'+n.slice(8,12)+'-'+n.slice(12,14); };
  const isCpfCnpjValid = () => { const c = formData.cpfCnpj.replace(/\D/g,''); return formData.personType==='PF'?validateCPF(c):validateCNPJ(c); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cpfCnpj') {
      setFormData(prev => ({ ...prev, [name]: formData.personType==='PF'?formatCPF(value):formatCNPJ(value) }));
    } else if (name === 'personType') {
      setFormData(prev => ({ ...prev, [name]: value, cpfCnpj: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (!formData.cpfCnpj) { setError('Por favor, informe o '+(formData.personType==='PF'?'CPF':'CNPJ')); setLoading(false); return; }
    if (!isCpfCnpjValid()) { setError((formData.personType==='PF'?'CPF':'CNPJ')+' inv\u00e1lido'); setLoading(false); return; }
    if (!isPasswordValid) { setError('A senha n\u00e3o atende aos requisitos m\u00ednimos de seguran\u00e7a'); setLoading(false); return; }
    if (formData.password !== formData.confirmPassword) { setError('As senhas n\u00e3o coincidem'); setLoading(false); return; }
    try {
      const d = formData.cpfCnpj.replace(/\D/g,'');
      await register({ username: formData.name, email: formData.email, password: formData.password, cpf: formData.personType==='PF'?d:null, cnpj: formData.personType==='PJ'?d:null, nomeCompleto: formData.name });
      setShowSuccessModal(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data || err?.message || 'Erro ao realizar cadastro. Tente novamente.';
      setError(String(msg)); setLoading(false);
    }
  };
  const handleSuccessModalClose = () => { setShowSuccessModal(false); navigate('/login'); };
  const reqList = [
    { ok: passwordRequirements.minLength,      label: 'M\u00ednimo de 8 caracteres' },
    { ok: passwordRequirements.hasUpperCase,   label: 'Pelo menos uma letra mai\u00fascula (A-Z)' },
    { ok: passwordRequirements.hasLowerCase,   label: 'Pelo menos uma letra min\u00fascula (a-z)' },
    { ok: passwordRequirements.hasNumber,      label: 'Pelo menos um n\u00famero (0-9)' },
    { ok: passwordRequirements.hasSpecialChar, label: 'Pelo menos um caractere especial (!@#$%)' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      <div className="flex flex-col items-center pt-12 pb-8 px-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-blue-400/40 shadow-2xl bg-white/5 overflow-hidden">
          <img src="favicon.ico" alt="Bras\u00e3o de Sinop" className="w-16 h-16 object-contain drop-shadow-lg"
            onError={e => { e.currentTarget.onerror=null; e.currentTarget.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E"; }} />
        </div>
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Prefeitura Municipal de Sinop &mdash; MT</p>
        <h1 className="text-4xl font-bold text-white mb-1">SIGEM</h1>
        <p className="text-blue-300 text-sm font-medium">Sistema de Gest&atilde;o de Emendas Municipais</p>
      </div>
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-bold text-white mb-1 text-center">Criar nova conta</h2>
          <p className="text-slate-400 text-sm mb-6 text-center">
            J&aacute; tem uma conta?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">Fazer login</Link>
          </p>
          {error && (
            <div className="mb-4 flex items-start gap-3 p-3.5 bg-red-900/40 border border-red-500/30 rounded-xl text-red-200 text-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">Nome completo</label>
              <input id="name" name="name" type="text" required maxLength={256} value={formData.name} onChange={handleChange} placeholder="Nome completo" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div>
              <label htmlFor="personType" className="block text-sm font-medium text-slate-300 mb-1.5">Tipo de Pessoa</label>
              <select id="personType" name="personType" value={formData.personType} onChange={handleChange} className="w-full rounded-xl px-4 py-3 text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="PF">Pessoa F&iacute;sica (CPF)</option>
                <option value="PJ">Pessoa Jur&iacute;dica (CNPJ)</option>
              </select>
            </div>
            <div>
              <label htmlFor="cpfCnpj" className="block text-sm font-medium text-slate-300 mb-1.5">{formData.personType === 'PF' ? 'CPF' : 'CNPJ'}</label>
              <input id="cpfCnpj" name="cpfCnpj" type="text" required value={formData.cpfCnpj} onChange={handleChange} maxLength={formData.personType==='PF'?14:18} placeholder={formData.personType==='PF'?'000.000.000-00':'00.000.000/0000-00'} className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="seu@email.com" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} placeholder="Crie uma senha forte" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            {(passwordFocused || formData.password.length > 0) && (
              <div className="px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1.5">
                <p className="font-semibold text-slate-300 mb-2">A senha deve conter:</p>
                {reqList.map(({ ok, label }) => (
                  <div key={label} className={'flex items-center gap-2 ' + (ok ? 'text-emerald-400' : 'text-slate-500')}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      {ok ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
                    </svg>
                    {label}
                  </div>
                ))}
              </div>
            )}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar senha</label>
              <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} placeholder="Repita a senha" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <button type="submit" disabled={loading || !isPasswordValid || formData.password !== formData.confirmPassword} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-base mt-2">
              {loading ? (<><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Cadastrando...</>) : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-slate-500 text-xs space-y-1">
        <div>&copy; {new Date().getFullYear()} SIGEM &mdash; Prefeitura Municipal de Sinop &mdash; MT &middot; Todos os direitos reservados</div>
        <div>Desenvolvido em Parceria com a Diretoria de Softwares e Suporte a TIC.</div>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 h-full w-full z-50 flex items-center justify-center p-4">
          <div className="mx-auto p-6 w-full max-w-sm shadow-2xl rounded-2xl bg-slate-800 border border-slate-700 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 mb-4">
              <svg className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cadastro realizado com sucesso!</h3>
            <p className="text-slate-400 text-sm mb-1">Voc&ecirc; receber&aacute; um e-mail para ativar sua conta.</p>
            <p className="text-slate-400 text-sm mb-5">Ap&oacute;s a ativa&ccedil;&atilde;o, ser&aacute; poss&iacute;vel realizar o login.</p>
            <button onClick={handleSuccessModalClose} className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default RegisterPage;