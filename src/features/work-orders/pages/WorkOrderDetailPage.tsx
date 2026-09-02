import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { Link, useNavigate, useParams } from 'react-router';
import { WorkOrderStatusBadge } from '../components/WorkOrderStatusBadge';
import { useDeleteWorkOrder } from '../hooks/use-delete-work-order';
import { useWorkOrder } from '../hooks/use-work-order';
import type { WorkOrderProductLine, WorkOrderServiceLine } from '../types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workOrder, isLoading, error } = useWorkOrder(id ?? '');
  const { user } = useUser();
  const deleteWorkOrder = useDeleteWorkOrder();

  const canManage =
    user?.role?.name === 'Admin' || user?.role?.name === 'Reception';

  function handleDelete() {
    if (!id) {
      return;
    }
    if (
      window.confirm(
        '¿Estás seguro de que querés eliminar esta orden de trabajo?'
      )
    ) {
      deleteWorkOrder.mutate(id, {
        onSuccess: () => navigate('/work-orders'),
      });
    }
  }

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando orden…
      </output>
    );
  }

  if (error?.message.includes('404')) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>La orden no existe o fue eliminada.</p>
          <Link to="/work-orders" className="text-primary underline">
            Volver a órdenes de trabajo
          </Link>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="p-6">
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          No se pudieron cargar los datos. Intentá de nuevo más tarde.
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Orden {workOrder.orderNumber}</PageTitle>
        <WorkOrderStatusBadge status={workOrder.status} />
        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={`/work-orders/${workOrder.id}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Editar
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={deleteWorkOrder.isPending}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              {deleteWorkOrder.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </div>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Información general">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Cliente</dt>
              <dd className="text-foreground">{workOrder.client.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Vehículo</dt>
              <dd className="text-foreground">
                {workOrder.vehicle.plate} · {workOrder.vehicle.brand}{' '}
                {workOrder.vehicle.model}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Descripción</dt>
              <dd className="text-foreground">
                {workOrder.description ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Empleado</dt>
              <dd className="text-foreground">
                {workOrder.employee?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Sucursal</dt>
              <dd className="text-foreground">
                {workOrder.branch?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Creada</dt>
              <dd className="text-foreground">
                {formatDate(workOrder.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Actualizada</dt>
              <dd className="text-foreground">
                {formatDate(workOrder.updatedAt)}
              </dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Servicios">
          {workOrder.services.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay servicios cargados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Servicio</th>
                    <th className="px-3 py-2 font-medium">Cantidad</th>
                    <th className="px-3 py-2 font-medium">Precio unitario</th>
                    <th className="px-3 py-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrder.services.map((line: WorkOrderServiceLine) => (
                    <tr key={line.id} className="border-b border-border">
                      <td className="px-3 py-2">{line.service.name}</td>
                      <td className="px-3 py-2">{line.quantity}</td>
                      <td className="px-3 py-2">{line.unitPriceSnapshot}</td>
                      <td className="px-3 py-2">{line.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
        <SectionCard title="Productos">
          {workOrder.products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay productos cargados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 font-medium">Cantidad</th>
                    <th className="px-3 py-2 font-medium">Precio unitario</th>
                    <th className="px-3 py-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrder.products.map((line: WorkOrderProductLine) => (
                    <tr key={line.id} className="border-b border-border">
                      <td className="px-3 py-2">{line.product.name}</td>
                      <td className="px-3 py-2">{line.quantity}</td>
                      <td className="px-3 py-2">{line.unitPriceSnapshot}</td>
                      <td className="px-3 py-2">{line.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
        <p className="text-right text-lg font-semibold">
          {`Total: ${workOrder.totalAmount}`}
        </p>
      </PageContent>
    </>
  );
}
