import type { StockMovement } from '../types';

export type StockMovementListProps = {
  movements: StockMovement[];
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR');
}

export function StockMovementList({ movements }: StockMovementListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Tipo
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Cantidad
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Motivo
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Lote
            </th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr
              key={movement.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 text-foreground">
                {formatDate(movement.createdAt)}
              </td>
              <td className="p-4 text-foreground">{movement.type}</td>
              <td className="p-4 text-foreground">{movement.quantity}</td>
              <td className="p-4 text-muted-foreground">
                {movement.reason ?? '—'}
              </td>
              <td className="p-4 text-muted-foreground">
                {movement.lotItem?.lot.lotNumber ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {movements.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron movimientos.
        </p>
      )}
    </div>
  );
}
