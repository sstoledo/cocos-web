import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProducts } from '@/features/products/hooks/use-products';
import { useNavigate } from 'react-router';
import { CheckoutForm } from '../components/CheckoutForm';
import { useCreateSale } from '../hooks/use-create-sale';
import { getSalesErrorMessage } from '../lib/sales-error-messages';
import type { SaleFormValues } from '../schemas/sale-schema';
import type { CreateSalePayload } from '../types';

export function toCreatePayload(values: SaleFormValues): CreateSalePayload {
  return {
    // Walk-in sales omit clientId entirely (SL-F5).
    ...(values.clientId ? { clientId: values.clientId } : {}),
    paymentMethod: values.paymentMethod,
    productLines: (values.productLines ?? []).map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
    serviceLines: (values.serviceLines ?? []).map((line) => ({
      serviceId: line.serviceId,
      quantity: line.quantity,
    })),
  };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const createSale = useCreateSale();
  const { products } = useProducts({});

  function handleSubmit(values: SaleFormValues) {
    createSale.mutate(toCreatePayload(values), {
      onSuccess: (sale) => navigate(`/sales/${sale.id}`),
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Nueva venta</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Datos de la venta">
          {createSale.error && (
            <div
              className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {getSalesErrorMessage(createSale.error, { products })}
            </div>
          )}
          <CheckoutForm
            onSubmit={handleSubmit}
            isPending={createSale.isPending}
          />
        </SectionCard>
      </PageContent>
    </>
  );
}
