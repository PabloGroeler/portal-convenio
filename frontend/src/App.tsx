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

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
              <Route path="emendas" element={<DashboardEmendasPage />} />
              <Route path="cadastro-emenda" element={<CadastroEmendaPage />} />
              <Route path="instituicoes" element={<InstitutionsPage />} />
              <Route path="cadastro-dados-institucionais" element={<CadastroDadosInstitucionaisPage />} />
              <Route path="cadastro-dirigente" element={<CadastroDirigentePage />} />
                <Route path="diretoria" element={<DiretoriaPage />} />
                <Route path="parlamentares" element={<CouncilorsPage />} />
                <Route path="usuarios" element={<UsersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="tipos-documento-config" element={<TiposDocumentoConfigPage />} />
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

              {/* Full-screen admin pages */}
              <Route
                path="/painel/emendas"
                element={
                  <ProtectedRoute>
                    <EmendasPage />
                  </ProtectedRoute>
                }
              />

              {/* All other routes rendered inside Layout */}
              <Route path="/*" element={<Layout />}>
                <Route index element={<HomePage />} />
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
