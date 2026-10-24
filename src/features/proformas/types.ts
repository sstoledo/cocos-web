// Types transcribed verbatim from the backend proforma contract
// (proforma-response.dto.ts). Proformas are products-only: the backend
// snapshots the catalog unit price server-side, they never affect stock
// until converted into a sale.
export type ProformaStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'converted';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface ProformaProductLine {
  id: string;
  proformaId: string;
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

export interface Proforma {
  id: string;
  proformaNumber: string;
  clientId: string | null;
  branchId: string | null;
  employeeId: string | null;
  status: ProformaStatus;
  totalAmount: string;
  notes: string | null;
  convertedSaleId: string | null;
  isActive: boolean;
  client: { id: string; name: string } | null;
  branch: { id: string; name: string } | null;
  employee: { id: string; name: string } | null;
  products: ProformaProductLine[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProformaListFilters {
  proformaNumber?: string;
  from?: string;
  to?: string;
  clientId?: string;
  status?: ProformaStatus;
  page?: number;
  limit?: number;
}

export interface ProformaListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ProformaListResponse {
  data: Proforma[];
  meta: ProformaListMeta;
}

export interface CreateProformaPayload {
  clientId?: string;
  branchId?: string;
  employeeId?: string;
  notes?: string;
  productLines: { productId: string; quantity: number }[];
}

export interface ConvertProformaPayload {
  paymentMethod: PaymentMethod;
}
