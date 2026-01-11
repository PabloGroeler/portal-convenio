const ManualsPage = () => {
  const manuals = [
    {
      id: 1,
      title: 'Manual do Usuário',
      description: 'Guia completo para utilização do sistema',
      fileSize: '2.4 MB',
      fileType: 'PDF',
    },
    {
      id: 2,
      title: 'Guia de Navegação',
      description: 'Como navegar no portal de forma eficiente',
      fileSize: '1.8 MB',
      fileType: 'PDF',
    },
    {
      id: 3,
      title: 'Termos de Uso',
      description: 'Termos e condições de uso do portal',
      fileSize: '0.5 MB',
      fileType: 'PDF',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manuais</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {manuals.map((manual) => (
            <li key={manual.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {manual.title}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {manual.fileType}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <p className="text-sm text-gray-500">{manual.description}</p>
                  <p className="mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-4">
                    {manual.fileSize}
                  </p>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManualsPage;