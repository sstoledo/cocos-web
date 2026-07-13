import { Input } from '@/components/ui/Input';
import type { ClientListFilters } from '../types';

export type ClientFiltersProps = {
  filters: ClientListFilters;
  onChange: (filters: ClientListFilters) => void;
};

export function ClientFilters({ filters, onChange }: ClientFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Buscar por nombre o identificación..."
          value={filters.query ?? ''}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value || undefined })
          }
          aria-label="Buscar clientes"
        />
      </div>
    </div>
  );
}
