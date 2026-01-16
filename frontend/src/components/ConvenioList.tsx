// Add a minimal ConvenioList component with a default export
import React from 'react';

const ConvenioList: React.FC = () => {
  const items = [
    { id: 1, title: 'Convênio A' },
    { id: 2, title: 'Convênio B' },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Lista de Convênios</h2>
      <ul>
        {items.map((it) => (
          <li key={it.id} className="border-b py-2">{it.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConvenioList;

