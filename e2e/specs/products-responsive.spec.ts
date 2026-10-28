import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const product = {
  id: 'product-1',
  code: 'PRD-001',
  name: 'Filtro de aceite',
  price: '45.50',
  stock: 4,
  imageUrl: null,
  isActive: true,
  presentation: { id: 'presentation-1', name: 'Unidad' },
  brand: { id: 'brand-1', name: 'Castrol' },
  category: { id: 'category-1', name: 'Lubricantes' },
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

async function stubProductList(page: import('@playwright/test').Page) {
  await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [product], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
}

test('desktop products keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await stubProductList(page);
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/products');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('product-mobile-card')).toBeHidden();
});

test('mobile products uses complete cards with all actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await stubProductList(page);
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/products');

  const card = page.getByTestId('product-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('PRD-001');
  await expect(card).toContainText('Activo');
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Stock', exact: true }))
    .toBeVisible();
  await expect(page.getByRole('link', { name: 'Editar', exact: true }))
    .toBeVisible();
});

test('product detail provides back navigation', async ({ page }) => {
  await page.route(/\/api\/products\/product-1$/, async (route) => {
    await route.fulfill({ json: product });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/products/product-1');

  await expect(page.getByRole('link', { name: 'Volver a productos' }))
    .toHaveAttribute('href', '/products');
});
