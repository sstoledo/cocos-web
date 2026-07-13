import type { Product, ProductListFilters } from '../types';

export async function getProducts(
  filters: ProductListFilters
): Promise<Product[]> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', filters.isActive.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return (await response.json()) as Product[];
}
