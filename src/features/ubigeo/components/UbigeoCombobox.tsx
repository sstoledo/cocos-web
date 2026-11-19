import { AsyncCombobox } from '@/components/ui/AsyncCombobox';
import { useState } from 'react';
import { useUbigeo } from '../hooks/use-ubigeo';
import { useUbigeoSearch } from '../hooks/use-ubigeo-search';
import { formatUbigeoLabel } from '../lib/format-ubigeo-label';
import type { Ubigeo } from '../types';

export type UbigeoComboboxProps = {
  id?: string;
  label?: string;
  error?: string;
  /** The stored 6-digit INEI code, or null when nothing is selected. */
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * Searchable INEI ubigeo selector. It works with the code, not the entry,
 * because the code is the only thing the form stores; the label is resolved
 * from the catalog so it can never contradict the code.
 */
export function UbigeoCombobox({
  id,
  label,
  error,
  value,
  onChange,
  placeholder = 'Buscar distrito…',
  disabled = false,
}: UbigeoComboboxProps) {
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Ubigeo | null>(null);
  const { ubigeos, isLoading } = useUbigeoSearch(search);
  const resolved = useUbigeo(value);

  // Prefer the entry the user just picked so the label does not flicker while
  // the code resolves; fall back to the catalog lookup for a stored code.
  const selected = picked && picked.code === value ? picked : resolved;

  return (
    <AsyncCombobox
      id={id}
      label={label}
      error={error}
      placeholder={placeholder}
      options={ubigeos.map((ubigeo) => ({
        value: ubigeo.code,
        label: formatUbigeoLabel(ubigeo),
      }))}
      value={
        selected
          ? { value: selected.code, label: formatUbigeoLabel(selected) }
          : null
      }
      onValueChange={(option) => {
        const next = ubigeos.find((entry) => entry.code === option?.value);
        setPicked(next ?? null);
        onChange(option?.value ?? null);
      }}
      onSearchChange={setSearch}
      isLoading={isLoading}
      disabled={disabled}
      clearable
    />
  );
}
