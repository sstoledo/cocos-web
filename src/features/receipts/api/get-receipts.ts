import { parseApiError } from '@/lib/api-error';
import type { Receipt, ReceiptStatus } from '../types';

export async function getReceipts(status?: ReceiptStatus): Promise<Receipt[]> {
  const searchParams = new URLSearchParams();
  if (status) {
    searchParams.set('status', status);
  }
  const query = searchParams.toString();
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/receipts${query ? `?${query}` : ''}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch receipts');
  }

  return (await response.json()) as Receipt[];
}
