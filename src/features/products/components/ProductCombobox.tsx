import { AsyncCombobox } from '@/components/ui/AsyncCombobox';
import { useState } from 'react';
import { useProductSearch } from '../hooks/use-product-search';
import type { Product } from '../types';

// Accepts partial products so edit forms can pass a summary ({id, name})
// as the selected value without fetching the full entity.
export type ProductComboboxValue = Pick<Product, 'id' | 'name'> &
  Partial<Product>;

export type ProductComboboxProps = {
  id?: string;
  label?: string;
  error?: string;
  value: ProductComboboxValue | null;
  onChange: (product: Product | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  // Prefix the option label with the product code ('CODE — Name').
  withCode?: boolean;
  isActive?: boolean;
  // Product ids hidden from the options (e.g. already in a recipe).
  excludeIds?: ReadonlySet<string>;
};

export function ProductCombobox({
  id,
  label,
  error,
  value,
  onChange,
  placeholder = 'Buscar producto…',
  disabled = false,
  clearable = false,
  withCode = false,
  isActive,
  excludeIds,
}: ProductComboboxProps) {
  const [search, setSearch] = useState('');
  const { products, isLoading } = useProductSearch(search, isActive);

  const options = products
    .filter((product) => !excludeIds?.has(product.id))
    .map((product) => ({
      value: product.id,
      label: withCode ? `${product.code} — ${product.name}` : product.name,
    }));

  return (
    <AsyncCombobox
      id={id}
      label={label}
      error={error}
      placeholder={placeholder}
      options={options}
      value={
        value
          ? {
              value: value.id,
              label:
                withCode && value.code
                  ? `${value.code} — ${value.name}`
                  : value.name,
            }
          : null
      }
      onValueChange={(option) =>
        onChange(
          option
            ? (products.find((product) => product.id === option.value) ?? null)
            : null
        )
      }
      onSearchChange={setSearch}
      isLoading={isLoading}
      disabled={disabled}
      clearable={clearable}
    />
  );
}
