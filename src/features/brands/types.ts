export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandListFilters {
  q?: string;
}

export type { BrandFormValues } from './schemas/brand-schema';
