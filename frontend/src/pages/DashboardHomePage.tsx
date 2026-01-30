import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-800 rounded shadow hover:bg-gray-100"
        >
          Voltar para Home
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Bem-vindo</h2>
        <p className="text-gray-600 mb-4">Selecione uma opção no menu à esquerda.</p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard/emendas"
            className="inline-flex items-center px-4 py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
          >
            Ir para Emendas
          </Link>
          <Link
            to="/dashboard/instituicoes"
            className="inline-flex items-center px-4 py-2 rounded bg-gray-900 text-white text-sm font-medium hover:bg-black"
          >
            Gerenciar Instituições
          </Link>
          <Link
            to="/dashboard/parlamentares"
            className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            Gerenciar Parlamentares
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;

