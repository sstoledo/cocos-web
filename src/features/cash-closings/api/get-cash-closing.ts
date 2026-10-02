import { parseApiError } from '@/lib/api-error';
import type { CashClosing } from '../types';

export async function getCashClosing(id: string): Promise<CashClosing> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cash-closings/${id}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch cash closing');
  }

  return (await response.json()) as CashClosing;
}
