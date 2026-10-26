import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const sale = {
  id: 'sale-responsive',
  saleNumber: 'VTA-2026-000123',
  clientId: null,
  client: null,
  paymentMethod: 'cash',
  status: 'completed',
  totalAmount: '18450.00',
  createdAt: '2026-10-25T12:00:00.000Z',
};

async function stubSales(page: import('@playwright/test').Page, status: string) {
  await page.route(/\/api\/sales(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        data: [{ ...sale, status }],
        meta: { page: 1, limit: 10, total: 1 },
      },
    });
  });
}

test('desktop sales keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await stubSales(page, 'completed');
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/sales');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('sale-mobile-card')).toBeHidden();
});

test('mobile sales and refunds use their designed cards', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await stubSales(page, 'completed');
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/sales');

  await expect(page.getByTestId('sale-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();

  await stubSales(page, 'cancelled');
  await page.goto('/refunds');
  await expect(page.getByTestId('refund-mobile-card')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver', exact: true }))
    .toBeVisible();
});
