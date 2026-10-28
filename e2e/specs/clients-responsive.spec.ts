import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const client = {
  id: 'client-1',
  name: 'Juan Pérez',
  identification: '12345678',
  identificationType: 'DNI',
  phone: '999888777',
  email: 'juan@example.com',
  address: null,
  isActive: true,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

const vehicle = {
  id: 'vehicle-1',
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'client-1',
  isActive: true,
};

test('desktop clients keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.route(/\/api\/clients(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [client], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await page.setViewportSize({ width: 1200, height: 800 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/clients');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('client-mobile-card')).toBeHidden();
});

test('mobile clients uses cards and detail navigation', async ({ page }) => {
  await page.route(/\/api\/clients(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [client], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await page.route(/\/api\/clients\/client-1$/, async (route) => {
    await route.fulfill({ json: client });
  });
  await page.route(/\/api\/vehicles(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [vehicle], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    });
  });
  await page.setViewportSize({ width: 375, height: 1000 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/clients');

  await expect(page.getByTestId('client-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();

  await page.goto('/clients/client-1');
  await expect(page.getByTestId('vehicle-list-mobile-card')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Volver a clientes' }))
    .toHaveAttribute('href', '/clients');
});
