import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Receipt } from '../types';
import { ReceiptTable } from './ReceiptTable';

const receipt: Receipt = {
  id: 'receipt-1',
  status: 'pending',
  mimeType: 'image/png',
  fileName: 'receipt.png',
  filePublicId: 'receipts/receipt-1',
  fileUrl: 'https://example.test/receipt.png',
  extracted: {
    supplierName: 'DISTRIBUIDORA ANDINA S.A.',
    documentNumber: 'B-001234',
    issueDate: '2026-10-25',
    items: [
      {
        description: 'Filtro de aceite',
        code: 'FAP-220',
        quantity: 4,
        unitPrice: 45.5,
      },
    ],
  },
  ocrModel: 'gemini-3.5-flash-lite',
  lotId: null,
  lot: null,
  purchaseOrderId: null,
  purchaseOrder: null,
  supplierId: null,
  supplier: null,
  confirmedAt: null,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

describe('ReceiptTable', () => {
  it('renders extraction data and the pending review link', () => {
    render(
      <MemoryRouter>
        <ReceiptTable receipts={[receipt]} />
      </MemoryRouter>
    );

    expect(
      screen.getAllByText('DISTRIBUIDORA ANDINA S.A. · B-001234 · 1 ítem(s)')
        .length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Pendiente')[0]).toHaveClass('bg-warning');
    expect(screen.getAllByRole('link', { name: 'Revisar' })[0]).toHaveAttribute(
      'href',
      '/receipts/receipt-1'
    );
  });

  it('renders the approved mobile receipt card', () => {
    render(
      <MemoryRouter>
        <ReceiptTable receipts={[receipt]} />
      </MemoryRouter>
    );

    const card = screen.getByTestId('receipt-mobile-card');
    expect(card).toHaveTextContent('receipt.png');
    expect(card).toHaveTextContent('Pendiente');
    expect(card).toHaveTextContent('DISTRIBUIDORA ANDINA S.A.');
  });

  it('uses success for confirmed receipts', () => {
    render(
      <MemoryRouter>
        <ReceiptTable receipts={[{ ...receipt, status: 'confirmed' }]} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Confirmado')[0]).toHaveClass('bg-success');
  });

  it('uses destructive for discarded receipts and keeps empty state', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ReceiptTable receipts={[{ ...receipt, status: 'discarded' }]} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Descartado')[0]).toHaveClass('bg-destructive');

    rerender(
      <MemoryRouter>
        <ReceiptTable receipts={[]} />
      </MemoryRouter>
    );
    expect(
      screen.getByText('No se encontraron comprobantes.')
    ).toBeInTheDocument();
  });
});
