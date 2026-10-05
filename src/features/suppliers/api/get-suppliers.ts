import type { SupplierListFilters, SupplierListResponse } from '../types';

export async function getSuppliers(
  filters: SupplierListFilters
): Promise<SupplierListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', filters.isActive.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/suppliers${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers: ${response.status}`);
  }

  return (await response.json()) as SupplierListResponse;
}
