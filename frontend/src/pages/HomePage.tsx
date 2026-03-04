import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Brasão Sinop */}
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
                parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:#93c5fd"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
              }
            }}
          />
        </div>

        <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">
          Prefeitura Municipal de Sinop — MT
        </p>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-2">
          SIGEM
        </h1>
        <p className="text-blue-300 text-base font-medium mb-4">
          Sistema de Gestão de Emendas Municipais
        </p>

        <p className="text-slate-300 text-lg max-w-xl mb-10">
          Plataforma integrada para acompanhamento, análise e execução de emendas
          parlamentares municipais.
        </p>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200 text-base"
        >
          Acessar o Sistema
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Features strip */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              ),
              title: 'Gestão de Emendas',
              desc: 'Cadastro, acompanhamento e controle das emendas parlamentares municipais.',
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: 'Fluxo de Aprovação',
              desc: 'Análise de admissibilidade, demanda e documental.',
            },
            {
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              title: 'Planos de Trabalho',
              desc: 'Elaboração e acompanhamento de planos de trabalho.'
            },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
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

export default HomePage;


