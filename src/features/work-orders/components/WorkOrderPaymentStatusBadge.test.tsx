import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WorkOrderPaymentStatus } from '../types';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  WorkOrderPaymentStatusBadge,
} from './WorkOrderPaymentStatusBadge';

const cases: Array<{
  status: WorkOrderPaymentStatus;
  label: string;
  style: string;
}> = [
  {
    status: 'pending',
    label: 'Pendiente',
    style: 'bg-muted text-muted-foreground',
  },
  {
    status: 'partial',
    label: 'Parcial',
    style: 'bg-warning text-warning-foreground',
  },
  {
    status: 'paid',
    label: 'Pagada',
    style: 'bg-success text-success-foreground',
  },
];

describe('WorkOrderPaymentStatusBadge', () => {
  for (const { status, label, style } of cases) {
    it(`maps ${status} to the approved token treatment`, () => {
      render(<WorkOrderPaymentStatusBadge status={status} />);

      expect(screen.getByText(label)).toHaveClass(style);
    });
  }

  it('uses Pagada for the paid state', () => {
    expect(PAYMENT_STATUS_LABELS.paid).toBe('Pagada');
    expect(PAYMENT_STATUS_STYLES.partial).toContain('bg-warning');
  });
});
