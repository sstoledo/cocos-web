import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';
import { Link, useParams } from 'react-router';
import { useBrand } from '../hooks/use-brand';

function formatPrice(price: string): string {
  const num = Number(price);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: brand, isLoading: isLoadingBrand, error } = useBrand(id ?? '');
  const { products, isLoading: isLoadingProducts } = useProducts({});

  const brandProducts = products.filter((p: Product) => p.brand.id === id);

  if (isLoadingBrand) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (error || !brand) {
    return (
      <div className="p-6">
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          No se pudieron cargar los datos. Intentá de nuevo más tarde.
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader>
        <PageTitle>{brand.name}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la marca">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nombre</dt>
              <dd className="text-foreground">{brand.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Creada</dt>
              <dd className="text-foreground">{formatDate(brand.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Actualizada</dt>
              <dd className="text-foreground">{formatDate(brand.updatedAt)}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title={`Productos (${brandProducts.length})`}>
          {isLoadingProducts ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando productos…
            </output>
          ) : brandProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay productos de esta marca.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Código
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Presentación
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brandProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/50">
                      <td className="p-3 font-mono">{product.code}</td>
                      <td className="p-3">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-primary hover:underline"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="p-3">{product.presentation.name}</td>
                      <td className="p-3 tabular-nums">
                        {formatPrice(product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
