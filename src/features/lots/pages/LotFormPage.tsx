import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProducts } from '@/features/products/hooks/use-products';
import { useNavigate } from 'react-router';
import { LotForm } from '../components/LotForm';
import { useCreateLot } from '../hooks/use-create-lot';
import { useSuppliers } from '../hooks/use-suppliers';
import type { LotFormValues } from '../types';

export function LotFormPage() {
  const navigate = useNavigate();

  const {
    suppliers,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
  } = useSuppliers();

  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts({});

  const { mutate: createLot, isPending, error: createError } = useCreateLot();

  function handleSubmit(values: LotFormValues) {
    createLot(values, {
      onSuccess: () => {
        navigate('/lots');
      },
    });
  }

  const isLoading = isLoadingSuppliers || isLoadingProducts;
  const fatalError = suppliersError || productsError;

  return (
    <>
      <PageHeader>
        <PageTitle>Nuevo lote</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del lote">
          {isLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando catálogos…
            </output>
          ) : fatalError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudieron cargar los catálogos. Intentá de nuevo más tarde.
            </div>
          ) : (
            <>
              {createError && (
                <div
                  className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  No se pudo crear el lote. Intentá de nuevo más tarde.
                </div>
              )}
              <LotForm
                onSubmit={handleSubmit}
                suppliers={suppliers}
                products={products}
                isPending={isPending}
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
