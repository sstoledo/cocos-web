import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
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
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {presentations.map((presentation) => (
            <tr
              key={presentation.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {presentation.name}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/presentations/${presentation.id}`}
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
                        to={`/presentations/${presentation.id}/edit`}
                        className={cn(
                          'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
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
      {presentations.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron presentaciones.
        </p>
      )}
    </div>
  );
}
