export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  identification?: string;
  identificationType?: 'DNI' | 'RUC';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  notes?: string;
  clientId: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientListFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface VehicleListFilters {
  page?: number;
  limit?: number;
}

export type ClientFormValues = {
  name: string;
  identificationType: 'DNI' | 'RUC';
  identification: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type VehicleFormValues = {
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  notes?: string;
  clientId: string;
};
