import { parseApiError } from '@/lib/api-error';
import type { Receipt } from '../types';

export async function discardReceipt(id: string): Promise<Receipt> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/receipts/${id}/discard`,
    { method: 'POST', credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to discard receipt');
  }

  return (await response.json()) as Receipt;
}
