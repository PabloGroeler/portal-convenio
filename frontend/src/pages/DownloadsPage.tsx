// Create a new file at: src/pages/DownloadsPage.tsx

const DownloadsPage = () => {
  const downloads = [
    {
      id: 1,
      title: 'Formulário de Cadastro',
      description: 'Formulário para cadastro de novos usuários',
      fileSize: '150 KB',
      fileType: 'PDF',
      url: '#'
    },
    {
      id: 2,
      title: 'Manual de Instalação',
      description: 'Guia completo de instalação do software',
      fileSize: '2.1 MB',
      fileType: 'ZIP',
      url: '#'
    },
    {
      id: 3,
      title: 'Relatório Anual 2023',
      description: 'Relatório completo das atividades anuais',
      fileSize: '3.5 MB',
      fileType: 'PDF',
      url: '#'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Downloads</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {downloads.map((item) => (
            <li key={item.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {item.title}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {item.fileType}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-4">
                    {item.fileSize}
                  </p>
                </div>
                <div className="mt-2">
                  <a
                    href={item.url}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    download
                  >
                    Baixar
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

export default DownloadsPage;