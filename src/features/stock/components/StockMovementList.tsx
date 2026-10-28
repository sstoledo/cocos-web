import type { StockMovement } from '../types';

export type StockMovementListProps = {
  movements: StockMovement[];
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR');
}

export function StockMovementList({ movements }: StockMovementListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {['Fecha', 'Tipo', 'Cantidad', 'Motivo', 'Lote'].map((header) => (
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
            {movements.map((movement) => (
              <tr
                key={movement.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 text-foreground">
                  {formatDate(movement.createdAt)}
                </td>
                <td className="px-3 text-foreground">{movement.type}</td>
                <td className="px-3 text-right font-mono text-foreground">
                  {movement.quantity}
                </td>
                <td className="px-3 text-muted-foreground">
                  {movement.reason ?? '—'}
                </td>
                <td className="px-3 text-muted-foreground">
                  {movement.lotItem?.lot.lotNumber ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {movements.map((movement) => (
          <article
            key={movement.id}
            data-testid="stock-movement-mobile-card"
            className="space-y-2 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-sm font-medium text-foreground">
                {movement.type}
              </span>
              <span className="font-mono text-body-sm font-semibold text-foreground">
                {movement.quantity}
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              {formatDate(movement.createdAt)}
            </p>
            <p className="text-caption text-muted-foreground">
              {movement.reason ?? '—'}
            </p>
            <p className="text-caption text-muted-foreground">
              Lote: {movement.lotItem?.lot.lotNumber ?? '—'}
            </p>
          </article>
        ))}
      </div>

      {movements.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron movimientos.
        </p>
      )}
    </>
  );
}
