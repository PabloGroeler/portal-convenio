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
          {/* Left side: compact admin header when authenticated, full brand when not */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-white hover:text-blue-200 px-3 py-1 rounded"
              >
                Application name
              </button>
              <Link to="/painel" className="hover:text-blue-200">
                Painel
              </Link>
            </div>
          ) : (
            // keep an empty placeholder for layout alignment — brand text removed
            <div />
          )}

          {/* Right side: public links always visible; auth action (Entrar/Sair) conditional */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated && (
              <Link to="/painel" className="hover:text-blue-200">
                Painel
              </Link>
            )}
{/*             <Link to="/news" className="hover:text-blue-200">
//               Notícias
//             </Link>
//             <Link to="/manuals" className="hover:text-blue-200">
//               Manuais
//             </Link>
//             <Link to="/downloads" className="hover:text-blue-200">
//               Downloads
//             </Link>
//             <Link to="/legislation" className="hover:text-blue-200">
//               Legislação
//             </Link>*/}
            <Link to="/contact" className="hover:text-blue-200">
              Contato
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Sair
              </button>
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