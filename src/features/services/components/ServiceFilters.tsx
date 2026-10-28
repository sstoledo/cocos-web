import { Input } from '@/components/ui/Input';
import type { ServiceListFilters } from '../types';

type ServiceFiltersProps = {
  filters: ServiceListFilters;
  onChange: (filters: ServiceListFilters) => void;
};

export function ServiceFilters({ filters, onChange }: ServiceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 sm:min-w-48">
        <Input
          type="search"
          placeholder="Buscar por nombre o código..."
          value={filters.query ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              query: event.target.value || undefined,
            })
          }
          aria-label="Buscar servicios"
        />
      </div>
      <div className="sm:w-40">
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
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>
    </div>
  );
}
