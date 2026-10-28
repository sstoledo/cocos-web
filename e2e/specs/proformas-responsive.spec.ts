import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const proforma = {
  id: 'proforma-responsive',
  proformaNumber: 'PRO-2026-000045',
  clientId: 'client-1',
  branchId: null,
  employeeId: null,
  status: 'accepted',
  totalAmount: '18450.00',
  notes: null,
  convertedSaleId: null,
  isActive: true,
  client: { id: 'client-1', name: 'Juan Pérez' },
  branch: null,
  employee: null,
  products: [],
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
  deletedAt: null,
};

async function openStubbedList(page: import('@playwright/test').Page) {
  await page.route(/\/api\/proformas(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        data: [proforma],
        meta: { page: 1, limit: 10, total: 1 },
      },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/proformas');
}

test('desktop proformas keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedList(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('proforma-mobile-card')).toBeHidden();
});

test('mobile proformas uses cards with status and total', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedList(page);

  const card = page.getByTestId('proforma-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('PRO-2026-000045');
  await expect(card).toContainText('Aceptada');
  await expect(card).toContainText('18450.00');
  await expect(page.getByRole('table')).toBeHidden();
});
