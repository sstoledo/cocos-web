import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { SaleListFilters } from '../types';

export type SalesFiltersProps = {
  filters: SaleListFilters;
  clients: { id: string; name: string }[];
  onChange: (filters: SaleListFilters) => void;
};

export function SalesFilters({
  filters,
  clients,
  onChange,
}: SalesFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 sm:min-w-48">
        <Input
          type="search"
          placeholder="Buscar por número de venta..."
          value={filters.saleNumber ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              saleNumber: event.target.value || undefined,
            })
          }
          aria-label="Buscar ventas"
        />
      </div>
      <div>
        <Input
          type="date"
          aria-label="Desde"
          value={filters.from ?? ''}
          onChange={(event) =>
            onChange({ ...filters, from: event.target.value || undefined })
          }
        />
      </div>
      <div>
        <Input
          type="date"
          aria-label="Hasta"
          value={filters.to ?? ''}
          onChange={(event) =>
            onChange({ ...filters, to: event.target.value || undefined })
          }
        />
      </div>
      <div className="sm:min-w-44">
        <Select
          optional
          aria-label="Cliente"
          placeholder="Todos los clientes"
          options={clients.map((client) => ({
            value: client.id,
            label: client.name,
          }))}
          value={filters.clientId ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              clientId: event.target.value || undefined,
            })
          }
        />
      </div>
      <div className="sm:min-w-40">
        <Select
          optional
          aria-label="Estado"
          placeholder="Todos los estados"
          options={[
            { value: 'completed', label: 'Completada' },
            { value: 'cancelled', label: 'Cancelada' },
          ]}
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value
                ? (event.target.value as SaleListFilters['status'])
                : undefined,
            })
          }
        />
      </div>
    </div>
  );
}
