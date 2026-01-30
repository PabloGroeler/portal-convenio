import React from 'react';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
      <p className="text-gray-600">
        Aqui você poderá gerenciar usuários (listagem, criação, permissões). Em breve.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Próximos passos</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Listar usuários cadastrados</li>
          <li>Criar/editar usuários</li>
          <li>Definir papéis/permissões</li>
        </ul>
      </div>
    </div>
  );
};

export default UsersPage;

