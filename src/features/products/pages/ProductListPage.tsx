import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { ProductFilters } from '../components/ProductFilters';
import { ProductTable } from '../components/ProductTable';
import { useProducts } from '../hooks/use-products';
import type { ProductListFilters } from '../types';

function filtersFromSearchParams(
  searchParams: URLSearchParams
): ProductListFilters {
  return {
    q: searchParams.get('q') || undefined,
    isActive: parseIsActive(searchParams.get('isActive')),
  };
}

function parseIsActive(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { products, isLoading, error } = useProducts(filters);

  function handleFiltersChange(nextFilters: ProductListFilters) {
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
        <PageTitle>Productos</PageTitle>
        <Link
          to="/products/new"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Nuevo producto
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Catálogo de productos">
          <div className="space-y-4">
            <ProductFilters filters={filters} onChange={handleFiltersChange} />
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando productos…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los productos. Intentá de nuevo más tarde.
              </div>
            ) : (
              <ProductTable products={products} />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
