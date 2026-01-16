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
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/painel" element={<DashboardPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsArticlePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/manuals" element={<ManualsPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/legislation" element={<LegislationPage />} />
                <Route
                  path="/painel/convenios"
                  element={
                    <ProtectedRoute>
                      <ConveniosPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </AuthWrapper>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;