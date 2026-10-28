import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const receipt = {
  id: 'receipt-responsive',
  status: 'pending',
  mimeType: 'image/png',
  fileName: 'receipt-responsive.png',
  filePublicId: 'receipts/receipt-responsive',
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

async function openStubbedDetail(page: import('@playwright/test').Page) {
  await page.route(/\/api\/receipts\/receipt-responsive$/, async (route) => {
    await route.fulfill({ json: receipt });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/receipts/receipt-responsive');
  await expect(page.getByTestId('receipt-detail-actions')).toBeVisible();
}

test('desktop receipt detail keeps retry and discard in content header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedDetail(page);

  await expect(page.getByRole('button', { name: 'Reintentar OCR' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Descartar comprobante' }))
    .toBeVisible();
});

test('mobile receipt detail keeps full-width pending actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedDetail(page);

  await expect(page.getByTestId('receipt-detail-actions')).toHaveClass(
    /flex-col/
  );
  await expect(page.getByRole('button', { name: 'Reintentar OCR' }))
    .toHaveClass(/w-full/);
  await expect(page.getByRole('button', { name: 'Confirmar comprobante' }))
    .toBeDisabled();
});
