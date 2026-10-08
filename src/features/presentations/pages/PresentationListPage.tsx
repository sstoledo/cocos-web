import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { toPaginationMeta } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PresentationFilters } from '../components/PresentationFilters';
import { PresentationTable } from '../components/PresentationTable';
import { useDeletePresentation } from '../hooks/use-delete-presentation';
import { usePresentations } from '../hooks/use-presentations';
import type { PresentationListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): PresentationListFilters {
  return {
    q: searchParams.get('q') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function PresentationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { presentations, meta, isLoading, error } = usePresentations(filters);
  const deletePresentation = useDeletePresentation();
  const { user } = useUser();
  const [presentationToDelete, setPresentationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const canEdit = user?.role?.name === 'Admin';
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;

  function handleFiltersChange(nextFilters: PresentationListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.q) {
      nextSearchParams.set('q', nextFilters.q);
    }

    nextSearchParams.set('page', '1');
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handlePageChange(page: number) {
    const nextSearchParams = new URLSearchParams();

    if (filters.q) {
      nextSearchParams.set('q', filters.q);
    }

    nextSearchParams.set('page', page.toString());
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handleDelete(presentation: { id: string; name: string }) {
    setPresentationToDelete(presentation);
  }

  async function handleConfirmDelete() {
    if (!presentationToDelete) {
      return;
    }
    try {
      await deletePresentation.mutateAsync(presentationToDelete.id);
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
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <Pagination
                meta={paginationMeta}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </SectionCard>
      </PageContent>
      <ConfirmDialog
        open={presentationToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPresentationToDelete(null);
          }
        }}
        title="Eliminar presentación"
        description={
          presentationToDelete
            ? `¿Eliminar la presentación "${presentationToDelete.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
