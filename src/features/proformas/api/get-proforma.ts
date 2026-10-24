import { parseApiError } from '@/lib/api-error';
import type { Proforma } from '../types';

export async function getProforma(id: string): Promise<Proforma> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/proformas/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch proforma');
  }

  return (await response.json()) as Proforma;
}
