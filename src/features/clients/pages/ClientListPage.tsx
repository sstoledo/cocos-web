import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ClientFilters } from '../components/ClientFilters';
import { ClientTable } from '../components/ClientTable';
import { useClients } from '../hooks/use-clients';
import { useDeleteClient } from '../hooks/use-delete-client';
import type { Client, ClientListFilters } from '../types';

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
  const deleteClient = useDeleteClient();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Reception';

  function handleConfirmDelete() {
    if (!clientToDelete) {
      return;
    }
    deleteClient.mutate(clientToDelete.id);
  }

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
        <PageTitle className="text-h3 lg:text-h2">Clientes</PageTitle>
        {canEdit && (
          <Link
            to="/clients/new"
            className={cn(
              'inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors sm:w-auto',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nuevo cliente
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de clientes">
          <div className="space-y-4">
            <ClientFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block space-y-3" aria-busy="true">
                <span className="block text-center text-muted-foreground">
                  Cargando clientes…
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
                No se pudieron cargar los clientes. Intentá de nuevo más tarde.
              </div>
            ) : (
              <ClientTable
                clients={clients}
                canEdit={canEdit}
                onDelete={setClientToDelete}
              />
            )}
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={handlePageChange} />
            )}
          </div>
        </SectionCard>
      </PageContent>
      <ConfirmDialog
        open={clientToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setClientToDelete(null);
          }
        }}
        title="Eliminar cliente"
        description={
          clientToDelete
            ? `¿Eliminar a ${clientToDelete.name}? Esta acción no se puede deshacer.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
