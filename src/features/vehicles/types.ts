export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  color?: string | null;
  notes?: string | null;
  clientId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSelectOption {
  id: string;
  name: string;
}

export interface PaginationMeta {
  page: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface VehicleListFilters {
  q?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export type VehicleFormValues = {
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  notes?: string;
  clientId: string;
  isActive: boolean;
};
