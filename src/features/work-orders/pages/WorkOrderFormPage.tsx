import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { WorkOrderForm } from '../components/WorkOrderForm';
import { useCreateWorkOrder } from '../hooks/use-create-work-order';
import { useUpdateWorkOrder } from '../hooks/use-update-work-order';
import { useWorkOrder } from '../hooks/use-work-order';
import { getWorkOrderErrorMessage } from '../lib/work-order-error-messages';
import type { WorkOrderFormValues } from '../schemas/work-order-schema';
import type { CreateWorkOrderPayload, WorkOrder } from '../types';

export function toCreatePayload(
  values: WorkOrderFormValues
): CreateWorkOrderPayload {
  return {
    clientId: values.clientId,
    vehicleId: values.vehicleId,
    description: values.description?.trim() ? values.description : undefined,
    services: values.services,
    products: values.products,
  };
}

export function workOrderToFormValues(
  workOrder: WorkOrder
): WorkOrderFormValues {
  return {
    clientId: workOrder.clientId,
    vehicleId: workOrder.vehicleId,
    description: workOrder.description ?? '',
    services: workOrder.services.map((line) => ({
      serviceId: line.serviceId,
      quantity: line.quantity,
      unitPrice: Number(line.unitPriceSnapshot),
    })),
    products: workOrder.products.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: Number(line.unitPriceSnapshot),
    })),
  };
}

export function WorkOrderFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const {
    data: workOrder,
    isLoading: isLoadingWorkOrder,
    error: workOrderError,
  } = useWorkOrder(id ?? '');

  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();

  const isPending = createWorkOrder.isPending || updateWorkOrder.isPending;
  const mutationError = isEditMode
    ? updateWorkOrder.error
    : createWorkOrder.error;

  function handleSubmit(values: WorkOrderFormValues) {
    const payload = toCreatePayload(values);
    if (isEditMode && id) {
      // Full replacement semantics: both line arrays are sent; the api
      // layer omits a line-type key only when its array is empty.
      updateWorkOrder.mutate(
        { id, payload },
        { onSuccess: () => navigate(`/work-orders/${id}`) }
      );
    } else {
      createWorkOrder.mutate(payload, {
        onSuccess: (created) => navigate(`/work-orders/${created.id}`),
      });
    }
  }

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar orden de trabajo' : 'Nueva orden de trabajo'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Datos de la orden">
          {isEditMode && isLoadingWorkOrder ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : isEditMode && workOrderError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudieron cargar los datos. Intentá de nuevo más tarde.
            </div>
          ) : (
            <>
              {mutationError && (
                <div
                  className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  {getWorkOrderErrorMessage(mutationError)}
                </div>
              )}
              <WorkOrderForm
                key={workOrder?.id ?? 'create'}
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && workOrder
                    ? workOrderToFormValues(workOrder)
                    : undefined
                }
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
