import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useClients } from '@/features/clients/hooks/use-clients';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
import { SalesFilters } from '../components/SalesFilters';
import { SalesTable } from '../components/SalesTable';
import { useSales } from '../hooks/use-sales';
import type { SaleListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): SaleListFilters {
  const status = searchParams.get('status');

  return {
    saleNumber: searchParams.get('saleNumber') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    clientId: searchParams.get('clientId') || undefined,
    status: status === 'completed' ? 'completed' : undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

function searchParamsFromFilters(
  filters: SaleListFilters,
  page: number
): URLSearchParams {
  const nextSearchParams = new URLSearchParams();

  if (filters.saleNumber) {
    nextSearchParams.set('saleNumber', filters.saleNumber);
  }

  if (filters.from) {
    nextSearchParams.set('from', filters.from);
  }

  if (filters.to) {
    nextSearchParams.set('to', filters.to);
  }

  if (filters.clientId) {
    nextSearchParams.set('clientId', filters.clientId);
  }

  if (filters.status) {
    nextSearchParams.set('status', filters.status);
  }

  nextSearchParams.set('page', page.toString());

  return nextSearchParams;
}

export function SalesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { sales, meta, isLoading, error } = useSales(filters);
  const { clients } = useClients({});

  function handleFiltersChange(nextFilters: SaleListFilters) {
    // Any filter change resets pagination to the first page (SL-F1).
    setSearchParams(searchParamsFromFilters(nextFilters, 1), { replace: true });
  }

  function handlePageChange(page: number) {
    setSearchParams(searchParamsFromFilters(filters, page), { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Ventas</PageTitle>
        <Link
          to="/sales/new"
          className={cn(
            'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <IconPlus className="mr-1.5 h-3.5 w-3.5" />
          Nueva venta
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de ventas">
          <div className="space-y-4">
            <SalesFilters
              filters={filters}
              clients={clients}
              onChange={handleFiltersChange}
            />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando ventas…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las ventas. Intentá de nuevo más tarde.
              </div>
            ) : (
              <SalesTable sales={sales} />
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
