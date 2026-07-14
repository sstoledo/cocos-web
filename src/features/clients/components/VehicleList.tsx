import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
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
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Placa
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Marca
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Modelo
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">Año</th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Color
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Notas
            </th>
            {canEdit && (
              <th className="h-12 px-4 font-medium text-muted-foreground">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {activeVehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {vehicle.plate}
              </td>
              <td className="p-4 text-muted-foreground">{vehicle.brand}</td>
              <td className="p-4 text-muted-foreground">{vehicle.model}</td>
              <td className="p-4 text-muted-foreground">
                {vehicle.year ?? '—'}
              </td>
              <td className="p-4 text-muted-foreground">
                {vehicle.color ?? '—'}
              </td>
              <td
                className={cn('p-4 text-muted-foreground', 'max-w-xs truncate')}
              >
                {vehicle.notes ?? '—'}
              </td>
              {canEdit && (
                <td className="p-4">
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
            </tr>
          ))}
        </tbody>
      </table>
      {activeVehicles.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron vehículos.
        </p>
      )}
    </div>
  );
}
