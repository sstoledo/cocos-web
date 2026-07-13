import { cn } from '@/lib/utils';
import type { Lot } from '../types';

export type LotTableProps = {
  lots: Lot[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-AR');
}

function formatItemCount(count: number): string {
  return count === 1 ? '1 producto' : `${count} productos`;
}

type LotStatus = {
  label: string;
  variant: 'success' | 'danger';
};

function getLotStatus(lot: Lot): LotStatus {
  const hasStock = lot.items.some((item) => item.remainingQuantity > 0);

  return hasStock
    ? { label: 'En stock', variant: 'success' }
    : { label: 'Agotado', variant: 'danger' };
}

export function LotTable({ lots }: LotTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Número de lote
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Proveedor
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha de recepción
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Cantidad de ítems
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Estado / acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => {
            const status = getLotStatus(lot);

            return (
              <tr
                key={lot.id}
                className="border-b border-border transition-colors hover:bg-muted/50"
              >
                <td className="p-4 font-medium text-foreground">
                  {lot.lotNumber}
                </td>
                <td className="p-4 text-foreground">{lot.supplier.name}</td>
                <td className="p-4 text-muted-foreground">
                  {formatDate(lot.receivedAt)}
                </td>
                <td className="p-4 text-muted-foreground">
                  {formatItemCount(lot.items.length)}
                </td>
                <td className="p-4">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      status.variant === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {lots.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron lotes.
        </p>
      )}
    </div>
  );
}
