import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { SupplierListFilters } from '../types';

export type SupplierFiltersProps = {
  filters: SupplierListFilters;
  onChange: (filters: SupplierListFilters) => void;
};

const isActiveOptions = [
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
];

export function SupplierFilters({ filters, onChange }: SupplierFiltersProps) {
  function handleQChange(value: string) {
    onChange({ ...filters, q: value || undefined });
  }

  function handleIsActiveChange(value: string) {
    if (value === 'all') {
      onChange({ ...filters, isActive: undefined });
    } else {
      onChange({ ...filters, isActive: value === 'true' });
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2 flex-1">
        <Label htmlFor="q">Buscar por nombre</Label>
        <Input
          id="q"
          type="search"
          placeholder="Filtrar por nombre..."
          value={filters.q ?? ''}
          onChange={(e) => handleQChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">Estado</Label>
        <Select
          id="isActive"
          options={[{ value: 'all', label: 'Todos' }, ...isActiveOptions]}
          placeholder="Todos"
          value={
            filters.isActive === true
              ? 'true'
              : filters.isActive === false
                ? 'false'
                : 'all'
          }
          onChange={(e) => handleIsActiveChange(e.target.value)}
        />
      </div>
    </div>
  );
}
