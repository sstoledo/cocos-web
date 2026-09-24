import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { ApiError } from '@/lib/api-error';
import { Link, useParams } from 'react-router';
import { PurchaseOrderActions } from '../components/PurchaseOrderActions';
import { PurchaseOrderStatusBadge } from '../components/PurchaseOrderStatusBadge';
import { usePurchaseOrder } from '../hooks/use-purchase-order';
import type { PurchaseOrderReceipt } from '../types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

function ReceiptHistory({ receipts }: { receipts: PurchaseOrderReceipt[] }) {
  if (receipts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no se registraron recepciones.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {receipts.map((receipt) => (
        <li
          key={receipt.lotId}
          className="rounded-md border border-border p-3 text-sm"
        >
          <p className="font-medium text-foreground">
            Lote {receipt.lotNumber} — {formatDate(receipt.receivedAt)}
          </p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {receipt.items.map((item) => (
              <li key={`${receipt.lotId}-${item.productId}`}>
                {`Producto ${item.productId}: ${item.quantity} u. a ${item.costPrice} — vence ${formatDate(item.expirationDate)}`}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: purchaseOrder, isLoading, error } = usePurchaseOrder(id ?? '');

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando orden de compra…
      </output>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>La orden de compra no existe o fue eliminada.</p>
          <Link to="/purchase-orders" className="text-primary underline">
            Volver a órdenes de compra
          </Link>
        </div>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 403) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>No tenés permiso para ver esta orden de compra.</p>
          <Link to="/purchase-orders" className="text-primary underline">
            Volver a órdenes de compra
          </Link>
        </div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
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
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PageTitle>Orden {purchaseOrder.purchaseOrderNumber}</PageTitle>
          <PurchaseOrderStatusBadge status={purchaseOrder.status} />
        </div>
        <PurchaseOrderActions purchaseOrder={purchaseOrder} />
      </PageHeader>
      <PageContent>
        <SectionCard title="Proveedor">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Proveedor</dt>
              <dd className="text-foreground">{purchaseOrder.supplier.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Fecha</dt>
              <dd className="text-foreground">
                {formatDate(purchaseOrder.createdAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Notas</dt>
              <dd className="text-foreground">{purchaseOrder.notes ?? '—'}</dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Líneas">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-3 py-2 font-medium">Cantidad pedida</th>
                  <th className="px-3 py-2 font-medium">Cantidad recibida</th>
                  <th className="px-3 py-2 font-medium">Costo estimado</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.lines.map((line) => (
                  <tr key={line.id} className="border-b border-border">
                    <td className="px-3 py-2">{line.product.name}</td>
                    <td className="px-3 py-2">{line.quantityOrdered}</td>
                    <td className="px-3 py-2">{line.quantityReceived}</td>
                    {/* Money renders verbatim as a decimal string (list
                        precedent) — no recomputation. */}
                    <td className="px-3 py-2">{line.estimatedCostPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-right text-lg font-semibold">
            {`Total estimado: ${purchaseOrder.estimatedTotal}`}
          </p>
        </SectionCard>
        <SectionCard title="Historial de recepciones">
          {/* Lot numbers render as text: no lot detail page exists to link
              to (F10 scope decision). */}
          <ReceiptHistory receipts={purchaseOrder.receipts ?? []} />
        </SectionCard>
      </PageContent>
    </>
  );
}
