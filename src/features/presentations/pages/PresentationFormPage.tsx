import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { PresentationForm } from '../components/PresentationForm';
import { useCreatePresentation } from '../hooks/use-create-presentation';
import { usePresentation } from '../hooks/use-presentation';
import { useUpdatePresentation } from '../hooks/use-update-presentation';
import type { Presentation, PresentationFormValues } from '../types';

function presentationToFormValues(
  presentation: Presentation
): PresentationFormValues {
  return {
    name: presentation.name,
  };
}

export function PresentationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    data: presentation,
    isLoading: isLoadingPresentation,
    error: presentationError,
  } = usePresentation(id ?? '');

  const {
    mutate: createPresentation,
    isPending: isCreating,
    error: createError,
  } = useCreatePresentation();

  const {
    mutate: updatePresentation,
    isPending: isUpdating,
    error: updateError,
  } = useUpdatePresentation();

  function handleSubmit(values: PresentationFormValues) {
    if (isEditMode && id) {
      updatePresentation(
        { id, values },
        { onSuccess: () => navigate('/presentations') }
      );
    } else {
      createPresentation(values, {
        onSuccess: () => navigate('/presentations'),
      });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar la presentación. Intentá de nuevo más tarde.'
      : 'No se pudo crear la presentación. Intentá de nuevo más tarde.'
    : null;

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar presentación' : 'Nueva presentación'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la presentación">
          {isEditMode && isLoadingPresentation ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : isEditMode && presentationError ? (
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
              <PresentationForm
                key={presentation?.id ?? 'create'}
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && presentation
                    ? presentationToFormValues(presentation)
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
