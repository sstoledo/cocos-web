import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { BrandForm } from '../components/BrandForm';
import { useBrand } from '../hooks/use-brand';
import { useCreateBrand } from '../hooks/use-create-brand';
import { useUpdateBrand } from '../hooks/use-update-brand';
import type { Brand, BrandFormValues } from '../types';

function brandToFormValues(brand: Brand): BrandFormValues {
  return {
    name: brand.name,
  };
}

export function BrandFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    data: brand,
    isLoading: isLoadingBrand,
    error: brandError,
  } = useBrand(id ?? '');

  const {
    mutate: createBrand,
    isPending: isCreating,
    error: createError,
  } = useCreateBrand();

  const {
    mutate: updateBrand,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateBrand();

  function handleSubmit(values: BrandFormValues) {
    if (isEditMode && id) {
      updateBrand({ id, values }, { onSuccess: () => navigate('/brands') });
    } else {
      createBrand(values, { onSuccess: () => navigate('/brands') });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar la marca. Intentá de nuevo más tarde.'
      : 'No se pudo crear la marca. Intentá de nuevo más tarde.'
    : null;

  return (
    <>
      <PageHeader>
        <PageTitle>{isEditMode ? 'Editar marca' : 'Nueva marca'}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la marca">
          {isEditMode && isLoadingBrand ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : isEditMode && brandError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudieron cargar los datos. Intentá de nuevo más tarde.
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
              <BrandForm
                key={brand?.id ?? 'create'}
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && brand ? brandToFormValues(brand) : undefined
                }
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
