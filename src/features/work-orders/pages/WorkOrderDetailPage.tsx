import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { formatCents, toCents } from '@/lib/cents';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { WorkOrderConsumptionsSection } from '../components/WorkOrderConsumptionsSection';
import { WorkOrderPaymentStatusBadge } from '../components/WorkOrderPaymentStatusBadge';
import { WorkOrderPaymentsSection } from '../components/WorkOrderPaymentsSection';
import { WorkOrderStatusActions } from '../components/WorkOrderStatusActions';
import { WorkOrderStatusBadge } from '../components/WorkOrderStatusBadge';
import { useDeleteWorkOrder } from '../hooks/use-delete-work-order';
import { useWorkOrder } from '../hooks/use-work-order';
import type { WorkOrderServiceLine } from '../types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workOrder, isLoading, error } = useWorkOrder(id ?? '');
  const { user } = useUser();
  const deleteWorkOrder = useDeleteWorkOrder();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canManage =
    user?.role?.name === 'Admin' || user?.role?.name === 'Reception';

  const role = user?.role?.name;
  const canRegisterConsumption =
    (workOrder?.status === 'pending' || workOrder?.status === 'in_progress') &&
    (role === 'Admin' ||
      role === 'Reception' ||
      role === 'Warehouse' ||
      (role === 'Mechanic' && workOrder?.employee?.id === user?.employeeId));
  const remainingAmount = workOrder
    ? formatCents(
        toCents(workOrder.totalAmount) - toCents(workOrder.paidAmount)
      )
    : '0.00';

  function handleConfirmDelete() {
    if (!id) {
      return;
    }
    deleteWorkOrder.mutate(id, {
      onSuccess: () => navigate('/work-orders'),
    });
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
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/work-orders"
            aria-label="Volver a órdenes de trabajo"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Link>
          <PageTitle className="text-h4 lg:text-h2">
            Orden {workOrder.orderNumber}
          </PageTitle>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <WorkOrderStatusActions
            orderId={workOrder.id}
            status={workOrder.status}
            className="w-full flex-col sm:w-auto sm:flex-row"
          />
          {canManage && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to={`/work-orders/${workOrder.id}/edit`}
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
              >
                Editar
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(true)}
                disabled={deleteWorkOrder.isPending}
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 sm:w-auto"
              >
                {deleteWorkOrder.isPending ? 'Eliminando…' : 'Eliminar'}
              </Button>
              <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Eliminar orden de trabajo"
                description="¿Estás seguro de que querés eliminar esta orden de trabajo?"
                onConfirm={handleConfirmDelete}
                variant="danger"
              />
            </div>
          )}
        </div>
      </PageHeader>
      <PageContent>
        <SectionCard
          title="Información de la orden"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPaymentStatusBadge status={workOrder.paymentStatus} />
            </div>
          }
        >
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Cliente
              </dt>
              <dd className="text-body-sm font-medium text-foreground">
                {workOrder.client.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Vehículo
              </dt>
              <dd className="text-body-sm font-medium text-foreground">
                {workOrder.vehicle.plate} · {workOrder.vehicle.brand}{' '}
                {workOrder.vehicle.model}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Empleado asignado
              </dt>
              <dd className="text-body-sm font-medium text-foreground">
                {workOrder.employee?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Sucursal
              </dt>
              <dd className="text-body-sm font-medium text-foreground">
                {workOrder.branch?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Fecha de ingreso
              </dt>
              <dd className="text-body-sm font-medium text-foreground">
                {formatDate(workOrder.createdAt)}
              </dd>
            </div>
          </dl>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Descripción
              </dt>
              <dd className="text-body-sm text-foreground">
                {workOrder.description ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Actualizada
              </dt>
              <dd className="text-body-sm text-foreground">
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
            <div className="space-y-4">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-caption">
                  <thead className="bg-muted">
                    <tr className="text-left font-semibold text-muted-foreground">
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Servicio</th>
                      <th className="px-3 py-2 text-right">Cant.</th>
                      <th className="px-3 py-2 text-right">Precio unit.</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrder.services.map((line: WorkOrderServiceLine) => (
                      <tr
                        key={line.id}
                        className="h-12 border-b border-border last:border-0"
                      >
                        <td className="px-3 text-muted-foreground">
                          {line.service.code}
                        </td>
                        <td className="px-3 font-medium text-foreground">
                          {line.service.name}
                        </td>
                        <td className="px-3 text-right font-mono">
                          {line.quantity}
                        </td>
                        <td className="px-3 text-right font-mono">
                          {line.unitPriceSnapshot}
                        </td>
                        <td className="px-3 text-right font-mono font-semibold">
                          {line.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 md:hidden">
                {workOrder.services.map((line: WorkOrderServiceLine) => (
                  <article
                    key={line.id}
                    data-testid="work-order-service-mobile-card"
                    className="space-y-2 rounded-lg border bg-card p-3 shadow-stat"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-caption text-muted-foreground">
                        {line.service.code}
                      </span>
                      <span className="font-mono text-body-sm font-semibold">
                        {line.subtotal}
                      </span>
                    </div>
                    <p className="text-body-sm font-medium text-foreground">
                      {line.service.name}
                    </p>
                    <div className="flex justify-between gap-3 text-caption text-muted-foreground">
                      <span>Cantidad: {line.quantity}</span>
                      <span>Precio unitario: {line.unitPriceSnapshot}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-caption text-muted-foreground">
                  {workOrder.services.length} servicio(s) registrado(s)
                </p>
                <dl className="grid gap-2 text-body-sm sm:min-w-72">
                  <div className="flex justify-between gap-4">
                    <dt className="sr-only">Total</dt>
                    <dd
                      data-testid="work-order-total-value"
                      className="font-mono text-foreground"
                    >
                      Total: {workOrder.totalAmount}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="sr-only">Pagado</dt>
                    <dd className="font-mono text-foreground">
                      Pagado: {workOrder.paidAmount}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 font-semibold">
                    <dt className="sr-only">Saldo pendiente</dt>
                    <dd
                      data-testid="work-order-remaining-value"
                      className="font-mono"
                    >
                      Saldo pendiente: {remainingAmount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </SectionCard>
        {workOrder.services.length === 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-stat">
            <span className="text-body-sm font-semibold text-muted-foreground">
              Total:
            </span>
            <span
              data-testid="work-order-total-value"
              className="font-mono text-h3 font-semibold text-foreground"
            >
              {workOrder.totalAmount}
            </span>
          </div>
        )}
        <div
          data-testid="work-order-secondary-sections"
          className="grid gap-5 xl:grid-cols-2"
        >
          <WorkOrderPaymentsSection
            workOrder={workOrder}
            canManage={canManage}
          />
          <WorkOrderConsumptionsSection
            workOrder={workOrder}
            canRegister={canRegisterConsumption}
          />
        </div>
        <div className="flex items-start gap-2 rounded-md bg-muted p-3">
          <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-body-sm text-muted-foreground">
            Cancelar la orden requiere confirmación y no se puede deshacer.
          </p>
        </div>
      </PageContent>
    </>
  );
}
