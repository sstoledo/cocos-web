import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate } from 'react-router';
import { LotForm } from '../components/LotForm';
import { useCreateLot } from '../hooks/use-create-lot';
import type { LotFormValues } from '../types';

export function LotFormPage() {
  const navigate = useNavigate();

  const { mutate: createLot, isPending, error: createError } = useCreateLot();

  function handleSubmit(values: LotFormValues) {
    createLot(values, {
      onSuccess: () => {
        navigate('/lots');
      },
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Nuevo lote</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del lote">
          {createError && (
            <div
              className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudo crear el lote. Intentá de nuevo más tarde.
            </div>
          )}
          <LotForm onSubmit={handleSubmit} isPending={isPending} />
        </SectionCard>
      </PageContent>
    </>
  );
}
