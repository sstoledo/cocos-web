// Types transcribed verbatim from the frozen B10 backend contract
// (purchase-order-response.dto.ts). Do NOT invent new shapes here.
export type PurchaseOrderStatus =
  | 'draft'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderSupplier {
  id: string;
  name: string;
}

export interface PurchaseOrderLineProduct {
  id: string;
  code: string;
  name: string;
}

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  // Money travels as a string ('123.45') to avoid float drift.
  estimatedCostPrice: string;
  product: PurchaseOrderLineProduct;
}

export interface PurchaseOrderReceiptItem {
  productId: string;
  quantity: number;
  costPrice: string;
  expirationDate: string;
}

export interface PurchaseOrderReceipt {
  lotId: string;
  lotNumber: string;
  receivedAt: string;
  items: PurchaseOrderReceiptItem[];
}

export interface PurchaseOrder {
  id: string;
  // Format: COM-YYYY-NNNNNN.
  purchaseOrderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  notes?: string | null;
  estimatedTotal: string;
  supplier: PurchaseOrderSupplier;
  lines: PurchaseOrderLine[];
  receipts?: PurchaseOrderReceipt[];
  // Only populated by the receive endpoint response.
  lotIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderListFilters {
  status?: PurchaseOrderStatus;
  supplierId?: string;
  purchaseOrderNumber?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseOrderListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  meta: PurchaseOrderListMeta;
}

export interface CreatePurchaseOrderLineInput {
  productId: string;
  quantityOrdered: number;
  estimatedCostPrice: string;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  notes?: string;
  lines: CreatePurchaseOrderLineInput[];
}

// B10 full-replace semantics: the PATCH body carries the complete new line
// set (draft only).
export interface UpdatePurchaseOrderPayload {
  lines: CreatePurchaseOrderLineInput[];
}

export interface ReceivePurchaseOrderLineInput {
  lineId: string;
  receivedQty: number;
  expirationDate: string;
  actualCostPrice: string;
}

export interface ReceivePurchaseOrderPayload {
  lines: ReceivePurchaseOrderLineInput[];
}
