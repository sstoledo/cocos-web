import { parseApiError } from '@/lib/api-error';
import type {
  ConfirmReceiptPurchaseOrderPayload,
  ConfirmReceiptPurchaseOrderResponse,
} from '../types';

export async function confirmReceiptPurchaseOrder(
  id: string,
  payload: ConfirmReceiptPurchaseOrderPayload
): Promise<ConfirmReceiptPurchaseOrderResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/receipts/${id}/confirm-purchase-order`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseApiError(
      response,
      'Failed to confirm receipt against purchase order'
    );
  }

  return (await response.json()) as ConfirmReceiptPurchaseOrderResponse;
}
