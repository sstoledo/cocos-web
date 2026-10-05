export interface LotSupplier {
  id: string;
  name: string;
}

export interface LotProduct {
  id: string;
  name: string;
}

export interface LotItem {
  id: string;
  product: LotProduct;
  quantity: number;
  remainingQuantity: number;
  costPrice: string;
  expirationDate: string;
}

export interface Lot {
  id: string;
  lotNumber: string;
  supplier: LotSupplier;
  receivedAt: string;
  notes?: string;
  items: LotItem[];
}

export interface LotListFilters {
  q?: string;
}

export interface LotListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface LotListResponse {
  data: Lot[];
  meta: LotListMeta;
}

export type { LotFormValues } from './schemas/lot-schema';
