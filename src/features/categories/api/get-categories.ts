import type { Category, CategoryListFilters } from '../types';

export async function getCategories(
  filters: CategoryListFilters
): Promise<Category[]> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/categories${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  return (await response.json()) as Category[];
}
