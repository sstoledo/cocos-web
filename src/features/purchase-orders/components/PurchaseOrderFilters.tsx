import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { PurchaseOrderListFilters, PurchaseOrderStatus } from '../types';
import { PURCHASE_ORDER_STATUS_LABELS } from './PurchaseOrderStatusBadge';

export type PurchaseOrderFiltersProps = {
  filters: PurchaseOrderListFilters;
  suppliers: { id: string; name: string }[];
  onChange: (filters: PurchaseOrderListFilters) => void;
};

const STATUS_OPTIONS = (
  Object.entries(PURCHASE_ORDER_STATUS_LABELS) as [
    PurchaseOrderStatus,
    string,
  ][]
).map(([value, label]) => ({ value, label }));

export function PurchaseOrderFilters({
  filters,
  suppliers,
  onChange,
}: PurchaseOrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 sm:min-w-48">
        <Input
          type="search"
          placeholder="Buscar por número de orden..."
          value={filters.purchaseOrderNumber ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              purchaseOrderNumber: event.target.value || undefined,
            })
          }
          aria-label="Buscar órdenes de compra"
        />
      </div>
      <div className="sm:min-w-44">
        <Select
          optional
          aria-label="Proveedor"
          placeholder="Todos los proveedores"
          options={suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))}
          value={filters.supplierId ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              supplierId: event.target.value || undefined,
            })
          }
        />
      </div>
      <div className="sm:min-w-44">
        <Select
          optional
          aria-label="Estado"
          placeholder="Todos los estados"
          options={STATUS_OPTIONS}
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value
                ? (event.target.value as PurchaseOrderStatus)
                : undefined,
            })
          }
        />
      </div>
    </div>
  );
}
