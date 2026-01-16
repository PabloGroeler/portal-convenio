import React from 'react';

type Props = {
  total?: number;
  pending?: number;
  approved?: number;
  toRectify?: number;
  rejected?: number;
};

const EmendasStats: React.FC<Props> = ({
  total = 0,
  pending = 0,
  approved = 0,
  toRectify = 0,
  rejected = 0,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-card card-soft cursor-pointer hover:shadow-md transition-shadow">
        <div className="p-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-8 h-8 text-slate-400">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
              <path d="M10 9H8"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-card card-soft cursor-pointer hover:shadow-md transition-shadow">
        <div className="p-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-amber-600">{pending}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert w-8 h-8 text-amber-400">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="8" y2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-card card-soft cursor-pointer hover:shadow-md transition-shadow">
        <div className="p-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
              <p className="text-2xl font-bold text-emerald-600">{approved}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check w-8 h-8 text-emerald-400">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-card card-soft cursor-pointer hover:shadow-md transition-shadow">
        <div className="p-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Retificar</p>
              <p className="text-2xl font-bold text-orange-600">{toRectify}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw w-8 h-8 text-orange-400">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-card card-soft cursor-pointer hover:shadow-md transition-shadow">
        <div className="p-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reprovadas</p>
              <p className="text-2xl font-bold text-red-600">{rejected}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x w-8 h-8 text-red-400">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 6 6"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmendasStats;

