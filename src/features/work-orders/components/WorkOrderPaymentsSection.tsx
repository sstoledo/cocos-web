import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SectionCard } from '@/components/ui/SectionCard';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PAYMENT_METHOD_LABELS } from '@/features/sales/components/PaymentMethodBadge';
import type { PaymentMethod } from '@/features/sales/types';
import { formatCents, toCents } from '@/lib/cents';
import { Dialog } from '@base-ui/react/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateWorkOrderPayment } from '../hooks/use-create-work-order-payment';
import { useWorkOrderPayments } from '../hooks/use-work-order-payments';
import { getWorkOrderPaymentErrorMessage } from '../lib/work-order-payment-error-messages';
import {
  type WorkOrderPaymentFormValues,
  createWorkOrderPaymentSchema,
} from '../schemas/work-order-payment-schema';
import type { WorkOrder } from '../types';
import { WorkOrderPaymentStatusBadge } from './WorkOrderPaymentStatusBadge';

const PAYMENT_METHOD_OPTIONS = (
  Object.entries(PAYMENT_METHOD_LABELS) as Array<[PaymentMethod, string]>
).map(([value, label]) => ({ value, label }));

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

type PaymentFormProps = {
  remainingAmount: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (values: WorkOrderPaymentFormValues) => void;
  onCancel: () => void;
};

function PaymentForm({
  remainingAmount,
  isPending,
  error,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkOrderPaymentFormValues>({
    resolver: zodResolver(createWorkOrderPaymentSchema(remainingAmount)),
    defaultValues: {
      amount: '',
      paymentMethod: '' as WorkOrderPaymentFormValues['paymentMethod'],
      note: '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 space-y-4"
      noValidate
    >
      {error != null && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          {getWorkOrderPaymentErrorMessage(error)}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="payment-amount">Monto</Label>
        {/* Text input (not type=number): the decimal string must survive
            validation verbatim, same convention as cash closing (F10.5). */}
        <Input
          id="payment-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={errors.amount ? 'true' : 'false'}
          {...register('amount')}
        />
        {errors.amount && (
          <p className="text-sm text-destructive" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-method">Método de pago</Label>
        <Select
          id="payment-method"
          options={PAYMENT_METHOD_OPTIONS}
          placeholder="Seleccionar método de pago"
          error={errors.paymentMethod?.message}
          {...register('paymentMethod')}
        />
      </div>

      <Textarea
        label="Nota (opcional)"
        id="payment-note"
        {...register('note')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registrando…' : 'Registrar pago'}
        </Button>
      </div>
    </form>
  );
}

export type WorkOrderPaymentsSectionProps = {
  workOrder: WorkOrder;
  canManage: boolean;
};

export function WorkOrderPaymentsSection({
  workOrder,
  canManage,
}: WorkOrderPaymentsSectionProps) {
  const paymentsQuery = useWorkOrderPayments(workOrder.id);
  const createPayment = useCreateWorkOrderPayment();
  const [dialogOpen, setDialogOpen] = useState(false);

  const remainingCents =
    toCents(workOrder.totalAmount) - toCents(workOrder.paidAmount);
  const remainingAmount = formatCents(remainingCents);
  const canRegister =
    canManage && workOrder.status !== 'cancelled' && remainingCents > 0;

  function handleSubmit(values: WorkOrderPaymentFormValues) {
    createPayment.mutate(
      {
        workOrderId: workOrder.id,
        payload: {
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          note: values.note,
        },
      },
      { onSuccess: () => setDialogOpen(false) }
    );
  }

  return (
    <SectionCard title="Pagos">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <WorkOrderPaymentStatusBadge status={workOrder.paymentStatus} />
          <p className="text-sm text-muted-foreground">
            Pagado {workOrder.paidAmount} de {workOrder.totalAmount} · Saldo{' '}
            {remainingAmount}
          </p>
        </div>

        {paymentsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando pagos…</p>
        ) : paymentsQuery.error ? (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
            role="alert"
          >
            No se pudieron cargar los pagos. Intentá de nuevo más tarde.
          </div>
        ) : paymentsQuery.data && paymentsQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Método</th>
                  <th className="px-3 py-2 font-medium">Monto</th>
                  <th className="px-3 py-2 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {paymentsQuery.data.map((payment) => (
                  <tr key={payment.id} className="border-b border-border">
                    <td className="px-3 py-2">
                      {formatDateTime(payment.paidAt)}
                    </td>
                    <td className="px-3 py-2">
                      {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                    </td>
                    <td className="px-3 py-2">{payment.amount}</td>
                    <td className="px-3 py-2">{payment.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay pagos registrados.
          </p>
        )}

        {canRegister && (
          <>
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Registrar pago
            </Button>
            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim" />
                <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <Dialog.Popup className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg outline-none">
                    <Dialog.Title className="text-lg font-semibold">
                      Registrar pago
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                      Saldo restante: {remainingAmount}
                    </Dialog.Description>
                    <PaymentForm
                      remainingAmount={remainingAmount}
                      isPending={createPayment.isPending}
                      error={createPayment.error}
                      onSubmit={handleSubmit}
                      onCancel={() => setDialogOpen(false)}
                    />
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        )}
      </div>
    </SectionCard>
  );
}
