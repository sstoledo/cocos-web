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
