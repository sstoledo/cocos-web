import { Input } from '@/components/ui/Input';
import type { LotListFilters } from '../types';

export type LotFiltersProps = {
  filters: LotListFilters;
  onChange: (filters: LotListFilters) => void;
};

export function LotFilters({ filters, onChange }: LotFiltersProps) {
  return (
    <Input
      type="search"
      placeholder="Buscar por número de lote o proveedor..."
      value={filters.q ?? ''}
      onChange={(event) =>
        onChange({ ...filters, q: event.target.value || undefined })
      }
      aria-label="Buscar lotes"
    />
  );
}
