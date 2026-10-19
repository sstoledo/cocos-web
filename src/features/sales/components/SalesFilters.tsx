import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClientCombobox } from '@/features/clients/components/ClientCombobox';
import { useClient } from '@/features/clients/hooks/use-client';
import type { SaleListFilters } from '../types';

export type SalesFiltersProps = {
  filters: SaleListFilters;
  onChange: (filters: SaleListFilters) => void;
};

export function SalesFilters({ filters, onChange }: SalesFiltersProps) {
  // Resolve the label of the active filter: the client may not be in the
  // top-20 of an empty search, so fetch it by id.
  const selectedClientQuery = useClient(filters.clientId ?? '');
  const selectedClient = selectedClientQuery.data ?? null;

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
        <ClientCombobox
          clearable
          ariaLabel="Cliente"
          placeholder="Todos los clientes"
          value={selectedClient}
          onChange={(client) =>
            onChange({
              ...filters,
              clientId: client?.id || undefined,
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
