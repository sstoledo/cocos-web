import { Input } from '@/components/ui/Input';
import type { WorkOrderListFilters } from '../types';

export type WorkOrderFiltersProps = {
  filters: WorkOrderListFilters;
  onChange: (filters: WorkOrderListFilters) => void;
};

export function WorkOrderFilters({ filters, onChange }: WorkOrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Buscar por número de orden..."
          value={filters.query ?? ''}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value || undefined })
          }
          aria-label="Buscar órdenes"
        />
      </div>
    </div>
  );
}
