import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Client } from '../types';

export type ClientTableProps = {
  clients: Client[];
  canEdit: boolean;
  onDelete?: (client: Client) => void;
};

export function ClientTable({ clients, canEdit, onDelete }: ClientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Identificación
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Teléfono
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Email
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">{client.name}</td>
              <td className="p-4 text-muted-foreground">
                {client.identification
                  ? `${client.identificationType ?? ''} ${client.identification}`
                  : '—'}
              </td>
              <td className="p-4 text-muted-foreground">
                {client.phone ?? '—'}
              </td>
              <td className="p-4 text-muted-foreground">
                {client.email ?? '—'}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/clients/${client.id}`}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <IconEye className="mr-1.5 h-3.5 w-3.5" />
                    Ver
                  </Link>
                  {canEdit && (
                    <>
                      <Link
                        to={`/clients/${client.id}/edit`}
                        className={cn(
                          'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <IconPencil className="mr-1.5 h-3.5 w-3.5" />
                        Editar
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete?.(client)}
                        aria-label={`Eliminar ${client.name}`}
                      >
                        <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron clientes.
        </p>
      )}
    </div>
  );
}
