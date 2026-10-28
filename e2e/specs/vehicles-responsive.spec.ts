import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const vehicle = {
  id: 'vehicle-1',
  plate: 'ABC123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Blanco',
  clientId: 'client-1',
  isActive: true,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

async function openStubbedList(page: import('@playwright/test').Page) {
  await page.route(/\/api\/vehicles(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [vehicle], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/vehicles');
}

test('desktop vehicles keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedList(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('vehicle-mobile-card')).toBeHidden();
});

test('mobile vehicles uses cards with status and actions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedList(page);

  const card = page.getByTestId('vehicle-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('ABC123');
  await expect(card).toContainText('Activo');
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByLabel('Editar ABC123').last()).toBeVisible();
});
