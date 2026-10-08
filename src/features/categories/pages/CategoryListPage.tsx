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
import { CategoryFilters } from '../components/CategoryFilters';
import { CategoryTable } from '../components/CategoryTable';
import { useCategories } from '../hooks/use-categories';
import { useDeleteCategory } from '../hooks/use-delete-category';
import type { CategoryListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): CategoryListFilters {
  return {
    q: searchParams.get('q') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function CategoryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { categories, meta, isLoading, error } = useCategories(filters);
  const deleteCategory = useDeleteCategory();
  const { user } = useUser();
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const canEdit = user?.role?.name === 'Admin';
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;

  function handleFiltersChange(nextFilters: CategoryListFilters) {
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

  function handleDelete(category: { id: string; name: string }) {
    setCategoryToDelete(category);
  }

  async function handleConfirmDelete() {
    if (!categoryToDelete) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Categorías</PageTitle>
        {canEdit && (
          <Link
            to="/categories/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nueva categoría
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de categorías">
          <div className="space-y-4">
            <CategoryFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando categorías…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las categorías. Intentá de nuevo más
                tarde.
              </div>
            ) : (
              <CategoryTable
                categories={categories}
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
        open={categoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
        title="Eliminar categoría"
        description={
          categoryToDelete
            ? `¿Eliminar la categoría "${categoryToDelete.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
