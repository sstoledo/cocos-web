import { cn } from '@/lib/utils';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { WorkOrder } from '../types';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';

export type WorkOrderTableProps = {
  workOrders: WorkOrder[];
};

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              N° Orden
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Cliente
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Vehículo
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Estado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Total
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((workOrder) => (
            <tr
              key={workOrder.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {workOrder.orderNumber}
              </td>
              <td className="p-4 text-muted-foreground">
                {workOrder.client.name}
              </td>
              <td className="p-4 text-muted-foreground">
                {`${workOrder.vehicle.plate} · ${workOrder.vehicle.brand} ${workOrder.vehicle.model}`}
              </td>
              <td className="p-4">
                <WorkOrderStatusBadge status={workOrder.status} />
              </td>
              <td className="p-4 text-muted-foreground">
                {workOrder.totalAmount}
              </td>
              <td className="p-4 text-muted-foreground">
                {new Date(workOrder.createdAt).toLocaleDateString('es-AR')}
              </td>
              <td className="p-4">
                <Link
                  to={`/work-orders/${workOrder.id}`}
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
      {workOrders.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron órdenes de trabajo.
        </p>
      )}
    </div>
  );
}
