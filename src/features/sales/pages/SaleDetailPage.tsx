import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { ApiError } from '@/lib/api-error';
import { Link, useParams } from 'react-router';
import { PaymentMethodBadge } from '../components/PaymentMethodBadge';
import { SaleStatusBadge } from '../components/SaleStatusBadge';
import { useSale } from '../hooks/use-sale';
import type { SaleProductLine, SaleServiceLine } from '../types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

function lineEntityName(line: SaleProductLine | SaleServiceLine): string {
  return 'product' in line ? line.product.name : line.service.name;
}

function SaleLinesTable({
  lines,
  entityLabel,
  emptyMessage,
}: {
  lines: (SaleProductLine | SaleServiceLine)[];
  entityLabel: string;
  emptyMessage: string;
}) {
  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">{entityLabel}</th>
            <th className="px-3 py-2 font-medium">Cantidad</th>
            <th className="px-3 py-2 font-medium">Precio unitario</th>
            <th className="px-3 py-2 font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b border-border">
              <td className="px-3 py-2">{lineEntityName(line)}</td>
              <td className="px-3 py-2">{line.quantity}</td>
              <td className="px-3 py-2">{line.unitPriceSnapshot}</td>
              <td className="px-3 py-2">{line.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      <PageHeader>
        <PageTitle>Venta {sale.saleNumber}</PageTitle>
        <SaleStatusBadge status={sale.status} />
      </PageHeader>
      <PageContent>
        <SectionCard title="Información general">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Cliente</dt>
              <dd className="text-foreground">
                {sale.client?.name ?? 'Cliente ocasional'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Método de pago</dt>
              <dd>
                <PaymentMethodBadge method={sale.paymentMethod} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Sucursal</dt>
              <dd className="text-foreground">{sale.branch?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Empleado</dt>
              <dd className="text-foreground">{sale.employee?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Fecha</dt>
              <dd className="text-foreground">{formatDate(sale.createdAt)}</dd>
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
        <SectionCard title="Servicios">
          <SaleLinesTable
            lines={sale.services}
            entityLabel="Servicio"
            emptyMessage="No hay servicios cargados."
          />
        </SectionCard>
        <p className="text-right text-lg font-semibold">
          {`Total: ${sale.totalAmount}`}
        </p>
      </PageContent>
    </>
  );
}
