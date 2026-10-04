import type { Category, CategoryFormValues } from '../types';

export async function updateCategory(
  id: string,
  values: Partial<CategoryFormValues>
): Promise<Category> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/categories/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update category: ${response.status}`);
  }

  return (await response.json()) as Category;
}
