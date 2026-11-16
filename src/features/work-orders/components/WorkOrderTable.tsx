import { DataTable } from '@/components/ui/data-table';
import { formatMoney } from '@/lib/cents';
import { IconCar, IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { WorkOrder } from '../types';
import { WorkOrderPaymentStatusBadge } from './WorkOrderPaymentStatusBadge';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';

export type WorkOrderTableProps = {
  workOrders: WorkOrder[];
};

function orderDate(workOrder: WorkOrder): string {
  return new Date(workOrder.createdAt).toLocaleDateString('es-AR');
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  return (
    <>
      <DataTable
        size="caption"
        headers={[
          { label: 'N° Orden' },
          { label: 'Cliente' },
          { label: 'Vehículo' },
          { label: 'Estado' },
          { label: 'Cobro' },
          { label: 'Total' },
          { label: 'Fecha' },
          { label: 'Acciones' },
        ]}
      >
        {workOrders.map((workOrder) => (
          <tr
            key={workOrder.id}
            className="h-[60px] border-b border-border transition-colors last:border-0 hover:bg-muted/50"
          >
            <td className="px-3 font-semibold text-foreground">
              {workOrder.orderNumber}
            </td>
            <td className="px-3 font-medium text-foreground">
              {workOrder.client.name}
            </td>
            <td className="px-3">
              <p className="font-semibold text-foreground">
                {workOrder.vehicle.plate}
              </p>
              <p className="text-xs text-muted-foreground">
                {workOrder.vehicle.brand} {workOrder.vehicle.model}
              </p>
            </td>
            <td className="px-3">
              <WorkOrderStatusBadge status={workOrder.status} />
            </td>
            <td className="px-3">
              <WorkOrderPaymentStatusBadge status={workOrder.paymentStatus} />
            </td>
            <td className="px-3 font-mono font-semibold text-foreground">
              {formatMoney(workOrder.totalAmount)}
            </td>
            <td className="px-3 text-muted-foreground">
              {orderDate(workOrder)}
            </td>
            <td className="px-3">
              <Link
                to={`/work-orders/${workOrder.id}`}
                aria-label={`Ver detalle ${workOrder.orderNumber}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="h-[18px] w-[18px]" />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>

      <div className="space-y-3 md:hidden">
        {workOrders.map((workOrder) => (
          <article
            key={workOrder.id}
            data-testid="work-order-mobile-card"
            className="space-y-2.5 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-sm font-semibold text-foreground">
                {workOrder.orderNumber}
              </span>
              <span className="text-xs text-muted-foreground">
                {orderDate(workOrder)}
              </span>
            </div>
            <p className="text-body-sm font-medium text-foreground">
              {workOrder.client.name}
            </p>
            <div className="flex items-center gap-2">
              <IconCar className="h-4 w-4 text-muted-foreground" />
              <span className="text-caption font-semibold text-foreground">
                {workOrder.vehicle.plate}
              </span>
              <span className="text-caption text-muted-foreground">
                {workOrder.vehicle.brand} {workOrder.vehicle.model}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <WorkOrderStatusBadge status={workOrder.status} />
              <span className="text-caption text-muted-foreground">
                Cobro:{' '}
                <WorkOrderPaymentStatusBadge status={workOrder.paymentStatus} />
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption text-muted-foreground">Total</span>
              <span className="font-mono text-body font-semibold text-foreground">
                {formatMoney(workOrder.totalAmount)}
              </span>
            </div>
            <Link
              to={`/work-orders/${workOrder.id}`}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-sm font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconEye className="h-4 w-4" />
              Ver detalle
            </Link>
          </article>
        ))}
      </div>

      {workOrders.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron órdenes de trabajo.
        </p>
      )}
    </>
  );
}
