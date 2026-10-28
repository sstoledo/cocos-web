import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SALE_STATUS_LABELS, SaleStatusBadge } from './SaleStatusBadge';

describe('SaleStatusBadge', () => {
  it('renders Completada with a green style for completed sales', () => {
    render(<SaleStatusBadge status="completed" />);

    const badge = screen.getByText('Completada');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-success');
    expect(badge.className).toContain('text-success-foreground');
    expect(badge.className).toContain('text-caption');
  });

  it('renders Cancelada with a red style defensively', () => {
    render(<SaleStatusBadge status="cancelled" />);

    const badge = screen.getByText('Cancelada');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-destructive');
    expect(badge.className).toContain('text-destructive-foreground');
  });

  it('exposes a label for every sale status', () => {
    expect(SALE_STATUS_LABELS.completed).toBe('Completada');
    expect(SALE_STATUS_LABELS.cancelled).toBe('Cancelada');
  });
});
