import { parseApiError } from '@/lib/api-error';
import type { Receipt } from '../types';

export async function getReceipt(id: string): Promise<Receipt> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/receipts/${id}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch receipt');
  }

  return (await response.json()) as Receipt;
}
