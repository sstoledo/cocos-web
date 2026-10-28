import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { toPaginationMeta } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { ServiceFilters } from '../components/ServiceFilters';
import { ServiceTable } from '../components/ServiceTable';
import { useServices } from '../hooks/use-services';
import type { ServiceListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): ServiceListFilters {
  return {
    query: searchParams.get('q') || undefined,
    isActive: parseIsActive(searchParams.get('isActive')),
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

function parseIsActive(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function ServiceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { services, meta, isLoading, error } = useServices(filters);
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;

  function handleFiltersChange(nextFilters: ServiceListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.query) {
      nextSearchParams.set('q', nextFilters.query);
    }

    if (nextFilters.isActive !== undefined) {
      nextSearchParams.set('isActive', nextFilters.isActive.toString());
    }

    nextSearchParams.set('page', '1');
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handlePageChange(page: number) {
    const nextSearchParams = new URLSearchParams();

    if (filters.query) {
      nextSearchParams.set('q', filters.query);
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
        <PageTitle className="text-h3 lg:text-h2">Servicios</PageTitle>
        <Link
          to="/services/new"
          className={cn(
            'inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors sm:w-auto',
            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Nuevo servicio
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Catálogo de servicios">
          <div className="space-y-4">
            <ServiceFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block space-y-3" aria-busy="true">
                <span className="block text-center text-muted-foreground">
                  Cargando servicios…
                </span>
                {['first', 'second', 'third'].map((row) => (
                  <span
                    key={row}
                    className="block h-11 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los servicios. Intentá de nuevo más tarde.
              </div>
            ) : (
              <ServiceTable services={services} />
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
