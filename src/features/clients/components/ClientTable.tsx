import { Button } from '@/components/ui/Button';
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
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {[
                'Nombre',
                'Identificación',
                'Teléfono',
                'Email',
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
            {clients.map((client) => (
              <tr
                key={client.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {client.name}
                </td>
                <td className="px-3 text-muted-foreground">
                  {client.identification
                    ? `${client.identificationType ?? ''} ${client.identification}`
                    : '—'}
                </td>
                <td className="px-3 text-muted-foreground">
                  {client.phone ?? '—'}
                </td>
                <td className="px-3 text-muted-foreground">
                  {client.email ?? '—'}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/clients/${client.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <IconEye className="mr-1.5 h-3.5 w-3.5" />
                      Ver
                    </Link>
                    {canEdit && (
                      <>
                        <Link
                          to={`/clients/${client.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      </div>

      <div className="space-y-3 md:hidden">
        {clients.map((client) => (
          <article
            key={client.id}
            data-testid="client-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <p className="text-body-sm font-medium text-foreground">
              {client.name}
            </p>
            <dl className="space-y-1 text-caption text-muted-foreground">
              <div>
                <dt className="inline">Identificación: </dt>
                <dd className="inline">
                  {client.identification
                    ? `${client.identificationType ?? ''} ${client.identification}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="inline">Teléfono: </dt>
                <dd className="inline">{client.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="inline">Email: </dt>
                <dd className="inline">{client.email ?? '—'}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/clients/${client.id}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="mr-1.5 h-3.5 w-3.5" />
                Ver
              </Link>
              {canEdit && (
                <>
                  <Link
                    to={`/clients/${client.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          </article>
        ))}
      </div>

      {clients.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron clientes.
        </p>
      )}
    </>
  );
}
