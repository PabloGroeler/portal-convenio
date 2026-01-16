// Create a new file at: src/pages/LegislationPage.tsx

interface LegislationItem {
  id: number;
  title: string;
  description: string;
  category: string;
  year: number;
  fileUrl: string;
}

const LegislationPage = () => {
  const legislationItems: LegislationItem[] = [
    {
      id: 1,
      title: 'Lei Complementar Nº 600',
      description: 'Dispõe sobre o Estatuto dos Servidores Públicos',
      category: 'Estatuto dos Servidores',
      year: 2021,
      fileUrl: '#'
    },
    {
      id: 2,
      title: 'Lei Nº 11.009',
      description: 'Institui o Código de Defesa do Contribuinte',
      category: 'Código de Defesa',
      year: 2022,
      fileUrl: '#'
    },
    {
      id: 3,
      title: 'Decreto Nº 2.168',
      description: 'Regulamenta a Lei de Licitações',
      category: 'Licitações',
      year: 2023,
      fileUrl: '#'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Legislação</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Legislação
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Acesso à legislação vigente
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {legislationItems.map((item) => (
            <li key={item.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600">
                    {item.title}
                  </p>
                  <div className="ml-2 flex-shrink-0">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {item.category}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-4">
                    Ano: {item.year}
                  </p>
                </div>
                <div className="mt-2">
                  <a
                    href={item.fileUrl}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar Documento
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LegislationPage;