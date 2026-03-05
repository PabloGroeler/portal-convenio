// In App.tsx
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';
import NewsArticlePage from './pages/NewsArticlePage';
import ContactPage from './pages/ContactPage';
import ManualsPage from './pages/ManualsPage';
import DownloadsPage from './pages/DownloadsPage';
import LegislationPage from './pages/LegislationPage';
import ConveniosPage from './pages/ConveniosPage';
import EmendasPage from './pages/EmendasPage';
import EmendaDetailPage from './pages/EmendaDetailPage';
import InstitutionsPage from './pages/InstitutionsPage';
import CouncilorsPage from './pages/CouncilorsPage';
import CadastroDadosInstitucionaisPage from './pages/CadastroDadosInstitucionaisPage';
import CadastroDirigentePage from './pages/CadastroDirigentePage';
import CadastroEmendaPage from './pages/CadastroEmendaPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardHomePage from './pages/DashboardHomePage';
import DashboardEmendasPage from './pages/DashboardEmendasPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import DiretoriaPage from './pages/DiretoriaPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TiposDocumentoConfigPage from './pages/TiposDocumentoConfigPage';
import PlanoFullPage from './pages/PlanoFullPage';
import PrestacaoContasPage from './pages/PrestacaoContasPage';
import PlanoTrabalhoPage from './pages/PlanoTrabalhoPage';
import AdminParlamentarLimitesPage from './pages/AdminParlamentarLimitesPage';
import FuncionalidadesConfigPage from './pages/FuncionalidadesConfigPage';
import React from 'react';

// Create a client
const queryClient = new QueryClient();

function App() {
  const routerBasename = window.location.pathname.startsWith('/emendas') ? '/emendas' : '/';

  // Runtime import/type checks to help debug "Element type is invalid" errors.
  // This logs the typeof each imported page/component and flags items that look like module objects
  // (i.e., { default: ... }) instead of a function/component.
  React.useEffect(() => {
    try {
      const checks: Array<{ name: string; comp: any }> = [
        { name: 'Layout', comp: Layout },
        { name: 'HomePage', comp: HomePage },
        { name: 'LoginPage', comp: LoginPage },
        { name: 'RegisterPage', comp: RegisterPage },
        { name: 'DashboardPage', comp: DashboardPage },
        { name: 'NewsPage', comp: NewsPage },
        { name: 'NewsArticlePage', comp: NewsArticlePage },
        { name: 'ContactPage', comp: ContactPage },
        { name: 'ManualsPage', comp: ManualsPage },
        { name: 'DownloadsPage', comp: DownloadsPage },
        { name: 'LegislationPage', comp: LegislationPage },
        { name: 'ConveniosPage', comp: ConveniosPage },
        { name: 'EmendasPage', comp: EmendasPage },
        { name: 'EmendaDetailPage', comp: EmendaDetailPage },
        { name: 'InstitutionsPage', comp: InstitutionsPage },
        { name: 'CouncilorsPage', comp: CouncilorsPage },
        { name: 'CadastroDadosInstitucionaisPage', comp: CadastroDadosInstitucionaisPage },
        { name: 'CadastroDirigentePage', comp: CadastroDirigentePage },
        { name: 'CadastroEmendaPage', comp: CadastroEmendaPage },
        { name: 'ProtectedRoute', comp: ProtectedRoute },
        { name: 'DashboardLayout', comp: DashboardLayout },
        { name: 'DashboardHomePage', comp: DashboardHomePage },
        { name: 'DashboardEmendasPage', comp: DashboardEmendasPage },
        { name: 'UsersPage', comp: UsersPage },
        { name: 'ProfilePage', comp: ProfilePage },
        { name: 'DiretoriaPage', comp: DiretoriaPage },
        { name: 'VerifyEmailPage', comp: VerifyEmailPage },
        { name: 'ForgotPasswordPage', comp: ForgotPasswordPage },
        { name: 'ResetPasswordPage', comp: ResetPasswordPage },
        { name: 'TiposDocumentoConfigPage', comp: TiposDocumentoConfigPage },
        { name: 'PlanoFullPage', comp: PlanoFullPage },
        { name: 'PrestacaoContasPage', comp: PrestacaoContasPage },
        { name: 'PlanoTrabalhoPage', comp: PlanoTrabalhoPage },
        { name: 'AdminParlamentarLimitesPage', comp: AdminParlamentarLimitesPage },
        { name: 'FuncionalidadesConfigPage', comp: FuncionalidadesConfigPage },
      ];

    } catch (err) {
      console.error('Import check failed', err);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={routerBasename}>
        <AuthProvider>
          <Routes>
              {/* Email verification (public route) */}
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Password reset (public routes) */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Dashboard SPA layout (task-6) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
              {/* default content */}
              <Route index element={<DashboardHomePage />} />
              <Route path="plano/full/:id" element={<PlanoFullPage />} />
              <Route path="plano/prestacao-contas" element={<PrestacaoContasPage />} />
              <Route path="plano-trabalho" element={<PlanoTrabalhoPage />} />
              <Route path="planos" element={<PlanoTrabalhoPage />} />
              <Route path="novo-plano" element={<PlanoFullPage />} />
              <Route path="editar-plano" element={<PlanoFullPage />} />
              <Route path="emendas" element={<DashboardEmendasPage />} />
              <Route path="emendas/:id" element={<EmendaDetailPage />} />
              <Route path="cadastro-emenda" element={<CadastroEmendaPage />} />
              <Route path="instituicoes" element={<InstitutionsPage />} />
              <Route path="cadastro-dados-institucionais" element={<CadastroDadosInstitucionaisPage />} />
              <Route path="cadastro-dirigente" element={<CadastroDirigentePage />} />
                <Route path="diretoria" element={<DiretoriaPage />} />
                <Route path="parlamentares" element={<CouncilorsPage />} />
                <Route path="usuarios" element={<UsersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="tipos-documento-config" element={<TiposDocumentoConfigPage />} />
                <Route path="admin/funcionalidades" element={<FuncionalidadesConfigPage />} />
                <Route path="admin/parlamentar-limites" element={<AdminParlamentarLimitesPage />} />
              </Route>

              {/* Full-screen pages (no header/footer) */}
              <Route
                path="/emendas"
                element={
                  <ProtectedRoute>
                    <EmendasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emendas/:id"
                element={
                  <ProtectedRoute>
                    <EmendaDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/plano/full/:id" element={<PlanoFullPage />} />
              <Route path="/plano/prestacao-contas" element={<PrestacaoContasPage />} />

              {/* Redirect legacy routes to dashboard */}
              <Route path="/emendas" element={<Navigate to="/dashboard/emendas" replace />} />
              <Route path="/emendas/:id" element={<Navigate to="/dashboard/emendas" replace />} />
              <Route
                path="/painel/emendas"
                element={<Navigate to="/dashboard/emendas" replace />}
              />

              {/* Standalone landing page — no navbar/footer */}
              <Route path="/" element={<HomePage />} />

              {/* Standalone public pages — no navbar/footer */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* All other routes rendered inside Layout */}
              <Route path="/*" element={<Layout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* Backward compatible redirect: /painel -> /dashboard */}
                <Route path="painel" element={<Navigate to="/dashboard" replace />} />

                 <Route
                  path="painel-old"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                 <Route path="news" element={<NewsPage />} />
                 <Route path="news/:id" element={<NewsArticlePage />} />
                 <Route path="contact" element={<ContactPage />} />
                 <Route path="manuals" element={<ManualsPage />} />
                 <Route path="downloads" element={<DownloadsPage />} />
                 <Route path="legislation" element={<LegislationPage />} />
                 <Route
                   path="painel/convenios"
                   element={
                     <ProtectedRoute>
                       <ConveniosPage />
                     </ProtectedRoute>
                   }
                 />
                 <Route
                   path="painel/councilors"
                   element={
                     <ProtectedRoute>
                       <CouncilorsPage />
                     </ProtectedRoute>
                   }
                 />
               </Route>
             </Routes>
         </AuthProvider>
       </Router>
     </QueryClientProvider>
   );
}

export default App;
