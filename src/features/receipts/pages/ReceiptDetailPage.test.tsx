import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Receipt } from '../types';
import { ReceiptDetailPage } from './ReceiptDetailPage';

const { useReceiptMock, retryMutation, discardMutation } = vi.hoisted(() => ({
  useReceiptMock: vi.fn(),
  retryMutation: { mutate: vi.fn(), isPending: false, error: null },
  discardMutation: { mutate: vi.fn(), isPending: false, error: null },
}));

vi.mock('../hooks/use-receipt', () => ({
  useReceipt: () => useReceiptMock(),
}));
vi.mock('@/features/purchase-orders/hooks/use-purchase-orders', () => ({
  usePurchaseOrders: () => ({ purchaseOrders: [] }),
}));
vi.mock('@/features/purchase-orders/hooks/use-purchase-order', () => ({
  usePurchaseOrder: () => ({ data: undefined }),
}));
vi.mock('../hooks/use-receipt-mutations', () => ({
  useRetryReceiptOcr: () => retryMutation,
  useDiscardReceipt: () => discardMutation,
  useConfirmReceiptLot: () => ({ mutate: vi.fn(), isPending: false }),
  useConfirmReceiptPurchaseOrder: () => ({ mutate: vi.fn(), isPending: false }),
}));

const receipt: Receipt = {
  id: 'receipt-1',
  status: 'pending',
  mimeType: 'image/png',
  fileName: 'receipt.png',
  filePublicId: 'receipts/receipt-1',
  fileUrl: 'https://example.test/receipt.png',
  extracted: null,
  ocrModel: null,
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

describe('ReceiptDetailPage', () => {
  beforeEach(() => {
    useReceiptMock.mockReset();
    retryMutation.mutate.mockReset();
    discardMutation.mutate.mockReset();
  });

  it('places pending actions in the responsive content header', () => {
    useReceiptMock.mockReturnValue({
      data: receipt,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <ReceiptDetailPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: 'Volver a comprobantes' })
    ).toHaveAttribute('href', '/receipts');
    expect(screen.getByTestId('receipt-detail-actions')).toHaveClass(
      'flex-col',
      'sm:flex-row'
    );
    expect(screen.getByRole('button', { name: 'Reintentar OCR' })).toHaveClass(
      'w-full',
      'sm:w-auto'
    );
    expect(
      screen.getByRole('button', { name: 'Descartar comprobante' })
    ).toHaveClass('w-full', 'sm:w-auto');
  });

  it('hides pending actions for a confirmed receipt', () => {
    useReceiptMock.mockReturnValue({
      data: {
        ...receipt,
        status: 'confirmed',
        lotId: 'lot-1',
        lot: { id: 'lot-1', lotNumber: 'REC-receipt-1' },
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <ReceiptDetailPage />
      </MemoryRouter>
    );

    expect(
      screen.queryByTestId('receipt-detail-actions')
    ).not.toBeInTheDocument();
    expect(screen.getByText('REC-receipt-1')).toBeInTheDocument();
  });
});
