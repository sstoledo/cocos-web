import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProformaStatus } from '../types';
import { ProformaStatusBadge } from './ProformaStatusBadge';

const cases: Array<{
  status: ProformaStatus;
  label: string;
  style: string;
}> = [
  { status: 'draft', label: 'Borrador', style: 'bg-muted' },
  { status: 'sent', label: 'Enviada', style: 'bg-primary' },
  { status: 'accepted', label: 'Aceptada', style: 'bg-success' },
  { status: 'rejected', label: 'Rechazada', style: 'bg-destructive' },
  { status: 'converted', label: 'Convertida', style: 'border-primary' },
];

describe('ProformaStatusBadge', () => {
  for (const { status, label, style } of cases) {
    it(`maps ${status} to the approved token treatment`, () => {
      render(<ProformaStatusBadge status={status} />);

      expect(screen.getByText(label)).toHaveClass(style);
    });
  }

  it('uses muted text and a primary outline for converted proformas', () => {
    render(<ProformaStatusBadge status="converted" />);

    expect(screen.getByText('Convertida')).toHaveClass(
      'bg-muted',
      'text-primary',
      'border-primary'
    );
  });
});
