import { Button } from '@/components/ui/Button';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Presentation } from '../types';

export type PresentationTableProps = {
  presentations: Presentation[];
  canEdit: boolean;
  onDelete?: (presentation: Presentation) => void;
};

export function PresentationTable({
  presentations = [],
  canEdit,
  onDelete,
}: PresentationTableProps) {
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
            {presentations.map((presentation) => (
              <tr
                key={presentation.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {presentation.name}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <Link
                          to={`/presentations/${presentation.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                          Editar
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete?.(presentation)}
                          aria-label={`Eliminar ${presentation.name}`}
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
        {presentations.map((presentation) => (
          <article
            key={presentation.id}
            data-testid="presentation-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <p className="text-body-sm font-medium text-foreground">
              {presentation.name}
            </p>
            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/presentations/${presentation.id}/edit`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconEdit className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(presentation)}
                  aria-label={`Eliminar ${presentation.name}`}
                >
                  <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      {presentations.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron presentaciones.
        </p>
      )}
    </>
  );
}
