import type { ProductReference } from '../types';

export type ProductReferences = {
  presentations: ProductReference[];
  brands: ProductReference[];
  categories: ProductReference[];
};

async function unwrap<T>(response: Response): Promise<T[]> {
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data; // handle both paginated and legacy
}

export async function getProductReferences(): Promise<ProductReferences> {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [presentationsResponse, brandsResponse, categoriesResponse] =
    await Promise.all([
      fetch(`${baseUrl}/presentations`, { credentials: 'include' }),
      fetch(`${baseUrl}/brands`, { credentials: 'include' }),
      fetch(`${baseUrl}/categories`, { credentials: 'include' }),
    ]);

  const [presentations, brands, categories] = await Promise.all([
    unwrap<ProductReference>(presentationsResponse),
    unwrap<ProductReference>(brandsResponse),
    unwrap<ProductReference>(categoriesResponse),
  ]);

  return { presentations, brands, categories };
}
