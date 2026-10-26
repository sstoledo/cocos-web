import type { Lot } from '@/features/lots/types';
import type { PurchaseOrder } from '@/features/purchase-orders/types';

export type ReceiptStatus = 'pending' | 'confirmed' | 'discarded';
export type ReceiptMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

export interface ReceiptExtractionItem {
  description: string;
  code: string | null;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptExtraction {
  items: ReceiptExtractionItem[];
  issueDate: string | null;
  supplierName: string | null;
  documentNumber: string | null;
}

// ocrPayload is deliberately excluded: the raw provider response is audit
// data and must never be rendered by the web client.
export interface Receipt {
  id: string;
  status: ReceiptStatus;
  mimeType: ReceiptMimeType;
  fileName: string;
  filePublicId: string;
  fileUrl: string;
  extracted: ReceiptExtraction | null;
  ocrModel: string | null;
  lotId: string | null;
  lot: { id: string; lotNumber: string } | null;
  purchaseOrderId: string | null;
  purchaseOrder: { id: string; purchaseOrderNumber: string } | null;
  supplierId: string | null;
  supplier: { id: string; name: string } | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmReceiptLotItem {
  productId: string;
  quantity: number;
  costPrice: number;
  expirationDate: string;
}

export interface ConfirmReceiptLotPayload {
  supplierId: string;
  lotNumber?: string;
  notes?: string;
  items: ConfirmReceiptLotItem[];
}

export interface ConfirmReceiptPurchaseOrderLine {
  lineId: string;
  receivedQty: number;
  expirationDate: string;
  actualCostPrice: string;
}

export interface ConfirmReceiptPurchaseOrderPayload {
  purchaseOrderId: string;
  lines: ConfirmReceiptPurchaseOrderLine[];
}

export interface ConfirmReceiptLotResponse {
  lot: Lot;
  receipt: Receipt;
}

export interface ConfirmReceiptPurchaseOrderResponse {
  purchaseOrder: PurchaseOrder;
  receipt: Receipt;
}
