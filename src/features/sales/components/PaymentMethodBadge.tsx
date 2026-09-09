import type { PaymentMethod } from '../types';

// Single source for payment method labels — reused by the list table,
// the detail page and the checkout select (design D5).
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className="text-muted-foreground">
      {PAYMENT_METHOD_LABELS[method]}
    </span>
  );
}
