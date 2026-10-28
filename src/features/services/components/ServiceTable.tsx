import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useDeleteService } from '../hooks/use-delete-service';
import type { Service } from '../types';

function formatPrice(price: string): string {
  const num = Number(price);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDuration(duration: number | null | undefined): string {
  if (duration === null || duration === undefined) {
    return 'N/A';
  }
  if (duration < 60) {
    return `${duration} min`;
  }
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

function StatusBadge({ service }: { service: Service }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption font-semibold',
        service.isActive
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground'
      )}
    >
      {service.isActive ? (
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

export type ServiceTableProps = {
  services: Service[];
};

export function ServiceTable({ services }: ServiceTableProps) {
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function handleDelete(service: { id: string; name: string }) {
    setServiceToDelete(service);
  }

  function handleConfirmDelete() {
    if (!serviceToDelete) {
      return;
    }
    deleteService(serviceToDelete.id);
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {[
                'Código',
                'Nombre',
                'Precio',
                'Duración estimada',
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
            {services.map((service) => (
              <tr
                key={service.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {service.code}
                </td>
                <td className="px-3 text-foreground">{service.name}</td>
                <td className="px-3 text-right font-mono text-foreground">
                  {formatPrice(service.price)}
                </td>
                <td className="px-3 text-muted-foreground">
                  {formatDuration(service.estimatedDuration)}
                </td>
                <td className="px-3">
                  <StatusBadge service={service} />
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <IconEye className="mr-1.5 h-3.5 w-3.5" />
                      Ver
                    </Link>
                    <Link
                      to={`/services/${service.id}/edit`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Editar ${service.name}`}
                    >
                      <IconEdit className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(service)}
                      disabled={isDeleting}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Eliminar ${service.name}`}
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
        {services.map((service) => (
          <article
            key={service.id}
            data-testid="service-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption text-muted-foreground">
                  {service.code}
                </p>
                <p className="text-body-sm font-medium text-foreground">
                  {service.name}
                </p>
              </div>
              <StatusBadge service={service} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption text-muted-foreground">
                {formatDuration(service.estimatedDuration)}
              </span>
              <span className="font-mono text-body-sm font-semibold text-foreground">
                {formatPrice(service.price)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/services/${service.id}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="mr-1.5 h-3.5 w-3.5" />
                Ver
              </Link>
              <Link
                to={`/services/${service.id}/edit`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Editar ${service.name}`}
              >
                <IconEdit className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(service)}
                disabled={isDeleting}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Eliminar ${service.name}`}
              >
                <IconTrash className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {services.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron servicios.
        </p>
      )}

      <ConfirmDialog
        open={serviceToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setServiceToDelete(null);
          }
        }}
        title="Eliminar servicio"
        description="¿Estás seguro de que querés eliminar este servicio?"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
