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
                  src="favicon.ico"
                  alt="SIGEM"
                  className="h-6 w-6 object-contain"
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E";
                  }}
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