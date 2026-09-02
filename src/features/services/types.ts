export interface Service {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: string;
  estimatedDuration?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListFilters {
  q?: string;
  isActive?: boolean;
}
