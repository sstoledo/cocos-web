import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const purchaseOrder = {
  id: 'po-responsive',
  purchaseOrderNumber: 'COM-2026-000123',
  supplierId: 'supplier-1',
  status: 'ordered',
  notes: 'Pedido mensual de filtros',
  estimatedTotal: '455.00',
  supplier: { id: 'supplier-1', name: 'Repuestos Lima SAC' },
  lines: [
    {
      id: 'line-1',
      productId: 'product-1',
      quantityOrdered: 10,
      quantityReceived: 4,
      estimatedCostPrice: '45.50',
      product: { id: 'product-1', code: 'PRD-001', name: 'Filtro de aceite' },
    },
  ],
  receipts: [],
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

async function openStubbedDetail(
  page: import('@playwright/test').Page,
  receive = false
) {
  await page.route(/\/api\/purchase-orders\/po-responsive$/, async (route) => {
    await route.fulfill({ json: purchaseOrder });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto(
    receive ? '/purchase-orders/po-responsive/receive' : '/purchase-orders/po-responsive'
  );
}

test('desktop purchase order detail keeps line table', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await openStubbedDetail(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('purchase-order-line-mobile-card'))
    .toBeHidden();
});

test('mobile purchase order detail uses line cards and actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedDetail(page);

  await expect(page.getByTestId('purchase-order-line-mobile-card'))
    .toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Registrar recepción' }))
    .toHaveClass(/w-full/);
  await expect(page.getByTestId('purchase-order-total-value'))
    .toHaveText('455.00');
});

test('mobile receive form keeps full-width submit and back navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await openStubbedDetail(page, true);

  await expect(page.getByRole('button', { name: 'Registrar recepción' }))
    .toHaveClass(/w-full/);
  await expect(page.getByRole('link', { name: 'Volver a la orden' }))
    .toHaveAttribute('href', '/purchase-orders/po-responsive');
});
