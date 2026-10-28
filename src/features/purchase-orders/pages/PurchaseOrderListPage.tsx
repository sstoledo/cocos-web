import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useSuppliers } from '@/features/lots/hooks/use-suppliers';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
import { PurchaseOrderFilters } from '../components/PurchaseOrderFilters';
import { PurchaseOrderTable } from '../components/PurchaseOrderTable';
import { usePurchaseOrders } from '../hooks/use-purchase-orders';
import type { PurchaseOrderListFilters, PurchaseOrderStatus } from '../types';

const DEFAULT_LIMIT = 10;

const VALID_STATUSES: PurchaseOrderStatus[] = [
  'draft',
  'ordered',
  'partially_received',
  'received',
  'cancelled',
];

function filtersFromSearchParams(
  searchParams: URLSearchParams
): PurchaseOrderListFilters {
  const status = searchParams.get('status');

  return {
    purchaseOrderNumber: searchParams.get('purchaseOrderNumber') || undefined,
    supplierId: searchParams.get('supplierId') || undefined,
    status: VALID_STATUSES.includes(status as PurchaseOrderStatus)
      ? (status as PurchaseOrderStatus)
      : undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

function searchParamsFromFilters(
  filters: PurchaseOrderListFilters,
  page: number
): URLSearchParams {
  const nextSearchParams = new URLSearchParams();

  if (filters.purchaseOrderNumber) {
    nextSearchParams.set('purchaseOrderNumber', filters.purchaseOrderNumber);
  }

  if (filters.supplierId) {
    nextSearchParams.set('supplierId', filters.supplierId);
  }

  if (filters.status) {
    nextSearchParams.set('status', filters.status);
  }

  nextSearchParams.set('page', page.toString());

  return nextSearchParams;
}

export function PurchaseOrderListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { purchaseOrders, meta, isLoading, error } = usePurchaseOrders(filters);
  const { suppliers } = useSuppliers();

  function handleFiltersChange(nextFilters: PurchaseOrderListFilters) {
    // Any filter change resets pagination to the first page.
    setSearchParams(searchParamsFromFilters(nextFilters, 1), {
      replace: true,
    });
  }

  function handlePageChange(page: number) {
    setSearchParams(searchParamsFromFilters(filters, page), { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle className="text-h3 lg:text-h2">Órdenes de compra</PageTitle>
        <Link
          to="/purchase-orders/new"
          className={cn(
            'inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors sm:w-auto',
            'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <IconPlus className="mr-1.5 h-4 w-4" />
          Nueva orden
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de órdenes de compra">
          <div className="space-y-4">
            <PurchaseOrderFilters
              filters={filters}
              suppliers={suppliers}
              onChange={handleFiltersChange}
            />
            {isLoading ? (
              <output className="block space-y-3" aria-busy="true">
                <span className="block text-center text-muted-foreground">
                  Cargando órdenes de compra…
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
                No se pudieron cargar las órdenes de compra. Intentá de nuevo
                más tarde.
              </div>
            ) : (
              <PurchaseOrderTable purchaseOrders={purchaseOrders} />
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
