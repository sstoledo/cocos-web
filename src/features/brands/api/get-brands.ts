import type { BrandListFilters, BrandListResponse } from '../types';

export async function getBrands(
  filters: BrandListFilters
): Promise<BrandListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.page) {
    searchParams.set('page', filters.page.toString());
  }

  if (filters.limit) {
    searchParams.set('limit', filters.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/brands${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.status}`);
  }

  return (await response.json()) as BrandListResponse;
}
