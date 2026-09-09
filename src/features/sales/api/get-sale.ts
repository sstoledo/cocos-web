import { parseApiError } from '@/lib/api-error';
import type { Sale } from '../types';

export async function getSale(id: string): Promise<Sale> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/sales/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch sale');
  }

  return (await response.json()) as Sale;
}
