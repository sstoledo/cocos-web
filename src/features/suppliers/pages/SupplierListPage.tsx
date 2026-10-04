import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { SupplierFilters } from '../components/SupplierFilters';
import { SupplierTable } from '../components/SupplierTable';
import { useSuppliers } from '../hooks/use-suppliers';
import type { SupplierListFilters } from '../types';

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
  };
}

export function SupplierListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { suppliers, isLoading, error } = useSuppliers(filters);
  const { user } = useUser();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Purchasing';

  function handleFiltersChange(nextFilters: SupplierListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.q) {
      nextSearchParams.set('q', nextFilters.q);
    }

    if (nextFilters.isActive !== undefined) {
      nextSearchParams.set('isActive', nextFilters.isActive.toString());
    }

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
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
