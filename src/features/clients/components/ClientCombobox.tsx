import { AsyncCombobox } from '@/components/ui/AsyncCombobox';
import { useState } from 'react';
import { useClientSearch } from '../hooks/use-client-search';
import type { Client } from '../types';

// Accepts partial clients so edit forms can pass a summary ({id, name})
// as the selected value without fetching the full entity.
export type ClientComboboxValue = Pick<Client, 'id' | 'name'> & Partial<Client>;

export type ClientComboboxProps = {
  id?: string;
  label?: string;
  ariaLabel?: string;
  error?: string;
  value: ClientComboboxValue | null;
  onChange: (client: Client | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
};

export function ClientCombobox({
  id,
  label,
  ariaLabel,
  error,
  value,
  onChange,
  placeholder = 'Buscar cliente…',
  disabled = false,
  clearable = false,
}: ClientComboboxProps) {
  const [search, setSearch] = useState('');
  const { clients, isLoading } = useClientSearch(search);

  return (
    <AsyncCombobox
      id={id}
      label={label}
      ariaLabel={ariaLabel}
      error={error}
      placeholder={placeholder}
      options={clients.map((client) => ({
        value: client.id,
        label: client.name,
      }))}
      value={value ? { value: value.id, label: value.name } : null}
      onValueChange={(option) =>
        onChange(
          option
            ? (clients.find((client) => client.id === option.value) ?? null)
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
