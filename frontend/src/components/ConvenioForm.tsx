// Add a minimal ConvenioForm component with a default export
import React, { useState } from 'react';

const ConvenioForm: React.FC = () => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder: normally you'd call an API to create a convenio
    // For now, just log
    console.log('Create convenio', { title });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Novo Convênio</h2>
      <div className="mb-2">
        <label className="block text-sm">Título</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do convênio"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Adicionar
      </button>
    </form>
  );
};

export default ConvenioForm;

