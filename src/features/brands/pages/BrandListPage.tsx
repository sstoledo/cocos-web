import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { BrandFilters } from '../components/BrandFilters';
import { BrandTable } from '../components/BrandTable';
import { useBrands } from '../hooks/use-brands';
import { useDeleteBrand } from '../hooks/use-delete-brand';
import type { BrandListFilters } from '../types';

function filtersFromSearchParams(
  searchParams: URLSearchParams
): BrandListFilters {
  return {
    q: searchParams.get('q') || undefined,
  };
}

export function BrandListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { brands, isLoading, error } = useBrands(filters);
  const deleteBrand = useDeleteBrand();
  const { user } = useUser();

  const canEdit = user?.role?.name === 'Admin';

  function handleFiltersChange(nextFilters: BrandListFilters) {
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.q) {
      nextSearchParams.set('q', nextFilters.q);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  async function handleDelete(brand: { id: string; name: string }) {
    if (
      !window.confirm(
        `¿Eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await deleteBrand.mutateAsync(brand.id);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Marcas</PageTitle>
        {canEdit && (
          <Link
            to="/brands/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nueva marca
          </Link>
        )}
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de marcas">
          <div className="space-y-4">
            <BrandFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando marcas…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las marcas. Intentá de nuevo más tarde.
              </div>
            ) : (
              <BrandTable
                brands={brands}
                canEdit={canEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
