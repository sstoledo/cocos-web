import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Receipt } from '../types';
import { confirmReceiptLot } from './confirm-receipt-lot';
import { confirmReceiptPurchaseOrder } from './confirm-receipt-purchase-order';
import { createReceipt } from './create-receipt';
import { discardReceipt } from './discard-receipt';
import { getReceipt } from './get-receipt';
import { getReceipts } from './get-receipts';
import { retryReceiptOcr } from './retry-receipt-ocr';

const receipt: Receipt = {
  id: 'receipt-1',
  status: 'pending',
  mimeType: 'image/png',
  fileName: 'factura.png',
  filePublicId: 'receipts/factura',
  fileUrl: 'https://cdn.example.com/factura.png',
  extracted: null,
  ocrModel: null,
  lotId: null,
  lot: null,
  purchaseOrderId: null,
  purchaseOrder: null,
  supplierId: null,
  supplier: null,
  confirmedAt: null,
  createdAt: '2026-10-25T10:00:00.000Z',
  updatedAt: '2026-10-25T10:00:00.000Z',
};

function okJson(body: unknown) {
  return { ok: true, json: async () => body };
}

function errorJson(status: number, errorCode?: string) {
  return {
    ok: false,
    status,
    json: async () => ({ message: 'Error', errorCode }),
  };
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('receipt read APIs', () => {
  it('lists receipts without a status parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson([receipt]) as Response);

    await expect(getReceipts()).resolves.toEqual([receipt]);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/receipts', {
      credentials: 'include',
    });
  });

  it('lists receipts filtered by status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson([receipt]) as Response);

    await getReceipts('discarded');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/receipts?status=discarded',
      { credentials: 'include' }
    );
  });

  it('gets one receipt and maps failures to ApiError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson(receipt) as Response);

    await expect(getReceipt('receipt-1')).resolves.toEqual(receipt);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/receipts/receipt-1',
      { credentials: 'include' }
    );

    vi.mocked(fetch).mockResolvedValueOnce(
      errorJson(404, 'RECEIPT_NOT_FOUND') as Response
    );
    const error = await getReceipt('missing').catch((value) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      errorCode: 'RECEIPT_NOT_FOUND',
    });
  });
});

describe('createReceipt', () => {
  it.each(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])(
    'uploads %s as multipart file',
    async (mimeType) => {
      vi.mocked(fetch).mockResolvedValueOnce(okJson(receipt) as Response);
      const file = new File(['receipt'], 'factura', { type: mimeType });

      await createReceipt(file);

      const [url, options] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe('http://localhost:3000/api/receipts');
      expect(options).toMatchObject({
        method: 'POST',
        credentials: 'include',
      });
      expect(options?.body).toBeInstanceOf(FormData);
      expect((options?.body as FormData).get('file')).toBe(file);
      expect(options?.headers).toBeUndefined();
    }
  );

  it('rejects unsupported files before fetch with a friendly message', async () => {
    const file = new File(['text'], 'factura.txt', { type: 'text/plain' });

    await expect(createReceipt(file)).rejects.toThrow(
      'El comprobante debe ser un PDF o una imagen JPEG, PNG o WebP.'
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects files over 10 MB before fetch with a friendly message', async () => {
    const file = new File(['x'], 'factura.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 });

    await expect(createReceipt(file)).rejects.toThrow(
      'El comprobante no puede superar los 10 MB.'
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([400, 413, 415])(
    'maps upload HTTP %i to ApiError',
    async (status) => {
      vi.mocked(fetch).mockResolvedValueOnce(errorJson(status) as Response);
      const file = new File(['receipt'], 'factura.pdf', {
        type: 'application/pdf',
      });

      const error = await createReceipt(file).catch((value) => value);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status });
    }
  );
});

describe('receipt action APIs', () => {
  it('discards a pending receipt', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson(receipt) as Response);

    await discardReceipt('receipt-1');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/receipts/receipt-1/discard',
      { method: 'POST', credentials: 'include' }
    );
  });

  it.each([502, 503])('surfaces OCR errorCode on HTTP %i', async (status) => {
    vi.mocked(fetch).mockResolvedValueOnce(
      errorJson(status, 'OCR_EXTRACTION_FAILED') as Response
    );

    const error = await retryReceiptOcr('receipt-1').catch((value) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status,
      errorCode: 'OCR_EXTRACTION_FAILED',
    });
  });

  it('retries OCR with the contract method and URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson(receipt) as Response);

    await retryReceiptOcr('receipt-1');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/receipts/receipt-1/ocr',
      { method: 'POST', credentials: 'include' }
    );
  });
});

describe('receipt confirmation APIs', () => {
  it('posts a standalone lot confirmation and returns its wrapper', async () => {
    const responseBody = { lot: { id: 'lot-1' }, receipt };
    vi.mocked(fetch).mockResolvedValueOnce(okJson(responseBody) as Response);
    const payload = {
      supplierId: 'supplier-1',
      lotNumber: 'LOTE-1',
      notes: 'Recepción revisada',
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          costPrice: 12.5,
          expirationDate: '2027-01-31',
        },
      ],
    };

    await expect(confirmReceiptLot('receipt-1', payload)).resolves.toEqual(
      responseBody
    );
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/receipts/receipt-1/confirm-lot',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  });

  it('posts a purchase-order confirmation with decimal money strings', async () => {
    const responseBody = { purchaseOrder: { id: 'po-1' }, receipt };
    vi.mocked(fetch).mockResolvedValueOnce(okJson(responseBody) as Response);
    const payload = {
      purchaseOrderId: 'po-1',
      lines: [
        {
          lineId: 'line-1',
          receivedQty: 3,
          expirationDate: '2027-02-28',
          actualCostPrice: '10.25',
        },
      ],
    };

    await expect(
      confirmReceiptPurchaseOrder('receipt-1', payload)
    ).resolves.toEqual(responseBody);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/receipts/receipt-1/confirm-purchase-order',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  });

  it('surfaces conflict errorCode without hiding it in a generic Error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      errorJson(409, 'RECEIPT_ALREADY_CONFIRMED') as Response
    );

    const error = await confirmReceiptLot('receipt-1', {
      supplierId: 'supplier-1',
      items: [],
    }).catch((value) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      errorCode: 'RECEIPT_ALREADY_CONFIRMED',
    });
  });
});
