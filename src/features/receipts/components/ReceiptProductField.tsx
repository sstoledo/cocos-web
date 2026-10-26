import {
  ProductCombobox,
  type ProductComboboxValue,
} from '@/features/products/components/ProductCombobox';
import { useProductSearch } from '@/features/products/hooks/use-product-search';
import type { Product } from '@/features/products/types';
import { useEffect, useRef, useState } from 'react';

export function getProductSuggestionQuery(description: string): string {
  return description.trim().split(/\s+/).slice(0, 3).join(' ');
}

type ReceiptProductFieldProps = {
  id: string;
  description: string;
  productId: string;
  onChange: (product: Product | null) => void;
  error?: string;
};

export function ReceiptProductField({
  id,
  description,
  productId,
  onChange,
  error,
}: ReceiptProductFieldProps) {
  const [selected, setSelected] = useState<ProductComboboxValue | null>(null);
  const touched = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suggestionQuery = getProductSuggestionQuery(description);
  const { products } = useProductSearch(suggestionQuery, true);
  const suggestion = products[0];

  useEffect(() => {
    if (!touched.current && !productId && suggestion) {
      setSelected(suggestion);
      onChangeRef.current(suggestion);
    }
  }, [productId, suggestion]);

  return (
    <ProductCombobox
      id={id}
      value={productId ? selected : null}
      onChange={(product) => {
        touched.current = true;
        setSelected(product);
        onChange(product);
      }}
      placeholder="Buscar o confirmar sugerencia…"
      withCode
      isActive
      clearable
      error={error}
    />
  );
}
