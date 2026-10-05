import type { LotListFilters, LotListResponse } from '../types';

export async function getLots(
  filters: LotListFilters
): Promise<LotListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/lots${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lots: ${response.status}`);
  }

  return (await response.json()) as LotListResponse;
}
