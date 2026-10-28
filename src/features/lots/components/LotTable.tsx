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
  style: string;
};

function getLotStatus(lot: Lot): LotStatus {
  const hasStock = lot.items.some((item) => item.remainingQuantity > 0);

  return hasStock
    ? { label: 'En stock', style: 'bg-success text-success-foreground' }
    : { label: 'Agotado', style: 'bg-destructive text-destructive-foreground' };
}

export function LotTable({ lots }: LotTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {[
                'Número de lote',
                'Proveedor',
                'Fecha de recepción',
                'Cantidad de ítems',
                'Estado / acciones',
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
            {lots.map((lot) => {
              const status = getLotStatus(lot);

              return (
                <tr
                  key={lot.id}
                  className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-3 font-medium text-foreground">
                    {lot.lotNumber}
                  </td>
                  <td className="px-3 text-foreground">{lot.supplier.name}</td>
                  <td className="px-3 text-muted-foreground">
                    {formatDate(lot.receivedAt)}
                  </td>
                  <td className="px-3 text-muted-foreground">
                    {formatItemCount(lot.items.length)}
                  </td>
                  <td className="px-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${status.style}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {lots.map((lot) => {
          const status = getLotStatus(lot);
          return (
            <article
              key={lot.id}
              data-testid="lot-mobile-card"
              className="space-y-2 rounded-lg border bg-card p-3 shadow-stat"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-body-sm font-medium text-foreground">
                  {lot.lotNumber}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${status.style}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-body-sm text-foreground">
                {lot.supplier.name}
              </p>
              <div className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
                <span>{formatDate(lot.receivedAt)}</span>
                <span>{formatItemCount(lot.items.length)}</span>
              </div>
            </article>
          );
        })}
      </div>

      {lots.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron lotes.
        </p>
      )}
    </>
  );
}
