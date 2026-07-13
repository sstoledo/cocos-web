import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate } from 'react-router';
import { ProductForm } from '../components/ProductForm';
import { useCreateProduct } from '../hooks/use-create-product';
import { useProductReferences } from '../hooks/use-product-references';
import type { ProductFormValues } from '../types';

export function ProductFormPage() {
  const navigate = useNavigate();
  const {
    presentations,
    brands,
    categories,
    isLoading,
    error: referencesError,
  } = useProductReferences();
  const {
    mutate: createProduct,
    isPending,
    error: mutationError,
  } = useCreateProduct();

  function handleSubmit(values: ProductFormValues, image: File | null) {
    createProduct(
      { values, image: image ?? undefined },
      {
        onSuccess: () => {
          navigate('/products');
        },
      }
    );
  }

  const errorMessage = mutationError
    ? 'No se pudo crear el producto. Intentá de nuevo más tarde.'
    : null;

  return (
    <>
      <PageHeader>
        <PageTitle>Nuevo producto</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del producto">
          {isLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando catálogos…
            </output>
          ) : referencesError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudieron cargar los catálogos. Intentá de nuevo más tarde.
            </div>
          ) : (
            <>
              {errorMessage && (
                <div
                  className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}
              <ProductForm
                onSubmit={handleSubmit}
                presentations={presentations}
                brands={brands}
                categories={categories}
                isPending={isPending}
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
