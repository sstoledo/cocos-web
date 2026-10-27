import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WorkOrderStatus } from '../types';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  WorkOrderStatusBadge,
} from './WorkOrderStatusBadge';

const cases: Array<{
  status: WorkOrderStatus;
  label: string;
  colorClass: string;
}> = [
  { status: 'pending', label: 'Pendiente', colorClass: 'bg-warning' },
  { status: 'in_progress', label: 'En progreso', colorClass: 'bg-primary' },
  { status: 'done', label: 'Finalizada', colorClass: 'bg-success' },
  { status: 'cancelled', label: 'Cancelada', colorClass: 'bg-destructive' },
];

describe('WorkOrderStatusBadge', () => {
  it('maps every status to a style and a label', () => {
    expect(Object.keys(STATUS_STYLES)).toEqual([
      'pending',
      'in_progress',
      'done',
      'cancelled',
    ]);
    expect(Object.keys(STATUS_LABELS)).toEqual([
      'pending',
      'in_progress',
      'done',
      'cancelled',
    ]);
  });

  for (const { status, label, colorClass } of cases) {
    it(`renders the ${status} status with its label and color`, () => {
      render(<WorkOrderStatusBadge status={status} />);

      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(colorClass);
    });
  }
});
