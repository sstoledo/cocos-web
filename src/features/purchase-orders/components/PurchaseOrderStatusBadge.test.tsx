import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PurchaseOrderStatus } from '../types';
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge';

const cases: Array<{
  status: PurchaseOrderStatus;
  label: string;
  style: string;
}> = [
  { status: 'draft', label: 'Borrador', style: 'bg-muted' },
  { status: 'ordered', label: 'Ordenada', style: 'bg-primary' },
  {
    status: 'partially_received',
    label: 'Recibida parcial',
    style: 'bg-warning',
  },
  { status: 'received', label: 'Recibida', style: 'bg-success' },
  { status: 'cancelled', label: 'Cancelada', style: 'bg-destructive' },
];

describe('PurchaseOrderStatusBadge', () => {
  for (const { status, label, style } of cases) {
    it(`maps ${status} to the approved token treatment`, () => {
      render(<PurchaseOrderStatusBadge status={status} />);

      expect(screen.getByText(label)).toHaveClass(style);
    });
  }
});
