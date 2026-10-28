import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const service = {
  id: 'service-1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  price: '150.00',
  estimatedDuration: 30,
  isActive: true,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

const supplier = {
  id: 'supplier-1',
  name: 'Repuestos Lima SAC',
  phone: '+51 1 456 7890',
  email: 'ventas@repuestoslima.pe',
  address: 'Av. Argentina 1234, Lima',
  isActive: true,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

test('desktop services keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.route(/\/api\/services(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [service], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await page.setViewportSize({ width: 1200, height: 800 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/services');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('service-mobile-card')).toBeHidden();
});

test('mobile services exposes filters and service cards', async ({ page }) => {
  await page.route(/\/api\/services(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [service], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await page.setViewportSize({ width: 375, height: 1000 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/services');

  await expect(page.getByTestId('service-mobile-card')).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Buscar servicios' }))
    .toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Filtrar por estado' }))
    .toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();
});

test('mobile suppliers uses cards and detail back navigation', async ({
  page,
}) => {
  await page.route(/\/api\/suppliers(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [supplier], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await page.setViewportSize({ width: 375, height: 1000 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/suppliers');

  await expect(page.getByTestId('supplier-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();

  await page.route(/\/api\/suppliers\/supplier-1$/, async (route) => {
    await route.fulfill({ json: supplier });
  });
  await page.route(/\/api\/purchase-orders(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } },
    });
  });
  await page.route(/\/api\/lots(?:\?.*)?$/, async (route) => {
    expect(route.request().url()).toContain('supplierId=supplier-1');
    await route.fulfill({
      json: { data: [], meta: { page: 1, limit: 10, total: 0 } },
    });
  });
  await page.goto('/suppliers/supplier-1');
  await expect(page.getByRole('link', { name: 'Volver a proveedores' }))
    .toHaveAttribute('href', '/suppliers');
});
