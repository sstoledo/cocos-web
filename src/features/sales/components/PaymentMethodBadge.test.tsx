import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethodBadge,
} from './PaymentMethodBadge';

describe('PaymentMethodBadge', () => {
  it('renders the label for each payment method', () => {
    render(
      <>
        <PaymentMethodBadge method="cash" />
        <PaymentMethodBadge method="card" />
        <PaymentMethodBadge method="transfer" />
      </>
    );

    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta')).toBeInTheDocument();
    expect(screen.getByText('Transferencia')).toBeInTheDocument();
  });

  it('renders a neutral badge variant for the refunds list', () => {
    render(<PaymentMethodBadge method="cash" variant="badge" />);

    expect(screen.getByText('Efectivo')).toHaveClass(
      'rounded-full',
      'bg-muted',
      'text-caption',
      'text-foreground'
    );
  });

  it('exposes a label for every payment method', () => {
    expect(PAYMENT_METHOD_LABELS).toEqual({
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
    });
  });
});
