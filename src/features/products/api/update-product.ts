import type { Product, ProductFormValues } from '../types';

export async function updateProduct(
  id: string,
  values: ProductFormValues,
  image?: File
): Promise<Product> {
  const formData = new FormData();

  formData.set('code', values.code);
  formData.set('name', values.name);
  formData.set('price', values.price.toString());
  formData.set('presentationId', values.presentationId);
  formData.set('brandId', values.brandId);
  formData.set('categoryId', values.categoryId);
  formData.set('isActive', values.isActive.toString());

  if (values.description) {
    formData.set('description', values.description);
  }

  if (values.barcode) {
    formData.set('barcode', values.barcode);
  }

  if (values.taxRate !== undefined) {
    formData.set('taxRate', values.taxRate.toString());
  }

  if (values.notes) {
    formData.set('notes', values.notes);
  }

  if (image) {
    formData.append('image', image);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/products/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update product: ${response.status}`);
  }

  return (await response.json()) as Product;
}
