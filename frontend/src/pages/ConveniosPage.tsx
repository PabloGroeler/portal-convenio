import React from 'react';
import ConvenioList from '../components/ConvenioList';
import ConvenioForm from '../components/ConvenioForm';

const ConveniosPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Convenios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ConvenioList />
        </div>
        <div className="md:col-span-1">
          <ConvenioForm />
        </div>
      </div>
    </div>
  );
};

export default ConveniosPage;
