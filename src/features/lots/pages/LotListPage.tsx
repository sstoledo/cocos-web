import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { toPaginationMeta } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { LotFilters } from '../components/LotFilters';
import { LotTable } from '../components/LotTable';
import { useLots } from '../hooks/use-lots';
import type { LotListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): LotListFilters {
  return {
    q: searchParams.get('q') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function LotListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { lots, meta, isLoading, error } = useLots(filters);
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;

  function handleFiltersChange(nextFilters: LotListFilters) {
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

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Lotes</PageTitle>
        <Link
          to="/lots/new"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Nuevo lote
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de lotes">
          <div className="space-y-4">
            <LotFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando lotes…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los lotes. Intentá de nuevo más tarde.
              </div>
            ) : (
              <LotTable lots={lots} />
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
