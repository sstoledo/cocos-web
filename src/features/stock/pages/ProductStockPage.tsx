import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProduct } from '@/features/products/hooks/use-product';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { StockAdjustmentForm } from '../components/StockAdjustmentForm';
import { StockMovementList } from '../components/StockMovementList';
import { useCreateStockMovement } from '../hooks/use-create-stock-movement';
import { useOpenContainers } from '../hooks/use-open-containers';
import { useProductMovements } from '../hooks/use-product-movements';
import { useProductStock } from '../hooks/use-product-stock';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function ProductStockPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ?? '';

  const { data: product, isLoading: isLoadingProduct } = useProduct(productId);
  const { data: stock, isLoading: isLoadingStock } = useProductStock(productId);
  const { data: movements = [], isLoading: isLoadingMovements } =
    useProductMovements(productId);
  const isPartialConsumption = product?.consumptionType === 'partial';
  const { data: openContainers } = useOpenContainers(
    productId,
    isPartialConsumption
  );
  const {
    mutate: createMovement,
    isPending: isCreating,
    isSuccess,
    error: createError,
    reset,
  } = useCreateStockMovement(productId);

  function handleAdjustmentSubmit(values: {
    quantity: number;
    reason?: string;
  }) {
    reset();
    createMovement(values);
  }

  const isLoading = isLoadingProduct || isLoadingStock || isLoadingMovements;

  const fatalError =
    isLoadingProduct || isLoadingStock || isLoadingMovements
      ? null
      : (!product && !isLoadingProduct) ||
          (!stock && !isLoadingStock) ||
          (!movements && !isLoadingMovements)
        ? true
        : null;

  return (
    <>
      <PageHeader className="flex items-center gap-3">
        <Link
          to={`/products/${productId}`}
          aria-label="Volver al producto"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <PageTitle className="text-h3 lg:text-h2">
          {product?.name ?? 'Stock del producto'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        {isLoading ? (
          <output className="block py-8 text-center text-muted-foreground">
            Cargando…
          </output>
        ) : fatalError ? (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
            role="alert"
          >
            No se pudieron cargar los datos. Intentá de nuevo más tarde.
          </div>
        ) : (
          <>
            <SectionCard title="Stock actual">
              <p className="text-h3 text-foreground">{stock?.stock ?? 0}</p>
            </SectionCard>

            {isPartialConsumption && openContainers && (
              <SectionCard title="Envases abiertos">
                <p className="text-h3 text-foreground">
                  {openContainers.openContainers}
                </p>
                {openContainers.lastOpened ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Último envase abierto en la orden{' '}
                    {openContainers.lastOpened.workOrderNumber} por{' '}
                    {openContainers.lastOpened.registeredBy.name} el{' '}
                    {formatDateTime(openContainers.lastOpened.createdAt)}.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay envases abiertos registrados.
                  </p>
                )}
              </SectionCard>
            )}

            <SectionCard title="Movimientos">
              <StockMovementList movements={movements} />
            </SectionCard>

            <SectionCard title="Ajuste de stock">
              {isSuccess && (
                <output className="mb-4 block rounded-md border border-green-600/50 bg-green-600/10 p-4 text-green-700 dark:text-green-400">
                  Ajuste guardado correctamente.
                </output>
              )}
              {createError && (
                <div
                  className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  No se pudo guardar el ajuste. Intentá de nuevo más tarde.
                </div>
              )}
              <StockAdjustmentForm
                onSubmit={handleAdjustmentSubmit}
                isPending={isCreating}
              />
            </SectionCard>
          </>
        )}
      </PageContent>
    </>
  );
}
