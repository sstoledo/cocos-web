export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandListFilters {
  q?: string;
}

export interface BrandListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface BrandListResponse {
  data: Brand[];
  meta: BrandListMeta;
}

export type { BrandFormValues } from './schemas/brand-schema';
