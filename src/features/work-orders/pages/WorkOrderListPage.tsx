import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { WorkOrderFilters } from '../components/WorkOrderFilters';
import { WorkOrderTable } from '../components/WorkOrderTable';
import { useWorkOrders } from '../hooks/use-work-orders';
import type { WorkOrderListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): WorkOrderListFilters {
  return {
    query: searchParams.get('query') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function WorkOrderListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { workOrders, meta, isLoading, error } = useWorkOrders(filters);
  const { user } = useUser();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Reception';

  function handleFiltersChange(nextFilters: WorkOrderListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.query) {
      nextSearchParams.set('query', nextFilters.query);
    }

    nextSearchParams.set('page', '1');
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handlePageChange(page: number) {
    const nextSearchParams = new URLSearchParams();

    if (filters.query) {
      nextSearchParams.set('query', filters.query);
    }

    nextSearchParams.set('page', page.toString());
    setSearchParams(nextSearchParams, { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Órdenes de trabajo</PageTitle>
        {canEdit && (
          <Link
            to="/work-orders/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nueva orden de trabajo
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de órdenes de trabajo">
          <div className="space-y-4">
            <WorkOrderFilters
              filters={filters}
              onChange={handleFiltersChange}
            />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando órdenes…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las órdenes de trabajo. Intentá de nuevo
                más tarde.
              </div>
            ) : (
              <WorkOrderTable workOrders={workOrders} />
            )}
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={handlePageChange} />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
