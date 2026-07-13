import { Input } from '@/components/ui/Input';
import type { ProductListFilters } from '../types';

export type ProductFiltersProps = {
  filters: ProductListFilters;
  onChange: (filters: ProductListFilters) => void;
};

type StatusOption = {
  label: string;
  value: string;
};

const statusOptions: StatusOption[] = [
  { label: 'Todos', value: '' },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
];

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Buscar por nombre o código..."
          value={filters.q ?? ''}
          onChange={(event) =>
            onChange({ ...filters, q: event.target.value || undefined })
          }
          aria-label="Buscar productos"
        />
      </div>
      <div className="sm:w-48">
        <select
          value={
            filters.isActive === undefined ? '' : filters.isActive.toString()
          }
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              isActive: value === '' ? undefined : value === 'true',
            });
          }}
          className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filtrar por estado"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
