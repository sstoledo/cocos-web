import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const proforma = {
  id: 'proforma-responsive',
  proformaNumber: 'PRO-2026-000045',
  clientId: 'client-1',
  branchId: 'branch-1',
  employeeId: 'employee-1',
  status: 'accepted',
  totalAmount: '18450.00',
  notes: 'Entrega coordinada para el 28/10. Precios válidos por 15 días.',
  convertedSaleId: null,
  isActive: true,
  client: { id: 'client-1', name: 'Juan Pérez' },
  branch: { id: 'branch-1', name: 'Sucursal Centro' },
  employee: { id: 'employee-1', name: 'María Gómez' },
  products: [
    {
      id: 'line-1',
      proformaId: 'proforma-responsive',
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
  await page.route(/\/api\/proformas\/proforma-responsive$/, async (route) => {
    await route.fulfill({ json: proforma });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/proformas/proforma-responsive');
  await expect(page.getByTestId('proforma-total-value')).toBeVisible();
}

test('desktop proforma detail keeps products table and conversion controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await openStubbedDetail(page);

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('proforma-line-mobile-card')).toBeHidden();
  await expect(page.getByTestId('proforma-pdf-action')).toBeVisible();
  await expect(page.getByText('Confirmación requerida')).toBeVisible();
});

test('mobile proforma detail uses product cards and FIFO panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1100 });
  await openStubbedDetail(page);

  await expect(page.getByTestId('proforma-line-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByTestId('proforma-pdf-action')).toBeVisible();
  await expect(
    page.getByText(
      'La conversión es irreversible y consumirá stock FIFO. Verifica los productos y confirma el método de pago antes de continuar.'
    )
  ).toBeVisible();
  await expect(page.getByLabel('Método de pago')).toHaveValue('cash');
});
