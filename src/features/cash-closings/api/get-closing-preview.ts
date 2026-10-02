import { parseApiError } from '@/lib/api-error';
import type { ClosingPreview } from '../types';

export async function getClosingPreview(): Promise<ClosingPreview> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cash-closings/preview`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch closing preview');
  }

  return (await response.json()) as ClosingPreview;
}
