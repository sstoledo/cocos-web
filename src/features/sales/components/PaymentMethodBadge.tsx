import type { PaymentMethod } from '../types';

// Single source for payment method labels — reused by the list table,
// the detail page and the checkout select (design D5).
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

export function PaymentMethodBadge({
  method,
  variant = 'plain',
}: {
  method: PaymentMethod;
  variant?: 'plain' | 'badge';
}) {
  return (
    <span
      className={
        variant === 'badge'
          ? 'inline-flex rounded-full bg-muted px-2 py-1 text-caption text-foreground'
          : 'text-muted-foreground'
      }
    >
      {PAYMENT_METHOD_LABELS[method]}
    </span>
  );
}
