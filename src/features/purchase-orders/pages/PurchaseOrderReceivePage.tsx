import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router';
import { z } from 'zod';
import { usePurchaseOrder } from '../hooks/use-purchase-order';
import { useReceivePurchaseOrder } from '../hooks/use-receive-purchase-order';
import { getPurchaseOrderErrorMessage } from '../lib/purchase-order-error-messages';
import {
  type ReceivePurchaseOrderFormValues,
  receivePurchaseOrderSchema,
} from '../schemas/purchase-order-schema';
import type { PurchaseOrder, PurchaseOrderLine } from '../types';

const RECEIVABLE_STATUSES = ['ordered', 'partially_received'];

export function remainingOf(line: PurchaseOrderLine): number {
  return line.quantityOrdered - line.quantityReceived;
}

// The F10.1 schema caps receivedQty at >= 1; the per-line max (what is left
// to receive) is dynamic, so it is refined here against the loaded order.
function buildReceiveSchema(lines: PurchaseOrderLine[]) {
  const remainingByLineId = new Map(
    lines.map((line) => [line.id, remainingOf(line)])
  );

  return receivePurchaseOrderSchema.superRefine((values, ctx) => {
    values.lines.forEach((line, index) => {
      const remaining = remainingByLineId.get(line.lineId);
      if (remaining !== undefined && line.receivedQty > remaining) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Máximo ${remaining} (lo pendiente de la línea)`,
          path: ['lines', index, 'receivedQty'],
        });
      }
    });
  });
}

function toDefaultValues(
  receivableLines: PurchaseOrderLine[]
): ReceivePurchaseOrderFormValues {
  return {
    lines: receivableLines.map((line) => ({
      lineId: line.id,
      // Receive-all is the dominant flow: default to the full remainder.
      receivedQty: remainingOf(line),
      expirationDate: '',
      actualCostPrice: line.estimatedCostPrice,
    })),
  };
}

type ReceiveFormProps = {
  purchaseOrder: PurchaseOrder;
  receivableLines: PurchaseOrderLine[];
  isPending: boolean;
  onSubmit: (values: ReceivePurchaseOrderFormValues) => void;
};

function ReceiveForm({
  purchaseOrder,
  receivableLines,
  isPending,
  onSubmit,
}: ReceiveFormProps) {
  const schema = useMemo(
    () => buildReceiveSchema(receivableLines),
    [receivableLines]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceivePurchaseOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaultValues(receivableLines),
  });

  const fullyReceivedLines = purchaseOrder.lines.filter(
    (line) => remainingOf(line) <= 0
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-4">
        {receivableLines.map((line, index) => {
          const itemErrors = errors.lines?.[index];
          const remaining = remainingOf(line);

          return (
            <div
              key={line.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="font-medium text-foreground">{line.product.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pedidas: {line.quantityOrdered} — Recibidas:{' '}
                {line.quantityReceived} — Pendientes: {remaining}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`lines-${index}-receivedQty`}>
                    Cantidad a recibir
                  </Label>
                  <Input
                    id={`lines-${index}-receivedQty`}
                    type="number"
                    min="1"
                    max={remaining}
                    step="1"
                    aria-invalid={itemErrors?.receivedQty ? 'true' : 'false'}
                    {...register(`lines.${index}.receivedQty`)}
                  />
                  {itemErrors?.receivedQty && (
                    <p className="text-sm text-destructive" role="alert">
                      {itemErrors.receivedQty.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lines-${index}-expirationDate`}>
                    Fecha de vencimiento
                  </Label>
                  <Input
                    id={`lines-${index}-expirationDate`}
                    type="date"
                    aria-invalid={itemErrors?.expirationDate ? 'true' : 'false'}
                    {...register(`lines.${index}.expirationDate`)}
                  />
                  {itemErrors?.expirationDate ? (
                    <p className="text-sm text-destructive" role="alert">
                      {itemErrors.expirationDate.message}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Si el producto no vence, usá una fecha lejana (ej.
                      2099-12-31).
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lines-${index}-actualCostPrice`}>
                    Costo real
                  </Label>
                  {/* Text input (not type=number): the decimal string must
                      reach the backend verbatim — number inputs normalize
                      '50.00' to '50' (F10.5 precedent). */}
                  <Input
                    id={`lines-${index}-actualCostPrice`}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-invalid={
                      itemErrors?.actualCostPrice ? 'true' : 'false'
                    }
                    {...register(`lines.${index}.actualCostPrice`)}
                  />
                  {itemErrors?.actualCostPrice && (
                    <p className="text-sm text-destructive" role="alert">
                      {itemErrors.actualCostPrice.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {fullyReceivedLines.map((line) => (
          <div
            key={line.id}
            className="rounded-lg border border-border bg-muted/50 p-4"
          >
            <p className="font-medium text-foreground">{line.product.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recibida completa — {line.quantityReceived} de{' '}
              {line.quantityOrdered} unidades.
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registrando…' : 'Registrar recepción'}
        </Button>
        <Link
          to={`/purchase-orders/${purchaseOrder.id}`}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md px-4 font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

export function PurchaseOrderReceivePage() {
  const { id } = useParams<{ id: string }>();
  const { data: purchaseOrder, isLoading, error } = usePurchaseOrder(id ?? '');
  const receiveMutation = useReceivePurchaseOrder();

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando orden de compra…
      </output>
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

  if (!RECEIVABLE_STATUSES.includes(purchaseOrder.status)) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>Esta orden no puede recibir mercadería.</p>
          <Link
            to={`/purchase-orders/${purchaseOrder.id}`}
            className="text-primary underline"
          >
            Volver a la orden
          </Link>
        </div>
      </div>
    );
  }

  const receivableLines = purchaseOrder.lines.filter(
    (line) => remainingOf(line) > 0
  );
  const received = receiveMutation.data;
  // Local alias: narrowing does not survive into hoisted function
  // declarations, and handleSubmit closes over the loaded order.
  const order = purchaseOrder;

  function handleSubmit(values: ReceivePurchaseOrderFormValues) {
    receiveMutation.mutate({
      id: order.id,
      payload: { lines: values.lines },
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Recibir orden {purchaseOrder.purchaseOrderNumber}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Recepción de mercadería">
          {receiveMutation.isSuccess && received ? (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
                <p className="font-medium">
                  Recepción registrada correctamente.
                </p>
                {/* One lot per receive call (B10 contract); ids come from
                    the response, lot numbers follow COM-…-R{n}. */}
                <p className="mt-2 text-sm">
                  {received.lotIds && received.lotIds.length > 0
                    ? `Se generaron ${received.lotIds.length} lote(s) para esta orden.`
                    : 'Se generó el lote correspondiente a esta recepción.'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Los lotes se numeran como {purchaseOrder.purchaseOrderNumber}
                  -R1, {purchaseOrder.purchaseOrderNumber}-R2, …
                </p>
              </div>
              <Link
                to={`/purchase-orders/${purchaseOrder.id}`}
                className="text-primary underline"
              >
                Volver a la orden
              </Link>
            </div>
          ) : (
            <>
              {receiveMutation.error && (
                <div
                  className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  {getPurchaseOrderErrorMessage(receiveMutation.error)}
                </div>
              )}
              {/* Remount on updatedAt: after a 409 the hook re-invalidates
                  and the refetched order must reset the per-line defaults
                  (remaining quantities changed server-side). */}
              <ReceiveForm
                key={purchaseOrder.updatedAt}
                purchaseOrder={purchaseOrder}
                receivableLines={receivableLines}
                isPending={receiveMutation.isPending}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}
