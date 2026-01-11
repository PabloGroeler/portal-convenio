import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Gov MT
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/news" className="hover:text-blue-200">
              Notícias
            </Link>
            <Link to="/manuals" className="hover:text-blue-200">
              Manuais
            </Link>
            <Link to="/downloads" className="hover:text-blue-200">
              Downloads
            </Link>
            <Link to="/legislation" className="hover:text-blue-200">
              Legislação
            </Link>
            <Link to="/contact" className="hover:text-blue-200">
              Contato
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">
                  Painel
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-gray-100"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;