import { Button } from '@/components/ui/Button';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Category } from '../types';

export type CategoryTableProps = {
  categories: Category[];
  canEdit: boolean;
  onDelete?: (category: Category) => void;
};

export function CategoryTable({
  categories = [],
  canEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {['Nombre', 'Categoría padre', 'Acciones'].map((header) => (
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
            {categories.map((category) => (
              <tr
                key={category.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {category.name}
                </td>
                <td className="px-3 text-muted-foreground">
                  {category.parent?.name ?? '—'}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/categories/${category.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <IconEye className="mr-1.5 h-3.5 w-3.5" />
                      Ver
                    </Link>
                    {canEdit && (
                      <>
                        <Link
                          to={`/categories/${category.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                          Editar
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete?.(category)}
                          aria-label={`Eliminar ${category.name}`}
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
        {categories.map((category) => (
          <article
            key={category.id}
            data-testid="category-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div>
              <p className="text-body-sm font-medium text-foreground">
                {category.name}
              </p>
              <p className="text-caption text-muted-foreground">
                Categoría padre: {category.parent?.name ?? '—'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/categories/${category.id}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="mr-1.5 h-3.5 w-3.5" />
                Ver
              </Link>
              {canEdit && (
                <>
                  <Link
                    to={`/categories/${category.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(category)}
                    aria-label={`Eliminar ${category.name}`}
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

      {categories.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron categorías.
        </p>
      )}
    </>
  );
}
