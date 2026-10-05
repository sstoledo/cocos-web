import { cn } from '@/lib/utils';
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
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

export type ServiceTableProps = {
  services: Service[];
};

export function ServiceTable({ services }: ServiceTableProps) {
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  function handleDelete(id: string) {
    if (window.confirm('¿Estás seguro de que querés eliminar este servicio?')) {
      deleteService(id);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Código
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Precio
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Duración estimada
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
          {services.map((service) => (
            <tr
              key={service.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {service.code}
              </td>
              <td className="p-4 text-foreground">{service.name}</td>
              <td className="p-4 text-foreground">
                {formatPrice(service.price)}
              </td>
              <td className="p-4 text-muted-foreground">
                {formatDuration(service.estimatedDuration)}
              </td>
              <td className="p-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    service.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/services/${service.id}`}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <IconEye className="mr-1.5 h-3.5 w-3.5" />
                    Ver
                  </Link>
                  <Link
                    to={`/services/${service.id}/edit`}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                    aria-label={`Editar ${service.name}`}
                  >
                    <IconEdit className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    disabled={isDeleting}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-destructive transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
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
      {services.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron servicios.
        </p>
      )}
    </div>
  );
}
