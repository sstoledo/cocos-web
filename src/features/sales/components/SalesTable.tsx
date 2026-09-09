import { cn } from '@/lib/utils';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Sale } from '../types';
import { PaymentMethodBadge } from './PaymentMethodBadge';
import { SaleStatusBadge } from './SaleStatusBadge';

export type SalesTableProps = {
  sales: Sale[];
};

// Walk-in sales have no client; detail page copy applies here too (SL-F3).
function clientName(sale: Sale): string {
  return sale.client?.name ?? 'Cliente ocasional';
}

export function SalesTable({ sales }: SalesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              N° Venta
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Cliente
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Método de pago
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Total
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Estado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr
              key={sale.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {sale.saleNumber}
              </td>
              <td className="p-4 text-muted-foreground">
                {new Date(sale.createdAt).toLocaleDateString('es-AR')}
              </td>
              <td className="p-4 text-muted-foreground">{clientName(sale)}</td>
              <td className="p-4">
                <PaymentMethodBadge method={sale.paymentMethod} />
              </td>
              <td className="p-4 text-muted-foreground">{sale.totalAmount}</td>
              <td className="p-4">
                <SaleStatusBadge status={sale.status} />
              </td>
              <td className="p-4">
                <Link
                  to={`/sales/${sale.id}`}
                  className={cn(
                    'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                    'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <IconEye className="mr-1.5 h-3.5 w-3.5" />
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sales.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron ventas.
        </p>
      )}
    </div>
  );
}
