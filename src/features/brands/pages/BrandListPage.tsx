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
import { BrandFilters } from '../components/BrandFilters';
import { BrandTable } from '../components/BrandTable';
import { useBrands } from '../hooks/use-brands';
import { useDeleteBrand } from '../hooks/use-delete-brand';
import type { BrandListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): BrandListFilters {
  return {
    q: searchParams.get('q') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function BrandListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { brands, meta, isLoading, error } = useBrands(filters);
  const deleteBrand = useDeleteBrand();
  const { user } = useUser();
  const [brandToDelete, setBrandToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const canEdit = user?.role?.name === 'Admin';
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;

  function handleFiltersChange(nextFilters: BrandListFilters) {
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

  function handleDelete(brand: { id: string; name: string }) {
    setBrandToDelete(brand);
  }

  async function handleConfirmDelete() {
    if (!brandToDelete) {
      return;
    }
    try {
      await deleteBrand.mutateAsync(brandToDelete.id);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Marcas</PageTitle>
        {canEdit && (
          <Link
            to="/brands/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nueva marca
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de marcas">
          <div className="space-y-4">
            <BrandFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando marcas…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las marcas. Intentá de nuevo más tarde.
              </div>
            ) : (
              <BrandTable
                brands={brands}
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
        open={brandToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBrandToDelete(null);
          }
        }}
        title="Eliminar marca"
        description={
          brandToDelete
            ? `¿Eliminar la marca "${brandToDelete.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
