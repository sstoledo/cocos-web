import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const closing = {
  id: 'closing-1',
  periodStart: '2026-09-23T10:00:00.000Z',
  periodEnd: '2026-09-23T20:00:00.000Z',
  expectedCash: '1250.00',
  expectedCard: '3400.50',
  expectedTransfer: '800.00',
  workOrderPaymentsCash: '100.00',
  workOrderPaymentsCard: '50.00',
  workOrderPaymentsTransfer: '25.00',
  workOrderPaymentsCount: 3,
  declaredCash: '1300.00',
  difference: '50.00',
  salesCount: 12,
  notes: null,
  createdAt: '2026-09-23T20:00:00.000Z',
  closedBy: { id: 'u1', name: 'Ana García' },
};

async function stubClosings(page: import('@playwright/test').Page) {
  await page.route(/\/api\/cash-closings(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [closing], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
}

test('desktop closings keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await stubClosings(page);
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/cash-closings');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('closing-mobile-card')).toBeHidden();
});

test('mobile closings uses cards with verbatim money and navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await stubClosings(page);
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/cash-closings');

  const card = page.getByTestId('closing-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('1250.00');
  await expect(card).toContainText('1300.00');
  await expect(page.getByRole('table')).toBeHidden();

  await page.route(/\/api\/cash-closings\/closing-1$/, async (route) => {
    await route.fulfill({ json: closing });
  });
  await page.getByTestId('closing-mobile-card').getByRole('link').click();
  await expect(page).toHaveURL(/\/cash-closings\/closing-1$/);
  await expect(page.getByText('Efectivo esperado')).toBeVisible();
});
