import { Button } from '@/components/ui/Button';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Brand } from '../types';

export type BrandTableProps = {
  brands: Brand[];
  canEdit: boolean;
  onDelete?: (brand: Brand) => void;
};

export function BrandTable({
  brands = [],
  canEdit,
  onDelete,
}: BrandTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              <th className="h-11 px-3 text-caption font-semibold text-muted-foreground">
                Nombre
              </th>
              <th className="h-11 px-3 text-caption font-semibold text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {brand.name}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/brands/${brand.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <IconEye className="mr-1.5 h-3.5 w-3.5" />
                      Ver
                    </Link>
                    {canEdit && (
                      <>
                        <Link
                          to={`/brands/${brand.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                          Editar
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete?.(brand)}
                          aria-label={`Eliminar ${brand.name}`}
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
        {brands.map((brand) => (
          <article
            key={brand.id}
            data-testid="brand-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <p className="text-body-sm font-medium text-foreground">
              {brand.name}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/brands/${brand.id}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="mr-1.5 h-3.5 w-3.5" />
                Ver
              </Link>
              {canEdit && (
                <>
                  <Link
                    to={`/brands/${brand.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(brand)}
                    aria-label={`Eliminar ${brand.name}`}
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

      {brands.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron marcas.
        </p>
      )}
    </>
  );
}
