import type { ProductListFilters, ProductListResponse } from '../types';

export async function getProducts(
  filters: ProductListFilters
): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', filters.isActive.toString());
  }

  if (filters.brandId) {
    searchParams.set('brandId', filters.brandId);
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  if (filters.presentationId) {
    searchParams.set('presentationId', filters.presentationId);
  }

  if (filters.page) {
    searchParams.set('page', filters.page.toString());
  }

  if (filters.limit) {
    searchParams.set('limit', filters.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return (await response.json()) as ProductListResponse;
}
