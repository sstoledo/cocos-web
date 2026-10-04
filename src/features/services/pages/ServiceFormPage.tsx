import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { ServiceForm } from '../components/ServiceForm';
import { useCreateService } from '../hooks/use-create-service';
import { useService } from '../hooks/use-service';
import { useUpdateService } from '../hooks/use-update-service';
import type { Service, ServiceFormValues } from '../types';

function serviceToFormValues(service: Service): ServiceFormValues {
  return {
    code: service.code,
    name: service.name,
    description: service.description ?? '',
    price: Number(service.price),
    estimatedDuration: service.estimatedDuration ?? undefined,
    isActive: service.isActive,
  };
}

export function ServiceFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    data: service,
    isLoading: isLoadingService,
    error: serviceError,
  } = useService(id ?? '');

  const {
    mutate: createService,
    isPending: isCreating,
    error: createError,
  } = useCreateService();

  const {
    mutate: updateService,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateService();

  function handleSubmit(values: ServiceFormValues) {
    if (isEditMode && id) {
      updateService(
        { id, values },
        {
          onSuccess: () => {
            navigate('/services');
          },
        }
      );
    } else {
      createService(values, {
        onSuccess: () => {
          navigate('/services');
        },
      });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar el servicio. Intentá de nuevo más tarde.'
      : 'No se pudo crear el servicio. Intentá de nuevo más tarde.'
    : null;

  const isLoading = isEditMode ? isLoadingService : false;

  const fatalError = isEditMode ? serviceError : null;

  const loadingMessage = 'Cargando…';

  const fatalErrorMessage =
    'No se pudieron cargar los datos. Intentá de nuevo más tarde.';

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar servicio' : 'Nuevo servicio'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del servicio">
          {isLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              {loadingMessage}
            </output>
          ) : fatalError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {fatalErrorMessage}
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
              <ServiceForm
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && service
                    ? serviceToFormValues(service)
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
