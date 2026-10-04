import type { Category, CategoryFormValues } from '../types';

export async function createCategory(
  values: CategoryFormValues
): Promise<Category> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.status}`);
  }

  return (await response.json()) as Category;
}
