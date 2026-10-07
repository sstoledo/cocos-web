export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListFilters {
  q?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface SupplierListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SupplierListResponse {
  data: Supplier[];
  meta: SupplierListMeta;
}

export type SupplierFormValues = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
};
