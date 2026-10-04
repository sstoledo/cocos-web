import type { Category } from '../types';

export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/categories/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.status}`);
  }

  return (await response.json()) as Category;
}
