import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { PresentationFilters } from '../components/PresentationFilters';
import { PresentationTable } from '../components/PresentationTable';
import { useDeletePresentation } from '../hooks/use-delete-presentation';
import { usePresentations } from '../hooks/use-presentations';
import type { PresentationListFilters } from '../types';

function filtersFromSearchParams(
  searchParams: URLSearchParams
): PresentationListFilters {
  return {
    q: searchParams.get('q') || undefined,
  };
}

export function PresentationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { presentations, isLoading, error } = usePresentations(filters);
  const deletePresentation = useDeletePresentation();
  const { user } = useUser();

  const canEdit = user?.role?.name === 'Admin';

  function handleFiltersChange(nextFilters: PresentationListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.q) {
      nextSearchParams.set('q', nextFilters.q);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  async function handleDelete(presentation: { id: string; name: string }) {
    if (
      !window.confirm(
        `¿Eliminar la presentación "${presentation.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await deletePresentation.mutateAsync(presentation.id);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Presentaciones</PageTitle>
        {canEdit && (
          <Link
            to="/presentations/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nueva presentación
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de presentaciones">
          <div className="space-y-4">
            <PresentationFilters
              filters={filters}
              onChange={handleFiltersChange}
            />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando presentaciones…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las presentaciones. Intentá de nuevo más
                tarde.
              </div>
            ) : (
              <PresentationTable
                presentations={presentations}
                canEdit={canEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
