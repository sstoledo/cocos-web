import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const purchaseOrder = {
  id: 'po-responsive',
  purchaseOrderNumber: 'COM-2026-000123',
  supplierId: 'supplier-1',
  status: 'partially_received',
  notes: null,
  estimatedTotal: '455.00',
  supplier: { id: 'supplier-1', name: 'Repuestos Lima SAC' },
  lines: [],
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

async function openStubbedList(page: import('@playwright/test').Page) {
  await page.route(/\/api\/purchase-orders(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        data: [purchaseOrder],
        meta: { page: 1, limit: 10, total: 1 },
      },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/purchase-orders');
}

test('desktop purchase orders keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedList(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('purchase-order-mobile-card')).toBeHidden();
});

test('mobile purchase orders uses cards with status and estimated total', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedList(page);

  const card = page.getByTestId('purchase-order-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('COM-2026-000123');
  await expect(card).toContainText('Recibida parcial');
  await expect(card).toContainText('455.00');
  await expect(page.getByRole('table')).toBeHidden();
});
