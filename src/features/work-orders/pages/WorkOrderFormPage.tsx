import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate } from 'react-router';
import { WorkOrderForm } from '../components/WorkOrderForm';
import { useCreateWorkOrder } from '../hooks/use-create-work-order';
import { getWorkOrderErrorMessage } from '../lib/work-order-error-messages';
import type { WorkOrderFormValues } from '../schemas/work-order-schema';
import type { CreateWorkOrderPayload } from '../types';

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

export function WorkOrderFormPage() {
  const navigate = useNavigate();
  const { mutate: createWorkOrder, isPending, error } = useCreateWorkOrder();

  function handleSubmit(values: WorkOrderFormValues) {
    createWorkOrder(toCreatePayload(values), {
      onSuccess: (workOrder) => navigate(`/work-orders/${workOrder.id}`),
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Nueva orden de trabajo</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Datos de la orden">
          {error && (
            <div
              className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {getWorkOrderErrorMessage(error)}
            </div>
          )}
          <WorkOrderForm onSubmit={handleSubmit} isPending={isPending} />
        </SectionCard>
      </PageContent>
    </>
  );
}
