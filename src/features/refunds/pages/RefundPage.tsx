import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { SalesTable } from '@/features/sales/components/SalesTable';
import { useSales } from '@/features/sales/hooks/use-sales';
import { getPageTitle } from '@/features/shell/lib/pageTitles';
import { useLocation, useSearchParams } from 'react-router';

const DEFAULT_LIMIT = 10;

// Cancelled-sales audit list (SL-F18): fixed `cancelled` filter, no
// SalesFilters control; the list machinery is reused verbatim from sales.
export function RefundPage() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const { sales, meta, isLoading, error } = useSales({
    status: 'cancelled',
    page,
    limit: DEFAULT_LIMIT,
  });

  function handlePageChange(nextPage: number) {
    setSearchParams({ page: nextPage.toString() }, { replace: true });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title={title}>
          <div className="space-y-4">
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
