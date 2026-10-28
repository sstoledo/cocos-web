import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { useProduct } from '../hooks/use-product';
import { PRODUCT_CONSUMPTION_TYPE_LABELS } from '../types';

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
  const { user } = useUser();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Warehouse';

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
      <PageHeader className="flex items-center gap-3">
        <Link
          to="/products"
          aria-label="Volver a productos"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <PageTitle className="text-h3 lg:text-h2">{product.name}</PageTitle>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold',
            product.isActive
              ? 'bg-success text-success-foreground'
              : 'bg-destructive text-destructive-foreground'
          )}
        >
          {product.isActive ? 'Activo' : 'Inactivo'}
        </span>
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
            <div>
              <dt className="text-sm text-muted-foreground">Tipo de consumo</dt>
              <dd className="text-foreground">
                {
                  PRODUCT_CONSUMPTION_TYPE_LABELS[
                    product.consumptionType ?? 'direct'
                  ]
                }
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
                <dt className="text-sm text-muted-foreground">
                  Código de barras
                </dt>
                <dd className="text-foreground font-mono">{product.barcode}</dd>
              </div>
            )}
            {product.taxRate && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  Tasa de impuesto
                </dt>
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
              <dd className="text-foreground">
                {formatDate(product.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Actualizada</dt>
              <dd className="text-foreground">
                {formatDate(product.updatedAt)}
              </dd>
            </div>
          </dl>
        </SectionCard>

        {canEdit && (
          <div className="mt-4 flex">
            <Link
              to={`/products/${product.id}/edit`}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Editar
            </Link>
          </div>
        )}
      </PageContent>
    </>
  );
}
