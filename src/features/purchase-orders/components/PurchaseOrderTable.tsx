import { cn } from '@/lib/utils';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { PurchaseOrder } from '../types';
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge';

export type PurchaseOrderTableProps = {
  purchaseOrders: PurchaseOrder[];
};

export function PurchaseOrderTable({
  purchaseOrders,
}: PurchaseOrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              N° Orden
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Proveedor
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Total estimado
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
          {purchaseOrders.map((purchaseOrder) => (
            <tr
              key={purchaseOrder.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {purchaseOrder.purchaseOrderNumber}
              </td>
              <td className="p-4 text-muted-foreground">
                {new Date(purchaseOrder.createdAt).toLocaleDateString('es-AR')}
              </td>
              <td className="p-4 text-muted-foreground">
                {purchaseOrder.supplier.name}
              </td>
              {/* Money is a decimal string in major units; rendered verbatim
                  like SalesTable does with totalAmount. */}
              <td className="p-4 text-muted-foreground">
                {purchaseOrder.estimatedTotal}
              </td>
              <td className="p-4">
                <PurchaseOrderStatusBadge status={purchaseOrder.status} />
              </td>
              <td className="p-4">
                <Link
                  to={`/purchase-orders/${purchaseOrder.id}`}
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
      {purchaseOrders.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron órdenes de compra.
        </p>
      )}
    </div>
  );
}
