import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import type { CategoryListFilters } from '../types';

export type CategoryFiltersProps = {
  filters: CategoryListFilters;
  onChange: (filters: CategoryListFilters) => void;
};

export function CategoryFilters({ filters, onChange }: CategoryFiltersProps) {
  function handleQChange(value: string) {
    onChange({ ...filters, q: value || undefined });
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
    </div>
  );
}
