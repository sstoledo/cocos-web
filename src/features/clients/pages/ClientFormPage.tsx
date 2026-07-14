import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { ClientForm } from '../components/ClientForm';
import { useClient } from '../hooks/use-client';
import { useCreateClient } from '../hooks/use-create-client';
import { useUpdateClient } from '../hooks/use-update-client';
import type { Client, ClientFormValues } from '../types';

function clientToFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    identificationType: client.identificationType ?? 'DNI',
    identification: client.identification ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    address: client.address ?? '',
  };
}

export function ClientFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    data: client,
    isLoading: isLoadingClient,
    error: clientError,
  } = useClient(id ?? '');

  const {
    mutate: createClient,
    isPending: isCreating,
    error: createError,
  } = useCreateClient();

  const {
    mutate: updateClient,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateClient();

  function handleSubmit(values: ClientFormValues) {
    if (isEditMode && id) {
      updateClient({ id, values }, { onSuccess: () => navigate('/clients') });
    } else {
      createClient(values, { onSuccess: () => navigate('/clients') });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar el cliente. Intentá de nuevo más tarde.'
      : 'No se pudo crear el cliente. Intentá de nuevo más tarde.'
    : null;

  return (
    <>
      <PageHeader>
        <PageTitle>{isEditMode ? 'Editar cliente' : 'Nuevo cliente'}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del cliente">
          {isEditMode && isLoadingClient ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : isEditMode && clientError ? (
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
              <ClientForm
                key={client?.id ?? 'create'}
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && client ? clientToFormValues(client) : undefined
                }
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
