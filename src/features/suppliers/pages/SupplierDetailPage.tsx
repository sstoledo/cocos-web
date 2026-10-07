function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useLots } from '@/features/lots/hooks/use-lots';
import type { Lot } from '@/features/lots/types';
import { usePurchaseOrders } from '@/features/purchase-orders/hooks/use-purchase-orders';
import type { PurchaseOrderStatus } from '@/features/purchase-orders/types';
import { toPaginationMeta } from '@/lib/pagination';
import { useParams, useSearchParams } from 'react-router';
import { useSupplier } from '../hooks/use-supplier';

const DEFAULT_LIMIT = 10;

const STATUS_BADGES: Record<
  PurchaseOrderStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  ordered: { label: 'Ordenada', variant: 'default' },
  partially_received: { label: 'Parcial', variant: 'outline' },
  received: { label: 'Recibida', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
};

function StatusBadge({
  variant,
  children,
}: {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
}) {
  const base =
    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium';
  const variants = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    destructive: 'bg-destructive/10 text-destructive',
    outline: 'border border-border bg-transparent',
  };
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
}

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const poPage = Number.parseInt(searchParams.get('poPage') ?? '1', 10) || 1;
  const lotPage = Number.parseInt(searchParams.get('lotPage') ?? '1', 10) || 1;

  const {
    data: supplier,
    isLoading: isLoadingSupplier,
    error: supplierError,
  } = useSupplier(id ?? '');

  const {
    purchaseOrders,
    meta: poMeta,
    isLoading: isLoadingPOs,
  } = usePurchaseOrders({
    supplierId: id ?? '',
    page: poPage,
    limit: DEFAULT_LIMIT,
  });

  const {
    lots,
    meta: lotMeta,
    isLoading: isLoadingLots,
  } = useLots({
    page: lotPage,
    limit: DEFAULT_LIMIT,
  });

  const lotPaginationMeta = lotMeta ? toPaginationMeta(lotMeta) : undefined;

  function handlePOPageChange(page: number) {
    setSearchParams(
      { ...Object.fromEntries(searchParams), poPage: page.toString() },
      { replace: true }
    );
  }

  function handleLotPageChange(page: number) {
    setSearchParams(
      { ...Object.fromEntries(searchParams), lotPage: page.toString() },
      { replace: true }
    );
  }

  if (isLoadingSupplier) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (supplierError || !supplier) {
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
        <PageTitle>{supplier.name}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del proveedor">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Teléfono</dt>
              <dd className="text-foreground">{supplier.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-foreground">{supplier.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dirección</dt>
              <dd className="text-foreground">{supplier.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Estado</dt>
              <dd className="text-foreground">
                <StatusBadge
                  variant={supplier.isActive ? 'default' : 'secondary'}
                >
                  {supplier.isActive ? 'Activo' : 'Inactivo'}
                </StatusBadge>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Creado</dt>
              <dd className="text-foreground">
                {formatDate(supplier.createdAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Actualizado</dt>
              <dd className="text-foreground">
                {formatDate(supplier.updatedAt)}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title={`Órdenes de compra (${poMeta?.total ?? 0})`}>
          {isLoadingPOs ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando órdenes de compra…
            </output>
          ) : purchaseOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay órdenes de compra para este proveedor.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        N° Orden
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Fecha
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Estado
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Total estimado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => (
                      <tr key={po.id} className="border-b border-border/50">
                        <td className="p-3 font-mono">
                          {po.purchaseOrderNumber}
                        </td>
                        <td className="p-3">{formatDate(po.createdAt)}</td>
                        <td className="p-3">
                          <StatusBadge
                            variant={STATUS_BADGES[po.status].variant}
                          >
                            {STATUS_BADGES[po.status].label}
                          </StatusBadge>
                        </td>
                        <td className="p-3 tabular-nums">
                          $
                          {Number(po.estimatedTotal).toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {poMeta && poMeta.totalPages > 1 && (
                <Pagination meta={poMeta} onPageChange={handlePOPageChange} />
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title={`Lotes recibidos (${lotMeta?.total ?? 0})`}>
          {isLoadingLots ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando lotes…
            </output>
          ) : lots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay lotes recibidos de este proveedor.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        N° Lote
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Fecha recepción
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Productos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot: Lot) => (
                      <tr key={lot.id} className="border-b border-border/50">
                        <td className="p-3 font-mono">{lot.lotNumber}</td>
                        <td className="p-3">{formatDate(lot.receivedAt)}</td>
                        <td className="p-3">
                          {lot.items.map((item) => (
                            <div key={item.id} className="text-sm">
                              {item.product.name} × {item.quantity}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {lotPaginationMeta && lotPaginationMeta.totalPages > 1 && (
                <Pagination
                  meta={lotPaginationMeta}
                  onPageChange={handleLotPageChange}
                />
              )}
            </div>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
