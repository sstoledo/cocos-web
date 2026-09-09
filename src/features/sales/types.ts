// Types transcribed verbatim from the frozen B8 backend contract
// (sale-response.dto.ts). Do NOT invent new shapes here.
export type SaleStatus = 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface SaleProductLine {
  id: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: string;
  subtotal: string;
  product: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    price: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SaleServiceLine {
  id: string;
  serviceId: string;
  quantity: number;
  unitPriceSnapshot: string;
  subtotal: string;
  service: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    price: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  clientId: string | null;
  branchId: string | null;
  employeeId: string | null;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  totalAmount: string;
  isActive: boolean;
  client: { id: string; name: string } | null;
  branch: { id: string; name: string } | null;
  employee: { id: string; name: string } | null;
  products: SaleProductLine[];
  services: SaleServiceLine[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface SaleListFilters {
  saleNumber?: string;
  from?: string;
  to?: string;
  clientId?: string;
  status?: SaleStatus;
  page?: number;
  limit?: number;
}

export interface SaleListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SaleListResponse {
  data: Sale[];
  meta: SaleListMeta;
}

export interface CreateSalePayload {
  clientId?: string;
  branchId?: string;
  employeeId?: string;
  paymentMethod: PaymentMethod;
  productLines?: { productId: string; quantity: number }[];
  serviceLines?: { serviceId: string; quantity: number }[];
}
