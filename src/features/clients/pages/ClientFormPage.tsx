import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate } from 'react-router';
import { ClientForm } from '../components/ClientForm';
import { useCreateClient } from '../hooks/use-create-client';
import type { ClientFormValues } from '../types';

export function ClientFormPage() {
  const navigate = useNavigate();

  const {
    mutate: createClient,
    isPending,
    error: createError,
  } = useCreateClient();

  function handleSubmit(values: ClientFormValues) {
    createClient(values, {
      onSuccess: () => {
        navigate('/clients');
      },
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Nuevo cliente</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del cliente">
          {createError && (
            <div
              className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudo crear el cliente. Intentá de nuevo más tarde.
            </div>
          )}
          <ClientForm onSubmit={handleSubmit} isPending={isPending} />
        </SectionCard>
      </PageContent>
    </>
  );
}
