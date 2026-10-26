import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { ApiError } from '@/lib/api-error';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { PaymentMethodBadge } from '../components/PaymentMethodBadge';
import { SaleCancelAction } from '../components/SaleCancelAction';
import { SaleStatusBadge } from '../components/SaleStatusBadge';
import { useSale } from '../hooks/use-sale';
import type { SaleProductLine } from '../types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

function SaleLinesTable({
  lines,
  entityLabel,
  emptyMessage,
}: {
  lines: SaleProductLine[];
  entityLabel: string;
  emptyMessage: string;
}) {
  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left text-caption font-semibold text-muted-foreground">
              <th className="px-3 py-2">{entityLabel}</th>
              <th className="px-3 py-2 text-center">Cantidad</th>
              <th className="px-3 py-2 text-right">Precio unitario</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr
                key={line.id}
                className="h-14 border-b border-border last:border-0"
              >
                <td className="px-3">
                  <p className="font-medium text-foreground">
                    {line.product.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {line.product.code}
                  </p>
                </td>
                <td className="px-3 text-center">{line.quantity}</td>
                <td className="px-3 text-right">{line.unitPriceSnapshot}</td>
                <td className="px-3 text-right font-semibold">
                  {line.subtotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {lines.map((line) => (
          <article
            key={line.id}
            data-testid="sale-line-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div>
              <p className="font-medium text-foreground">{line.product.name}</p>
              <p className="text-caption text-muted-foreground">
                {line.product.code}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-caption">
              <div>
                <dt className="text-muted-foreground">Cantidad</dt>
                <dd className="text-foreground">{line.quantity}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Precio unitario</dt>
                <dd className="text-foreground">{line.unitPriceSnapshot}</dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-foreground">
                  {line.subtotal}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: sale, isLoading, error } = useSale(id ?? '');

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando venta…
      </output>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>La venta no existe o fue eliminada.</p>
          <Link to="/sales" className="text-primary underline">
            Volver a ventas
          </Link>
        </div>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 403) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>No tenés permiso para ver esta venta.</p>
          <Link to="/sales" className="text-primary underline">
            Volver a ventas
          </Link>
        </div>
      </div>
    );
  }

  if (error || !sale) {
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
          to="/sales"
          aria-label="Volver a ventas"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <PageTitle className="text-h3 lg:text-h2">
          Venta {sale.saleNumber}
        </PageTitle>
        <SaleStatusBadge status={sale.status} />
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la venta">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Fecha</dt>
              <dd className="text-foreground">{formatDate(sale.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Cliente</dt>
              <dd className="text-foreground">
                {sale.client?.name ?? 'Cliente ocasional'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Empleado</dt>
              <dd className="text-foreground">{sale.employee?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Sucursal</dt>
              <dd className="text-foreground">{sale.branch?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Método de pago</dt>
              <dd>
                <PaymentMethodBadge method={sale.paymentMethod} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Estado</dt>
              <dd>
                <SaleStatusBadge status={sale.status} />
              </dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Productos">
          <SaleLinesTable
            lines={sale.products}
            entityLabel="Producto"
            emptyMessage="No hay productos cargados."
          />
        </SectionCard>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-stat">
          <span className="text-body-sm font-semibold text-muted-foreground">
            Total:
          </span>
          <span
            data-testid="sale-total-value"
            className="text-h3 font-semibold text-foreground"
          >
            {sale.totalAmount}
          </span>
        </div>
        <div className="flex sm:justify-end">
          <SaleCancelAction sale={sale} className="w-full sm:w-auto" />
        </div>
      </PageContent>
    </>
  );
}
