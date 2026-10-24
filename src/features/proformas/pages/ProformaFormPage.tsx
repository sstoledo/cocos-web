import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProducts } from '@/features/products/hooks/use-products';
import { useNavigate } from 'react-router';
import { ProformaForm } from '../components/ProformaForm';
import { useCreateProforma } from '../hooks/use-create-proforma';
import { getProformaErrorMessage } from '../lib/proforma-error-messages';
import type { ProformaFormValues } from '../schemas/proforma-schema';
import type { CreateProformaPayload } from '../types';

export function toCreateProformaPayload(
  values: ProformaFormValues
): CreateProformaPayload {
  return {
    // Walk-in proformas omit clientId entirely (SL-F5).
    ...(values.clientId ? { clientId: values.clientId } : {}),
    ...(values.branchId ? { branchId: values.branchId } : {}),
    ...(values.employeeId ? { employeeId: values.employeeId } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
    productLines: values.productLines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
  };
}

export function ProformaFormPage() {
  const navigate = useNavigate();
  const createProforma = useCreateProforma();
  const { products } = useProducts({});

  function handleSubmit(values: ProformaFormValues) {
    createProforma.mutate(toCreateProformaPayload(values), {
      onSuccess: (proforma) => navigate(`/proformas/${proforma.id}`),
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Nueva proforma</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Datos de la proforma">
          {createProforma.error && (
            <div
              className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {getProformaErrorMessage(createProforma.error, { products })}
            </div>
          )}
          <ProformaForm
            onSubmit={handleSubmit}
            isPending={createProforma.isPending}
          />
        </SectionCard>
      </PageContent>
    </>
  );
}
