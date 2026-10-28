import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import type { PaginationMeta } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
import { ProformaFilters } from '../components/ProformaFilters';
import { ProformaTable } from '../components/ProformaTable';
import { useProformas } from '../hooks/use-proformas';
import type { ProformaListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): ProformaListFilters {
  const status = searchParams.get('status');

  return {
    proformaNumber: searchParams.get('proformaNumber') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    clientId: searchParams.get('clientId') || undefined,
    status:
      status === 'draft' ||
      status === 'sent' ||
      status === 'accepted' ||
      status === 'rejected' ||
      status === 'converted'
        ? status
        : undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

function searchParamsFromFilters(
  filters: ProformaListFilters,
  page: number
): URLSearchParams {
  const nextSearchParams = new URLSearchParams();

  if (filters.proformaNumber) {
    nextSearchParams.set('proformaNumber', filters.proformaNumber);
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

export function ProformasListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { proformas, meta, isLoading, error } = useProformas(filters);

  const pagination: PaginationMeta | undefined = meta
    ? {
        page: meta.page,
        total: meta.total,
        totalPages: Math.ceil(meta.total / meta.limit),
      }
    : undefined;

  function handleFiltersChange(nextFilters: ProformaListFilters) {
    setSearchParams(searchParamsFromFilters(nextFilters, 1), { replace: true });
  }

  function handlePageChange(page: number) {
    setSearchParams(searchParamsFromFilters(filters, page), { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle className="text-h3 lg:text-h2">Proformas</PageTitle>
        <Link
          to="/proformas/new"
          className={cn(
            'inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors sm:w-auto',
            'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <IconPlus className="mr-1.5 h-4 w-4" />
          Nueva proforma
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de proformas">
          <div className="space-y-4">
            <ProformaFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block space-y-3" aria-busy="true">
                <span className="block text-center text-muted-foreground">
                  Cargando proformas…
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
                No se pudieron cargar las proformas. Intentá de nuevo más tarde.
              </div>
            ) : (
              <ProformaTable proformas={proformas} />
            )}
            {pagination && pagination.totalPages > 1 && (
              <Pagination meta={pagination} onPageChange={handlePageChange} />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
