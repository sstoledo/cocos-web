import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { PurchaseOrder } from '../types';
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge';

export type PurchaseOrderTableProps = {
  purchaseOrders: PurchaseOrder[];
};

const HEADERS = [
  'N° Orden',
  'Fecha',
  'Proveedor',
  'Total estimado',
  'Estado',
  'Acciones',
];

function orderDate(purchaseOrder: PurchaseOrder): string {
  return new Date(purchaseOrder.createdAt).toLocaleDateString('es-AR');
}

export function PurchaseOrderTable({
  purchaseOrders,
}: PurchaseOrderTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {HEADERS.map((header) => (
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
            {purchaseOrders.map((purchaseOrder) => (
              <tr
                key={purchaseOrder.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {purchaseOrder.purchaseOrderNumber}
                </td>
                <td className="px-3 text-muted-foreground">
                  {orderDate(purchaseOrder)}
                </td>
                <td className="px-3 text-foreground">
                  {purchaseOrder.supplier.name}
                </td>
                {/* Money is a decimal string in major units; rendered verbatim
                    like SalesTable does with totalAmount. */}
                <td className="px-3 text-right font-mono font-medium text-foreground">
                  {purchaseOrder.estimatedTotal}
                </td>
                <td className="px-3">
                  <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                </td>
                <td className="px-3">
                  <Link
                    to={`/purchase-orders/${purchaseOrder.id}`}
                    aria-label={`Ver orden ${purchaseOrder.purchaseOrderNumber}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <IconEye className="h-[18px] w-[18px]" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {purchaseOrders.map((purchaseOrder) => (
          <Link
            key={purchaseOrder.id}
            to={`/purchase-orders/${purchaseOrder.id}`}
            aria-label={`Ver orden ${purchaseOrder.purchaseOrderNumber}`}
            data-testid="purchase-order-mobile-card"
            className="block space-y-2 rounded-lg border bg-card p-3 shadow-stat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption font-semibold text-foreground">
                {purchaseOrder.purchaseOrderNumber}
              </span>
              <div className="flex items-center gap-1">
                <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                <IconEye className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-sm text-foreground">
                {purchaseOrder.supplier.name}
              </span>
              <span className="text-caption text-muted-foreground">
                {orderDate(purchaseOrder)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption text-muted-foreground">
                Total estimado
              </span>
              <span className="font-mono text-body font-semibold text-foreground">
                {purchaseOrder.estimatedTotal}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {purchaseOrders.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron órdenes de compra.
        </p>
      )}
    </>
  );
}
