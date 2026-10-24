import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClientCombobox } from '@/features/clients/components/ClientCombobox';
import { useClient } from '@/features/clients/hooks/use-client';
import type { ProformaListFilters } from '../types';

export type ProformaFiltersProps = {
  filters: ProformaListFilters;
  onChange: (filters: ProformaListFilters) => void;
};

export function ProformaFilters({ filters, onChange }: ProformaFiltersProps) {
  // Resolve the label of the active filter: the client may not be in the
  // top-20 of an empty search, so fetch it by id.
  const selectedClientQuery = useClient(filters.clientId ?? '');
  const selectedClient = selectedClientQuery.data ?? null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 sm:min-w-48">
        <Input
          type="search"
          placeholder="Buscar por número de proforma..."
          value={filters.proformaNumber ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              proformaNumber: event.target.value || undefined,
            })
          }
          aria-label="Buscar proformas"
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
            { value: 'draft', label: 'Borrador' },
            { value: 'sent', label: 'Enviada' },
            { value: 'accepted', label: 'Aceptada' },
            { value: 'rejected', label: 'Rechazada' },
            { value: 'converted', label: 'Convertida' },
          ]}
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value
                ? (event.target.value as ProformaListFilters['status'])
                : undefined,
            })
          }
        />
      </div>
    </div>
  );
}
