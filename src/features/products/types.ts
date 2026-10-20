export type ProductConsumptionType = 'direct' | 'partial';

export const PRODUCT_CONSUMPTION_TYPE_LABELS: Record<
  ProductConsumptionType,
  string
> = {
  direct: 'Consumo directo',
  partial: 'Consumo parcial (envase)',
};

export interface Product {
  id: string;
  code: string;
  name: string;
  consumptionType?: ProductConsumptionType;
  description?: string;
  price: string;
  minStock?: number;
  barcode?: string;
  taxRate?: string;
  notes?: string;
  imageUrl?: string | null;
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

export interface ProductReference {
  id: string;
  name: string;
  parent?: { id: string; name: string } | null;
}

export type { ProductFormValues } from './schemas/product-schema';

export interface ProductListItem extends Product {
  stock: number;
  imageUrl: string | null;
}

export interface ProductListFilters {
  q?: string;
  isActive?: boolean;
  brandId?: string;
  categoryId?: string;
  presentationId?: string;
  page?: number;
  limit?: number;
}

export interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ProductListResponse {
  data: ProductListItem[];
  meta: ProductListMeta;
}
