import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '@playwright/test';
import { RECEPTION_EMAIL, apiSession, uiLogin } from '../helpers/session';

// Single real-browser flow: login → client → vehicle → work order (mechanic
// assigned) → in_progress → partial payment → full payment → done → cash
// close with zero difference (totals derived from the payments made).

const runSuffix = Date.now().toString(36);
const DIGITS = String(Date.now()).slice(-8);
const CLIENT_NAME = `Aaa E2E Cliente ${runSuffix}`;
const CLIENT_ID_NUMBER = DIGITS;
// Peruvian plates: 3 letters + 3 digits (checked against the backend's
// plate helper patterns). Random, to avoid collisions across repeated
// runs of this suite.
const plateLetters = 'BCDFGHJKLMNPRSTWXYZ'
  .split('')
  .map((c) => [Math.random(), c])
  .sort()
  .slice(0, 3)
  .map(([, c]) => c as string)
  .join('');
const VEHICLE_PLATE = `${plateLetters}${Math.floor(
  Math.random() * 1000
)}`.padEnd(6, '0');
const VEHICLE_BRAND = 'Toyota';
const VEHICLE_MODEL = 'Corolla 2020';
const UNIT_PRICE = '150.00';
const PARTIAL_PAYMENT = '40.00';

test.describe
  .serial('Reception happy path', () => {
    let receptionApi: APIRequestContext;
    let expectedCashBeforePayments: string;
    let workOrderId: string;
    let totalAmount: string;
    let clientId: string;

    test.beforeAll(async () => {
      receptionApi = await apiSession(RECEPTION_EMAIL);
      const preview = await receptionApi.get('/api/cash-closings/preview');
      expect(preview.ok()).toBeTruthy();
      const body = (await preview.json()) as { expectedCash?: string };
      expectedCashBeforePayments = body.expectedCash ?? '0.00';
    });

    test.afterAll(async () => {
      await receptionApi?.dispose();
    });

    test('creates client and vehicle through the UI', async ({ page }) => {
      await uiLogin(page, RECEPTION_EMAIL);

      await page.goto('/clients/new');
      await page.getByLabel('Nombre').fill(CLIENT_NAME);
      await page
        .getByRole('textbox', { name: 'Identificación' })
        .fill(CLIENT_ID_NUMBER);
      await page
        .getByRole('button', { name: /guardar|crear|registrar/i })
        .click();
      await expect(page.getByText('Cliente creado correctament')).toBeVisible({
        timeout: 15_000,
      });
      await expect(page).toHaveURL(/\/clients$/);
      // Resolve the created client id through the API by its unique name.
      await expect
        .poll(
          async () => {
            const list = await receptionApi.get(
              `/api/clients?query=${encodeURIComponent(CLIENT_NAME)}`
            );
            const body = (await list.json()) as {
              data?: { name: string; id: string }[];
            };
            const found = body.data?.find((c) => c.name === CLIENT_NAME);
            if (found) clientId = found.id;
            return Boolean(found);
          },
          { timeout: 15_000 }
        )
        .toBe(true);

      await page.goto('/vehicles/new');
      await page.getByLabel('Placa').fill(VEHICLE_PLATE);
      await page.getByLabel('Marca').fill(VEHICLE_BRAND);
      await page.getByLabel('Modelo').fill(VEHICLE_MODEL);
      await page.getByLabel('Año').fill('2020');
      // First-page-by-name guarantee: 'Aaa ...' sorts before any other client
      // name created by earlier runs, so our E2E client is deterministically
      // selectable here.
      const clientValue =
        (await page
          .locator('#clientId option', { hasText: CLIENT_NAME })
          .first()
          .getAttribute('value')) ?? '';
      await page.locator('#clientId').selectOption(clientValue);
      await page
        .getByRole('button', { name: /guardar|crear|registrar/i })
        .click();
      await expect(page).toHaveURL(/\/vehicles$/);
      // The UI table is paginated, so persistence is verified through the API.
      await expect
        .poll(
          async () => {
            const list = await receptionApi.get(
              `/api/vehicles?clientId=${clientId}`
            );
            const body = (await list.json()) as { data?: { plate: string }[] };
            return body.data?.some((v) => v.plate === VEHICLE_PLATE);
          },
          { timeout: 15_000 }
        )
        .toBe(true);
    });

    test('creates a work order with the assigned mechanic', async ({
      page,
    }) => {
      await uiLogin(page, RECEPTION_EMAIL);
      await page.goto('/work-orders/new');

      const clientCombo = page.locator('#clientId');
      await clientCombo.click();
      await clientCombo.pressSequentially(CLIENT_NAME, { delay: 30 });
      await page
        .getByRole('option', { name: CLIENT_NAME })
        .waitFor({ state: 'visible', timeout: 15_000 });
      await page.getByRole('option', { name: CLIENT_NAME }).first().click();
      // Selection must disable nothing: the vehicle select enables once a
      // clientId is chosen.
      await expect(page.locator('#vehicleId')).toBeEnabled({ timeout: 15_000 });

      // Our own vehicle, guaranteed to be the only one for the E2E client.
      const vehicleValue =
        (await page
          .locator('#vehicleId option', { hasText: VEHICLE_PLATE })
          .first()
          .getAttribute('value')) ?? '';
      await page.locator('#vehicleId').selectOption(vehicleValue);

      await page
        .locator('#employeeId option', { hasText: 'María González' })
        .first()
        .waitFor({ state: 'attached' });
      const employeeValue =
        (await page
          .locator('#employeeId option', { hasText: 'María González' })
          .first()
          .getAttribute('value')) ?? '';
      await page.locator('#employeeId').selectOption(employeeValue);

      await page.getByRole('button', { name: 'Agregar servicio' }).click();
      const serviceCombo = page.locator('#services-0-serviceId');
      await serviceCombo.click();
      await serviceCombo.pressSequentially('aceite', { delay: 30 });
      await page
        .getByRole('option')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 });
      await page.getByRole('option').first().click();

      await page.locator('#services-0-quantity').fill('1');
      await page.locator('#services-0-unitPrice').fill(UNIT_PRICE);
      await page
        .getByRole('button', { name: /guardar|crear|registrar/i })
        .click();

      await expect(page).toHaveURL(/\/work-orders\/(?!new$)[A-Za-z0-9-]+$/);
      workOrderId = page.url().split('/').pop() as string;
      await expect(page.locator('body')).toContainText(/Total: /);
    });

    test('starts the work order and registers partial + full payments', async ({
      page,
    }) => {
      await uiLogin(page, RECEPTION_EMAIL);
      await page.goto(`/work-orders/${workOrderId}`);
      console.log('T3 URL', page.url(), 'WOID', workOrderId);

      await page
        .getByRole('button', { name: /iniciar/i })
        .first()
        .click();
      await expect(page.locator('body')).toContainText(/en progreso/i);

      const totalText = (await page
        .getByText(/Total: /)
        .first()
        .textContent()) as string;
      totalAmount = totalText.replace(/[^0-9.]/g, '');
      expect(totalAmount).toMatch(/^\d+\.\d{2}$/);

      const remainingCents =
        Math.round(Number.parseFloat(totalAmount) * 100) -
        Math.round(Number.parseFloat(PARTIAL_PAYMENT) * 100);
      const remaining = (remainingCents / 100).toFixed(2);

      async function registerPayment(amount: string) {
        await page
          .getByRole('button', { name: /registrar pago/i })
          .first()
          .click();
        await page.locator('#payment-amount').fill(amount);
        await page
          .locator('#payment-method option', { hasText: /efectivo|cash/i })
          .first()
          .waitFor({ state: 'attached' });
        const cashValue =
          (await page
            .locator('#payment-method option', { hasText: /efectivo|cash/i })
            .first()
            .getAttribute('value')) ?? '';
        await page.locator('#payment-method').selectOption(cashValue);
        await page
          .getByRole('dialog')
          .getByRole('button', { name: /registrar pago/i })
          .click();
      }

      await registerPayment(PARTIAL_PAYMENT);
      await expect(page.locator('body')).toContainText(PARTIAL_PAYMENT, {
        timeout: 15_000,
      });

      await registerPayment(remaining);
      await expect(page.locator('body')).toContainText(remaining, {
        timeout: 15_000,
      });
      await expect(page.locator('body')).toContainText(/pagad[ao]|paid/i);
    });

    test('marks the work order as done', async ({ page }) => {
      await uiLogin(page, RECEPTION_EMAIL);
      await page.goto(`/work-orders/${workOrderId}`);

      await page
        .getByRole('button', { name: /terminada|done/i })
        .first()
        .click();
      const confirmButton = page.getByRole('dialog').getByRole('button').last();
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();
      await expect(page.locator('body')).toContainText(/finalizada|done/i);
    });

    test('closes the cash period with matching totals', async ({ page }) => {
      const totalCents = Math.round(Number.parseFloat(totalAmount) * 100);
      const beforeCents = Math.round(
        Number.parseFloat(expectedCashBeforePayments) * 100
      );
      const expectedCash = ((beforeCents + totalCents) / 100).toFixed(2);

      await uiLogin(page, RECEPTION_EMAIL);
      await page.goto('/cash-closings/close');
      await expect(page.locator('body')).toContainText(expectedCash);

      await page.getByLabel(/efectivo declarado/i).fill(expectedCash);
      await page.getByRole('button', { name: /cerrar caja/i }).click();

      await expect(page.locator('body')).toContainText(/diferencia/i, {
        timeout: 15_000,
      });
      await expect(page.locator('body')).toContainText('0.00');
    });
  });
