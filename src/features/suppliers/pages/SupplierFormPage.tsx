import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { SupplierForm } from '../components/SupplierForm';
import { useCreateSupplier } from '../hooks/use-create-supplier';
import { useSupplier } from '../hooks/use-supplier';
import { useUpdateSupplier } from '../hooks/use-update-supplier';
import type { Supplier, SupplierFormValues } from '../types';

function supplierToFormValues(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name,
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    address: supplier.address ?? '',
    isActive: supplier.isActive,
  };
}

export function SupplierFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    data: supplier,
    isLoading: isLoadingSupplier,
    error: supplierError,
  } = useSupplier(id ?? '');

  const {
    mutate: createSupplier,
    isPending: isCreating,
    error: createError,
  } = useCreateSupplier();

  const {
    mutate: updateSupplier,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateSupplier();

  function handleSubmit(values: SupplierFormValues) {
    if (isEditMode && id) {
      updateSupplier(
        { id, values },
        { onSuccess: () => navigate('/suppliers') }
      );
    } else {
      createSupplier(values, { onSuccess: () => navigate('/suppliers') });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar el proveedor. Intentá de nuevo más tarde.'
      : 'No se pudo crear el proveedor. Intentá de nuevo más tarde.'
    : null;

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar proveedor' : 'Nuevo proveedor'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del proveedor">
          {isEditMode && isLoadingSupplier ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : isEditMode && supplierError ? (
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
              <SupplierForm
                key={supplier?.id ?? 'create'}
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && supplier
                    ? supplierToFormValues(supplier)
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
