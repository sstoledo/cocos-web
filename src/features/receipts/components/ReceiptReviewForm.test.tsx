import type { Product } from '@/features/products/types';
import type { PurchaseOrder } from '@/features/purchase-orders/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Receipt } from '../types';
import { ReceiptReviewForm } from './ReceiptReviewForm';

const product: Product = {
  id: 'product-1',
  code: 'ACE-001',
  name: 'Aceite sintético 5W30',
  price: '25.00',
  isActive: true,
  presentation: { id: 'presentation-1', name: 'Litro' },
  brand: { id: 'brand-1', name: 'Castrol' },
  category: { id: 'category-1', name: 'Lubricantes' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const purchaseOrder: PurchaseOrder = {
  id: 'po-1',
  purchaseOrderNumber: 'COM-2026-000001',
  supplierId: 'supplier-1',
  status: 'ordered',
  estimatedTotal: '20.50',
  supplier: { id: 'supplier-1', name: 'Proveedor Uno' },
  lines: [
    {
      id: 'line-1',
      productId: product.id,
      quantityOrdered: 8,
      quantityReceived: 3,
      estimatedCostPrice: '10.00',
      product: {
        id: product.id,
        code: product.code,
        name: product.name,
      },
    },
  ],
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

function makeReceipt(extracted: Receipt['extracted']): Receipt {
  return {
    id: 'receipt-1',
    status: 'pending',
    mimeType: 'image/png',
    fileName: 'factura.png',
    filePublicId: 'receipts/factura',
    fileUrl: 'https://cdn.example.com/factura.png',
    extracted,
    ocrModel: 'gemini-test',
    lotId: null,
    lot: null,
    purchaseOrderId: null,
    purchaseOrder: null,
    supplierId: 'supplier-1',
    supplier: { id: 'supplier-1', name: 'Proveedor Uno' },
    confirmedAt: null,
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-25T10:00:00.000Z',
  };
}

const extraction: NonNullable<Receipt['extracted']> = {
  supplierName: 'Proveedor Uno',
  documentNumber: 'F-001',
  issueDate: '2026-10-25',
  items: [
    {
      description: 'Aceite sintético 5W30',
      code: 'ACE-001',
      quantity: 2,
      unitPrice: 10.25,
    },
  ],
};

let suggestionProducts: Product[] = [];

function json(body: unknown) {
  return Promise.resolve({ ok: true, json: async () => body } as Response);
}

function renderForm(receipt: Receipt) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ReceiptReviewForm receipt={receipt} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  suggestionProducts = [product];
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/products/search/semantic')) {
        return json({ data: suggestionProducts });
      }
      if (url.includes('/suppliers')) {
        return json({ data: [], meta: { page: 1, limit: 20, total: 0 } });
      }
      if (url.includes('/purchase-orders?')) {
        const isOrdered = url.includes('status=ordered');
        return json({
          data: isOrdered ? [purchaseOrder] : [],
          meta: { page: 1, limit: 50, total: isOrdered ? 1 : 0 },
        });
      }
      if (url.endsWith('/purchase-orders/po-1')) {
        return json(purchaseOrder);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    })
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('ReceiptReviewForm confirmation guards', () => {
  it('disables confirmation when OCR extraction is null', () => {
    renderForm(makeReceipt(null));

    expect(
      screen.getByRole('button', { name: 'Confirmar comprobante' })
    ).toBeDisabled();
    expect(
      screen.getByText('Primero se debe completar la extracción OCR.')
    ).toBeInTheDocument();
  });

  it('disables confirmation until a product is matched', async () => {
    suggestionProducts = [];
    const user = userEvent.setup();
    renderForm(makeReceipt(extraction));

    await user.type(
      screen.getByLabelText('Fecha de vencimiento'),
      '2027-01-31'
    );

    expect(
      screen.getByRole('button', { name: 'Confirmar comprobante' })
    ).toBeDisabled();
  });

  it('disables confirmation with a suggested product until expiry is entered', async () => {
    renderForm(makeReceipt(extraction));

    expect(
      await screen.findByDisplayValue('ACE-001 — Aceite sintético 5W30')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar comprobante' })
    ).toBeDisabled();
  });

  it('requires each OCR line to be mapped to a purchase-order line', async () => {
    const user = userEvent.setup();
    renderForm(makeReceipt(extraction));

    await user.selectOptions(
      screen.getByLabelText('Destino'),
      'purchase-order'
    );
    await user.selectOptions(
      await screen.findByLabelText('Orden de compra'),
      'po-1'
    );
    const lineSelect = await screen.findByLabelText('Línea de la orden');
    expect(lineSelect).toHaveTextContent('Pedidas: 8 — Pendientes: 5');
    await user.type(
      screen.getByLabelText('Fecha de vencimiento'),
      '2027-01-31'
    );

    const confirm = screen.getByRole('button', {
      name: 'Confirmar comprobante',
    });
    expect(confirm).toBeDisabled();

    await user.selectOptions(lineSelect, 'line-1');
    expect(confirm).toBeEnabled();
  });
});
