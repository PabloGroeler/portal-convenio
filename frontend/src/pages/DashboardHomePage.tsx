import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Bem-vindo</h2>
        <p className="text-gray-600 mb-4">Selecione uma opção no menu à esquerda.</p>
      </div>
    </div>
  );
};

export default DashboardHomePage;

