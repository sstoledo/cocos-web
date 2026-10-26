import { parseApiError } from '@/lib/api-error';
import type {
  ConfirmReceiptLotPayload,
  ConfirmReceiptLotResponse,
} from '../types';

export async function confirmReceiptLot(
  id: string,
  payload: ConfirmReceiptLotPayload
): Promise<ConfirmReceiptLotResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/receipts/${id}/confirm-lot`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to confirm receipt as lot');
  }

  return (await response.json()) as ConfirmReceiptLotResponse;
}
