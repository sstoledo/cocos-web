import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { toPaginationMeta } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { SupplierFilters } from '../components/SupplierFilters';
import { SupplierTable } from '../components/SupplierTable';
import { useSuppliers } from '../hooks/use-suppliers';
import type { SupplierListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): SupplierListFilters {
  return {
    q: searchParams.get('q') || undefined,
    isActive:
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function SupplierListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { suppliers, meta, isLoading, error } = useSuppliers(filters);
  const { user } = useUser();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Purchasing';
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;

  function handleFiltersChange(nextFilters: SupplierListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.q) {
      nextSearchParams.set('q', nextFilters.q);
    }

    if (nextFilters.isActive !== undefined) {
      nextSearchParams.set('isActive', nextFilters.isActive.toString());
    }

    nextSearchParams.set('page', '1');
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handlePageChange(page: number) {
    const nextSearchParams = new URLSearchParams();

    if (filters.q) {
      nextSearchParams.set('q', filters.q);
    }

    if (filters.isActive !== undefined) {
      nextSearchParams.set('isActive', filters.isActive.toString());
    }

    nextSearchParams.set('page', page.toString());
    setSearchParams(nextSearchParams, { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Proveedores</PageTitle>
        {canEdit && (
          <Link
            to="/suppliers/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nuevo proveedor
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de proveedores">
          <div className="space-y-4">
            <SupplierFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando proveedores…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los proveedores. Intentá de nuevo más
                tarde.
              </div>
            ) : (
              <SupplierTable suppliers={suppliers} canEdit={canEdit} />
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
    </>
  );
}
