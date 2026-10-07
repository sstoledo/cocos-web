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
  page?: number;
  limit?: number;
}

export interface ServiceListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ServiceListResponse {
  data: Service[];
  meta: ServiceListMeta;
}

export type { ServiceFormValues } from './schemas/service-schema';
