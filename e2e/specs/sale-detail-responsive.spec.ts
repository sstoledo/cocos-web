import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const sale = {
  id: 'sale-responsive',
  saleNumber: 'VTA-2026-000123',
  clientId: 'client-1',
  branchId: 'branch-1',
  employeeId: 'employee-1',
  status: 'completed',
  paymentMethod: 'cash',
  totalAmount: '18450.00',
  isActive: true,
  client: { id: 'client-1', name: 'Juan Pérez' },
  branch: { id: 'branch-1', name: 'Sucursal Centro' },
  employee: { id: 'employee-1', name: 'María Gómez' },
  products: [
    {
      id: 'line-1',
      productId: 'product-1',
      quantity: 2,
      unitPriceSnapshot: '9225.00',
      subtotal: '18450.00',
      product: {
        id: 'product-1',
        code: 'PRD-001',
        name: 'Filtro de aceite',
        description: null,
        price: '9225.00',
      },
      createdAt: '2026-10-25T12:00:00.000Z',
      updatedAt: '2026-10-25T12:00:00.000Z',
    },
  ],
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
  deletedAt: null,
};

async function openStubbedDetail(page: import('@playwright/test').Page) {
  await page.route(/\/api\/sales\/sale-responsive$/, async (route) => {
    await route.fulfill({ json: sale });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/sales/sale-responsive');
  await expect(page.getByTestId('sale-total-value')).toBeVisible();
}

test('desktop sale detail keeps the product table', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStubbedDetail(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('sale-line-mobile-card')).toBeHidden();
});

test('mobile sale detail uses product cards and keeps navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedDetail(page);

  await expect(page.getByTestId('sale-line-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Volver a ventas' }))
    .toHaveAttribute('href', '/sales');
  await expect(page.getByTestId('sale-total-value')).toHaveText('18450.00');
  await expect(page.getByRole('button', { name: 'Cancelar venta' }))
    .toBeVisible();
});
