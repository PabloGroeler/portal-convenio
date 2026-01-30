import React from 'react';
import EmendasPage from './EmendasPage';

// Wrapper so Emendas can be rendered inside the /dashboard layout without changing EmendasPage itself.
const DashboardEmendasPage: React.FC = () => {
  return <EmendasPage />;
};

export default DashboardEmendasPage;

