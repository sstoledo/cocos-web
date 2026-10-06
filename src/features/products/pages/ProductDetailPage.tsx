import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { Link, useParams } from 'react-router';
import { useProduct } from '../hooks/use-product';

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

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id ?? '');

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (error || !product) {
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
        <div className="flex items-center justify-between">
          <PageTitle>{product.name}</PageTitle>
          <span className="text-sm font-medium">
            {product.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del producto">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Código</dt>
              <dd className="text-foreground font-mono">{product.code}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Nombre</dt>
              <dd className="text-foreground">{product.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Descripción</dt>
              <dd className="text-foreground">{product.description ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Presentación</dt>
              <dd className="text-foreground">{product.presentation.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Marca</dt>
              <dd className="text-foreground">
                <Link
                  to={`/brands/${product.brand.id}`}
                  className="text-primary hover:underline"
                >
                  {product.brand.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Categoría</dt>
              <dd className="text-foreground">
                <Link
                  to={`/categories/${product.category.id}`}
                  className="text-primary hover:underline"
                >
                  {product.category.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Precio</dt>
              <dd className="text-foreground tabular-nums">
                {formatPrice(product.price)}
              </dd>
            </div>
            {product.minStock !== undefined && product.minStock !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">Stock mínimo</dt>
                <dd className="text-foreground">{product.minStock}</dd>
              </div>
            )}
            {product.barcode && (
              <div>
                <dt className="text-sm text-muted-foreground">Código de barras</dt>
                <dd className="text-foreground font-mono">{product.barcode}</dd>
              </div>
            )}
            {product.taxRate && (
              <div>
                <dt className="text-sm text-muted-foreground">Tasa de impuesto</dt>
                <dd className="text-foreground">{product.taxRate}%</dd>
              </div>
            )}
            {product.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Notas</dt>
                <dd className="text-foreground">{product.notes}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">Creada</dt>
              <dd className="text-foreground">{formatDate(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Actualizada</dt>
              <dd className="text-foreground">{formatDate(product.updatedAt)}</dd>
            </div>
          </dl>
        </SectionCard>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/products/${product.id}/edit`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Editar
          </Link>
        </div>
      </PageContent>
    </>
  );
}