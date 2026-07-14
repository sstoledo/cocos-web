import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { useSearchParams } from 'react-router';
import { ClientFilters } from '../components/ClientFilters';
import { ClientTable } from '../components/ClientTable';
import { useClients } from '../hooks/use-clients';
import type { ClientListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): ClientListFilters {
  return {
    query: searchParams.get('query') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

export function ClientListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { clients, meta, isLoading, error } = useClients(filters);
  const { user } = useUser();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Reception';

  function handleFiltersChange(nextFilters: ClientListFilters) {
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
        <PageTitle>Clientes</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de clientes">
          <div className="space-y-4">
            <ClientFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando clientes…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los clientes. Intentá de nuevo más tarde.
              </div>
            ) : (
              <ClientTable clients={clients} canEdit={canEdit} />
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
