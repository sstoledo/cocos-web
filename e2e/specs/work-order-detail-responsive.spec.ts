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
  description: 'Mantenimiento general',
  status: 'in_progress',
  totalAmount: '145.00',
  paidAmount: '80.00',
  paymentStatus: 'partial',
  isActive: true,
  employee: { id: 'employee-1', name: 'Pedro Gómez' },
  branch: { id: 'branch-1', name: 'Sucursal Centro' },
  services: [
    {
      id: 'service-line-1',
      serviceId: 'service-1',
      quantity: 1,
      unitPriceSnapshot: '145.00',
      subtotal: '145.00',
      service: {
        id: 'service-1',
        code: 'SRV-01',
        name: 'Cambio de aceite',
        description: null,
        price: '145.00',
        estimatedDuration: null,
      },
      createdAt: '2026-10-26T12:00:00.000Z',
      updatedAt: '2026-10-26T12:00:00.000Z',
    },
  ],
  createdAt: '2026-10-26T12:00:00.000Z',
  updatedAt: '2026-10-26T12:00:00.000Z',
};

async function openStubbedDetail(page: import('@playwright/test').Page) {
  await page.route(/\/api\/work-orders\/wo-responsive$/, async (route) => {
    await route.fulfill({ json: workOrder });
  });
  await page.route(
    /\/api\/work-orders\/wo-responsive\/(payments|consumptions)(?:\?.*)?$/,
    async (route) => {
      await route.fulfill({ json: [] });
    }
  );
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/work-orders/wo-responsive');
  await expect(page.getByTestId('work-order-total-value')).toBeVisible();
}

test('desktop work order detail keeps service table and two sections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await openStubbedDetail(page);

  await expect(page.getByRole('table').first()).toBeVisible();
  await expect(page.getByTestId('work-order-service-mobile-card'))
    .toBeHidden();
  await expect(page.getByTestId('work-order-secondary-sections'))
    .toBeVisible();
});

test('mobile work order detail uses service cards and full-width actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 1100 });
  await openStubbedDetail(page);

  await expect(page.getByTestId('work-order-service-mobile-card'))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Marcar como terminada' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar orden' }))
    .toBeVisible();
  await expect(
    page.getByText(
      'Cancelar la orden requiere confirmación y no se puede deshacer.'
    )
  ).toBeVisible();
  await expect(page.getByTestId('work-order-remaining-value'))
    .toHaveText('Saldo pendiente: 65.00');
});
