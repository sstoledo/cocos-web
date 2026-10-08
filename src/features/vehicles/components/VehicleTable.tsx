import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import { IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useDeleteVehicle } from '../hooks/use-delete-vehicle';
import type { PaginationMeta, Vehicle } from '../types';

function formatYear(year: number | null | undefined): string {
  if (year === null || year === undefined) {
    return 'N/A';
  }
  return year.toString();
}

export type VehicleTableProps = {
  vehicles: Vehicle[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function VehicleTable({
  vehicles,
  meta,
  onPageChange,
}: VehicleTableProps) {
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();
  const [vehicleToDelete, setVehicleToDelete] = useState<{
    id: string;
    plate: string;
  } | null>(null);

  function handleDelete(vehicle: { id: string; plate: string }) {
    setVehicleToDelete(vehicle);
  }

  function handleConfirmDelete() {
    if (!vehicleToDelete) {
      return;
    }
    deleteVehicle(vehicleToDelete.id);
  }

  return (
    <>
      <div className="space-y-4">
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
                <th className="h-12 px-4 font-medium text-muted-foreground">
                  Año
                </th>
                <th className="h-12 px-4 font-medium text-muted-foreground">
                  Color
                </th>
                <th className="h-12 px-4 font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="h-12 px-4 font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="h-12 px-4 font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 font-medium text-foreground">
                    {vehicle.plate}
                  </td>
                  <td className="p-4 text-foreground">{vehicle.brand}</td>
                  <td className="p-4 text-foreground">{vehicle.model}</td>
                  <td className="p-4 text-muted-foreground">
                    {formatYear(vehicle.year)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {vehicle.color ?? 'N/A'}
                  </td>
                  <td className="p-4 text-foreground">{vehicle.clientId}</td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        vehicle.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}
                    >
                      {vehicle.isActive ? (
                        <>
                          <IconCheck
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Activo
                        </>
                      ) : (
                        <>
                          <IconX className="h-3.5 w-3.5" aria-hidden="true" />
                          Inactivo
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/vehicles/${vehicle.id}/edit`}
                        className={cn(
                          'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                        aria-label={`Editar ${vehicle.plate}`}
                      >
                        <IconEdit className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(vehicle)}
                        disabled={isDeleting}
                        className={cn(
                          'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-destructive transition-colors',
                          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                        aria-label={`Eliminar ${vehicle.plate}`}
                      >
                        <IconTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No se encontraron vehículos.
            </p>
          )}
        </div>

        {vehicles.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Página {meta.page} de {meta.totalPages} — {meta.total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={vehicleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setVehicleToDelete(null);
          }
        }}
        title="Eliminar vehículo"
        description="¿Estás seguro de que querés eliminar este vehículo?"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
