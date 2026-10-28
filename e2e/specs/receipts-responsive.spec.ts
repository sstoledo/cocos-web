import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const receipt = {
  id: 'receipt-responsive',
  status: 'pending',
  mimeType: 'image/png',
  fileName: 'receipt-responsive.png',
  filePublicId: 'receipts/receipt-responsive',
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

async function openStubbedList(page: import('@playwright/test').Page) {
  await page.route(/\/api\/receipts(?:\?.*)?$/, async (route) => {
    await route.fulfill({ json: [receipt] });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/receipts');
}

test('desktop receipts keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedList(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('receipt-mobile-card')).toBeHidden();
});

test('mobile receipts uses cards with OCR extraction summary', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedList(page);

  const card = page.getByTestId('receipt-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('receipt-responsive.png');
  await expect(card).toContainText('Pendiente');
  await expect(card).toContainText('DISTRIBUIDORA ANDINA S.A.');
  await expect(page.getByRole('table')).toBeHidden();
});
