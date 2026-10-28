import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const workOrder = {
  id: 'wo-responsive',
  orderNumber: 'OT-2026-000123',
  clientId: 'client-1',
  vehicleId: 'vehicle-1',
  client: { id: 'client-1', name: 'Juan Pérez' },
  vehicle: {
    id: 'vehicle-1',
    plate: 'ABC123',
    brand: 'Ford',
    model: 'Fiesta',
  },
  description: 'Cambio de aceite',
  status: 'in_progress',
  totalAmount: '145.00',
  paidAmount: '80.00',
  paymentStatus: 'partial',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
  createdAt: '2026-10-26T12:00:00.000Z',
  updatedAt: '2026-10-26T12:00:00.000Z',
};

async function openStubbedList(
  page: import('@playwright/test').Page,
  mobile = false
) {
  await page.route(/\/api\/work-orders(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        data: [workOrder],
        meta: { page: 1, limit: 10, total: 1 },
      },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/work-orders');
  if (mobile) {
    await expect(page.getByTestId('work-order-mobile-card')).toBeVisible();
    return;
  }
  await expect(
    page.getByRole('cell', { name: 'OT-2026-000123', exact: true })
  ).toBeVisible();
}

test('desktop work orders keeps the eight-column table', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedList(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('work-order-mobile-card')).toBeHidden();
});

test('mobile work orders uses complete cards with detail action', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedList(page, true);

  const card = page.getByTestId('work-order-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('ABC123');
  await expect(card).toContainText('Cobro: Parcial');
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Ver detalle', exact: true }))
    .toHaveAttribute('href', '/work-orders/wo-responsive');
});
