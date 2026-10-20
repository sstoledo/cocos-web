import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { toPaginationMeta } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { ProductFilters } from '../components/ProductFilters';
import { ProductTable } from '../components/ProductTable';
import { useProducts } from '../hooks/use-products';
import type { ProductListFilters } from '../types';

const DEFAULT_LIMIT = 10;

function filtersFromSearchParams(
  searchParams: URLSearchParams
): ProductListFilters {
  return {
    q: searchParams.get('q') || undefined,
    isActive: parseIsActive(searchParams.get('isActive')),
    brandId: searchParams.get('brandId') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    presentationId: searchParams.get('presentationId') || undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

function parseIsActive(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function filtersToSearchParams(
  filters: ProductListFilters,
  page: number
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set('q', filters.q);
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', filters.isActive.toString());
  }

  if (filters.brandId) {
    searchParams.set('brandId', filters.brandId);
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  if (filters.presentationId) {
    searchParams.set('presentationId', filters.presentationId);
  }

  searchParams.set('page', page.toString());
  return searchParams;
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { products, meta, isLoading, error } = useProducts(filters);
  const paginationMeta = meta ? toPaginationMeta(meta) : undefined;
  const { user } = useUser();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Warehouse';

  function handleFiltersChange(nextFilters: ProductListFilters) {
    setSearchParams(filtersToSearchParams(nextFilters, 1), {
      replace: true,
    });
  }

  function handlePageChange(page: number) {
    setSearchParams(filtersToSearchParams(filters, page), { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Productos</PageTitle>
        {canEdit && (
          <Link
            to="/products/new"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            Nuevo producto
          </Link>
        )}
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
              <ProductTable products={products} canEdit={canEdit} />
            )}
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <Pagination
                meta={paginationMeta}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}
