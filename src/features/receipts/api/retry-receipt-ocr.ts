import { parseApiError } from '@/lib/api-error';
import type { Receipt } from '../types';

export async function retryReceiptOcr(id: string): Promise<Receipt> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/receipts/${id}/ocr`,
    { method: 'POST', credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to retry receipt OCR');
  }

  return (await response.json()) as Receipt;
}
