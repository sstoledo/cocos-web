import type { ProductReference } from '../types';

export type ProductReferences = {
  presentations: ProductReference[];
  brands: ProductReference[];
  categories: ProductReference[];
};

export async function getProductReferences(): Promise<ProductReferences> {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [presentationsResponse, brandsResponse, categoriesResponse] =
    await Promise.all([
      fetch(`${baseUrl}/presentations`, { credentials: 'include' }),
      fetch(`${baseUrl}/brands`, { credentials: 'include' }),
      fetch(`${baseUrl}/categories`, { credentials: 'include' }),
    ]);

  if (!presentationsResponse.ok) {
    throw new Error(
      `Failed to fetch presentations: ${presentationsResponse.status}`
    );
  }

  if (!brandsResponse.ok) {
    throw new Error(`Failed to fetch brands: ${brandsResponse.status}`);
  }

  if (!categoriesResponse.ok) {
    throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
  }

  const [presentations, brands, categories] = await Promise.all([
    presentationsResponse.json() as Promise<ProductReference[]>,
    brandsResponse.json() as Promise<ProductReference[]>,
    categoriesResponse.json() as Promise<ProductReference[]>,
  ]);

  return { presentations, brands, categories };
}
