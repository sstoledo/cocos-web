import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const lot = {
  id: 'lot-responsive',
  lotNumber: 'COM-2026-000123-R1',
  supplier: { id: 'supplier-1', name: 'Repuestos Lima SAC' },
  receivedAt: '2026-10-25T12:00:00.000Z',
  items: [
    {
      id: 'item-1',
      product: { id: 'product-1', name: 'Filtro de aceite' },
      quantity: 10,
      remainingQuantity: 4,
      costPrice: '45.50',
      expirationDate: '2099-12-31',
    },
  ],
};

const movement = {
  id: 'movement-1',
  type: 'entry',
  quantity: 4,
  reason: 'Receive COM-2026-000123',
  createdAt: '2026-10-25T12:00:00.000Z',
  lotItem: { lot: { lotNumber: 'COM-2026-000123-R1' } },
};

test('desktop lots keeps the table and hides mobile cards', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.route(/\/api\/lots(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [lot], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/lots');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('lot-mobile-card')).toBeHidden();
});

test('mobile lots uses cards with stock status', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.route(/\/api\/lots(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [lot], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/lots');

  const card = page.getByTestId('lot-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('COM-2026-000123-R1');
  await expect(card).toContainText('En stock');
  await expect(page.getByRole('table')).toBeHidden();
});

test('mobile stock movements uses cards and back navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.route(/\/api\/products\/product-1(?:\/(?!stock|movements)[^/]*)?$/, async (route) => {
    await route.fulfill({
      json: {
        id: 'product-1',
        code: 'PRD-001',
        name: 'Filtro de aceite',
        consumptionType: 'direct',
      },
    });
  });
  await page.route(/\/api\/stock\/products\/product-1$/, async (route) => {
    await route.fulfill({ json: { productId: 'product-1', stock: 4 } });
  });
  await page.route(/\/api\/stock\/products\/product-1\/movements(?:\?.*)?$/, async (route) => {
    await route.fulfill({ json: [movement] });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/products/product-1/stock');

  await expect(page.getByTestId('stock-movement-mobile-card')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Volver al producto' }))
    .toHaveAttribute('href', '/products/product-1');
});
