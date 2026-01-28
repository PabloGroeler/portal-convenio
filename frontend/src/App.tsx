// In App.tsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient();

// Create a wrapper component that has access to useNavigate
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      navigate('/painel');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AuthWrapper>
            <Routes>
              {/* Full-screen pages (no header/footer) */}
              <Route path="/emendas" element={<EmendasPage />} />
              <Route path="/emendas/:id" element={<EmendaDetailPage />} />

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
                <Route
                  path="painel"
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
                  path="painel/institutions"
                  element={
                    <ProtectedRoute>
                      <InstitutionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="painel/cadastro-dados-institucionais"
                  element={
                    <ProtectedRoute>
                      <CadastroDadosInstitucionaisPage />
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
          </AuthWrapper>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;