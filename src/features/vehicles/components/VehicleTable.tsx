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

function StatusBadge({ vehicle }: { vehicle: Vehicle }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption font-semibold',
        vehicle.isActive
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground'
      )}
    >
      {vehicle.isActive ? (
        <>
          <IconCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Activo
        </>
      ) : (
        <>
          <IconX className="h-3.5 w-3.5" aria-hidden="true" />
          Inactivo
        </>
      )}
    </span>
  );
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
        <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
          <table className="w-full caption-bottom text-body-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                {[
                  'Placa',
                  'Marca',
                  'Modelo',
                  'Año',
                  'Color',
                  'Cliente',
                  'Estado',
                  'Acciones',
                ].map((header) => (
                  <th
                    key={header}
                    className="h-11 px-3 text-caption font-semibold text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-3 font-medium text-foreground">
                    {vehicle.plate}
                  </td>
                  <td className="px-3 text-foreground">{vehicle.brand}</td>
                  <td className="px-3 text-foreground">{vehicle.model}</td>
                  <td className="px-3 text-muted-foreground">
                    {formatYear(vehicle.year)}
                  </td>
                  <td className="px-3 text-muted-foreground">
                    {vehicle.color ?? 'N/A'}
                  </td>
                  <td className="px-3 text-foreground">{vehicle.clientId}</td>
                  <td className="px-3">
                    <StatusBadge vehicle={vehicle} />
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/vehicles/${vehicle.id}/edit`}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Editar ${vehicle.plate}`}
                      >
                        <IconEdit className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(vehicle)}
                        disabled={isDeleting}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>

        <div className="space-y-3 md:hidden">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              data-testid="vehicle-mobile-card"
              className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    {vehicle.plate}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <StatusBadge vehicle={vehicle} />
              </div>
              <dl className="grid grid-cols-3 gap-2 text-caption text-muted-foreground">
                <div>
                  <dt>Año</dt>
                  <dd>{formatYear(vehicle.year)}</dd>
                </div>
                <div>
                  <dt>Color</dt>
                  <dd>{vehicle.color ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt>Cliente</dt>
                  <dd>{vehicle.clientId}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/vehicles/${vehicle.id}/edit`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Editar ${vehicle.plate}`}
                >
                  <IconEdit className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(vehicle)}
                  disabled={isDeleting}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Eliminar ${vehicle.plate}`}
                >
                  <IconTrash className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {vehicles.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No se encontraron vehículos.
          </p>
        )}

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
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
