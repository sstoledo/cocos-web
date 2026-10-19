import { AsyncCombobox } from '@/components/ui/AsyncCombobox';
import { useState } from 'react';
import { useServiceSearch } from '../hooks/use-service-search';
import type { Service } from '../types';

// Accepts partial services so edit forms can pass a summary ({id, name})
// as the selected value without fetching the full entity.
export type ServiceComboboxValue = Pick<Service, 'id' | 'name'> &
  Partial<Service>;

export type ServiceComboboxProps = {
  id?: string;
  label?: string;
  error?: string;
  value: ServiceComboboxValue | null;
  onChange: (service: Service | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
};

export function ServiceCombobox({
  id,
  label,
  error,
  value,
  onChange,
  placeholder = 'Buscar servicio…',
  disabled = false,
  clearable = false,
}: ServiceComboboxProps) {
  const [search, setSearch] = useState('');
  const { services, isLoading } = useServiceSearch(search);

  return (
    <AsyncCombobox
      id={id}
      label={label}
      error={error}
      placeholder={placeholder}
      options={services.map((service) => ({
        value: service.id,
        label: service.name,
      }))}
      value={value ? { value: value.id, label: value.name } : null}
      onValueChange={(option) =>
        onChange(
          option
            ? (services.find((service) => service.id === option.value) ?? null)
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
