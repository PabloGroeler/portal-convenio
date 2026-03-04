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
                className="flex items-center gap-2 text-white hover:text-blue-200 px-2 py-1 rounded"
              >
                <img
                  src="https://www.sinop.mt.gov.br/wp-content/uploads/2022/01/brasao-sinop.png"
                  alt="SIGEM"
                  className="h-6 w-6 object-contain"
                  onError={e => { e.currentTarget.src = '/emendas/favicon.ico'; }}
                />
                <span className="font-semibold text-sm">SIGEM</span>
              </button>
            </div>
          ) : (
            // keep an empty placeholder for layout alignment — brand text removed
            <div />
          )}

          {/* Right side: public links always visible; auth action (Entrar/Sair) conditional */}
          <div className="hidden md:flex items-center space-x-8">
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