export type Convenio = {
  id?: number | string;
  title: string;
  description?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  status?: 'ACTIVE' | 'INACTIVE' | string;
  documentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

