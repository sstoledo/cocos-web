import { AsyncCombobox } from '@/components/ui/AsyncCombobox';
import { useState } from 'react';
import { useSupplierSearch } from '../hooks/use-supplier-search';
import type { Supplier } from '../types';

// Accepts partial suppliers so edit forms can pass a summary ({id, name})
// as the selected value without fetching the full entity.
export type SupplierComboboxValue = Pick<Supplier, 'id' | 'name'> &
  Partial<Supplier>;

export type SupplierComboboxProps = {
  id?: string;
  label?: string;
  error?: string;
  value: SupplierComboboxValue | null;
  onChange: (supplier: Supplier | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
};

export function SupplierCombobox({
  id,
  label,
  error,
  value,
  onChange,
  placeholder = 'Buscar proveedor…',
  disabled = false,
  clearable = false,
}: SupplierComboboxProps) {
  const [search, setSearch] = useState('');
  const { suppliers, isLoading } = useSupplierSearch(search);

  return (
    <AsyncCombobox
      id={id}
      label={label}
      error={error}
      placeholder={placeholder}
      options={suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      }))}
      value={value ? { value: value.id, label: value.name } : null}
      onValueChange={(option) =>
        onChange(
          option
            ? (suppliers.find((supplier) => supplier.id === option.value) ??
                null)
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
