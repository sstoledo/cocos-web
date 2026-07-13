export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: string;
  minStock?: number;
  barcode?: string;
  taxRate?: string;
  notes?: string;
  imageUrl?: string;
  imagePublicId?: string;
  isActive: boolean;
  presentation: { id: string; name: string };
  brand: { id: string; name: string };
  category: {
    id: string;
    name: string;
    parent?: { id: string; name: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListFilters {
  q?: string;
  isActive?: boolean;
}
