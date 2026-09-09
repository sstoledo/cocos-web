import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SALE_STATUS_LABELS, SaleStatusBadge } from './SaleStatusBadge';

describe('SaleStatusBadge', () => {
  it('renders Completada with a green style for completed sales', () => {
    render(<SaleStatusBadge status="completed" />);

    const badge = screen.getByText('Completada');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
  });

  it('renders Cancelada with a red style defensively', () => {
    render(<SaleStatusBadge status="cancelled" />);

    const badge = screen.getByText('Cancelada');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
  });

  it('exposes a label for every sale status', () => {
    expect(SALE_STATUS_LABELS.completed).toBe('Completada');
    expect(SALE_STATUS_LABELS.cancelled).toBe('Cancelada');
  });
});
