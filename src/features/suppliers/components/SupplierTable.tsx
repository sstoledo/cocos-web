import { Button } from '@/components/ui/Button';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Supplier } from '../types';
import { SupplierStatusBadge } from './SupplierStatusBadge';

export type SupplierTableProps = {
  suppliers: Supplier[];
  canEdit: boolean;
  onDelete?: (supplier: Supplier) => void;
};

export function SupplierTable({
  suppliers,
  canEdit,
  onDelete,
}: SupplierTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {[
                'Nombre',
                'Teléfono',
                'Email',
                'Dirección',
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
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {supplier.name}
                </td>
                <td className="px-3 text-muted-foreground">
                  {supplier.phone ?? '—'}
                </td>
                <td className="px-3 text-muted-foreground">
                  {supplier.email ?? '—'}
                </td>
                <td className="max-w-xs truncate px-3 text-muted-foreground">
                  {supplier.address ?? '—'}
                </td>
                <td className="px-3">
                  <SupplierStatusBadge isActive={supplier.isActive} />
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <IconEye className="mr-1.5 h-3.5 w-3.5" />
                      Ver
                    </Link>
                    {canEdit && (
                      <>
                        <Link
                          to={`/suppliers/${supplier.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                          Editar
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete?.(supplier)}
                          aria-label={`Eliminar ${supplier.name}`}
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
        {suppliers.map((supplier) => (
          <article
            key={supplier.id}
            data-testid="supplier-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-body-sm font-medium text-foreground">
                {supplier.name}
              </p>
              <SupplierStatusBadge isActive={supplier.isActive} />
            </div>
            <dl className="space-y-1 text-caption text-muted-foreground">
              <div>
                <dt className="inline">Teléfono: </dt>
                <dd className="inline">{supplier.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="inline">Email: </dt>
                <dd className="inline">{supplier.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="inline">Dirección: </dt>
                <dd className="inline">{supplier.address ?? '—'}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/suppliers/${supplier.id}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="mr-1.5 h-3.5 w-3.5" />
                Ver
              </Link>
              {canEdit && (
                <>
                  <Link
                    to={`/suppliers/${supplier.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(supplier)}
                    aria-label={`Eliminar ${supplier.name}`}
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

      {suppliers.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron proveedores.
        </p>
      )}
    </>
  );
}
