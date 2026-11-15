import { Button } from '@/components/ui/Button';
import { DataTable, DataTableRow } from '@/components/ui/data-table';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { Vehicle } from '../types';

export type VehicleListProps = {
  vehicles: Vehicle[];
  canEdit?: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

export function VehicleList({
  vehicles,
  canEdit = false,
  onEdit,
  onDelete,
}: VehicleListProps) {
  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);

  return (
    <>
      <DataTable
        headers={[
          { label: 'Placa' },
          { label: 'Marca' },
          { label: 'Modelo' },
          { label: 'Año' },
          { label: 'Color' },
          { label: 'Notas' },
        ]}
      >
        {activeVehicles.map((vehicle) => (
          <DataTableRow key={vehicle.id}>
            <td className="px-3 font-medium text-foreground">
              {vehicle.plate}
            </td>
            <td className="px-3 text-muted-foreground">{vehicle.brand}</td>
            <td className="px-3 text-muted-foreground">{vehicle.model}</td>
            <td className="px-3 text-muted-foreground">
              {vehicle.year ?? '—'}
            </td>
            <td className="px-3 text-muted-foreground">
              {vehicle.color ?? '—'}
            </td>
            <td className="max-w-xs truncate px-3 text-muted-foreground">
              {vehicle.notes ?? '—'}
            </td>
            {canEdit && (
              <td className="px-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(vehicle)}
                    aria-label={`Editar ${vehicle.plate}`}
                  >
                    <IconPencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(vehicle)}
                    aria-label={`Eliminar ${vehicle.plate}`}
                  >
                    <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </div>
              </td>
            )}
          </DataTableRow>
        ))}
      </DataTable>

      <div className="space-y-3 md:hidden">
        {activeVehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            data-testid="vehicle-list-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-sm font-medium text-foreground">
                {vehicle.plate}
              </span>
              <span className="text-caption text-muted-foreground">
                {vehicle.year ?? '—'}
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              {vehicle.brand} {vehicle.model} · {vehicle.color ?? '—'}
            </p>
            <p className="text-caption text-muted-foreground">
              {vehicle.notes ?? '—'}
            </p>
            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(vehicle)}
                  aria-label={`Editar ${vehicle.plate}`}
                >
                  <IconPencil className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(vehicle)}
                  aria-label={`Eliminar ${vehicle.plate}`}
                >
                  <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      {activeVehicles.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron vehículos.
        </p>
      )}
    </>
  );
}
