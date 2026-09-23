import { parseApiError } from '@/lib/api-error';
import type { PurchaseOrder, ReceivePurchaseOrderPayload } from '../types';

// B10: the receive response is the PurchaseOrder with `lotIds` populated
// (one lot per receive call).
export async function receivePurchaseOrder(
  id: string,
  payload: ReceivePurchaseOrderPayload
): Promise<PurchaseOrder> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/purchase-orders/${id}/receive`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to receive purchase order');
  }

  return (await response.json()) as PurchaseOrder;
}
