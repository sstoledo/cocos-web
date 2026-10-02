import { parseApiError } from '@/lib/api-error';
import type { CashClosing, CreateCashClosingInput } from '../types';

export async function createCashClosing(
  input: CreateCashClosingInput
): Promise<CashClosing> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cash-closings`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create cash closing');
  }

  return (await response.json()) as CashClosing;
}
