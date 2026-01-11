import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;