import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '@playwright/test';
import { RECEPTION_EMAIL, apiSession, uiLogin } from '../helpers/session';

let receptionApi: APIRequestContext;
let proformaId: string;
let proformaNumber: string;

test.describe.serial('Reception proforma flow', () => {
  test.beforeAll(async () => {
    receptionApi = await apiSession(RECEPTION_EMAIL);
  });

  test.afterAll(async () => {
    await receptionApi?.dispose();
  });

  test('creates a walk-in proforma through the UI and downloads its PDF', async ({
    page,
  }) => {
    await uiLogin(page, RECEPTION_EMAIL);
    await page.goto('/proformas/new');

    await page.getByRole('button', { name: 'Agregar producto' }).click();
    const productCombo = page.locator('#productLines-0-productId');
    await productCombo.click();
    await productCombo.pressSequentially('aceite', { delay: 30 });
    await page
      .getByRole('option')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByRole('option').first().click();

    await page.locator('#productLines-0-quantity').fill('2');
    await page.getByRole('button', { name: /guardar/i }).click();

    await expect(page).toHaveURL(/\/proformas\/(?!new$)[A-Za-z0-9-]+$/);
    proformaId = page.url().split('/').pop() as string;
    await expect(page.locator('body')).toContainText(/PRO-\d{4}-\d{6}/);
    const bodyText = await page.locator('body').innerText();
    proformaNumber = bodyText.match(/PRO-\d{4}-\d{6}/)?.[0] ?? '';
    expect(proformaNumber).toMatch(/PRO-\d{4}-\d{6}/);
    await expect(page.getByText('Borrador', { exact: true })).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PDF' }).click();
    expect((await download).suggestedFilename()).toBe(
      `proforma-${proformaNumber}.pdf`
    );

    // The UI table is paginated, so persistence is verified through the API.
    await expect
      .poll(
        async () => {
          const response = await receptionApi.get(
            `/api/proformas/${proformaId}`
          );
          const body = (await response.json()) as {
            status?: string;
            products?: { unitPriceSnapshot?: string }[];
          };
          return {
            status: body.status,
            productCount: body.products?.length,
            hasUnitPriceSnapshot: Boolean(
              body.products?.[0]?.unitPriceSnapshot
            ),
          };
        },
        { timeout: 15_000 }
      )
      .toMatchObject({
        status: 'draft',
        productCount: 1,
        hasUnitPriceSnapshot: true,
      });
  });

  test('converts an accepted proforma into a sale', async ({ page }) => {
    const sent = await receptionApi.patch(
      `/api/proformas/${proformaId}/status`,
      { data: { status: 'sent' } }
    );
    expect(sent.ok()).toBeTruthy();
    const accepted = await receptionApi.patch(
      `/api/proformas/${proformaId}/status`,
      { data: { status: 'accepted' } }
    );
    expect(accepted.ok()).toBeTruthy();

    await uiLogin(page, RECEPTION_EMAIL);
    await page.goto(`/proformas/${proformaId}`);
    await expect(page.getByText('Aceptada', { exact: true })).toBeVisible();

    await page.getByLabel('Método de pago').selectOption('card');
    await page.getByRole('button', { name: 'Convertir a venta' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Convertir', exact: true })
      .click();

    await expect(page.getByText('Convertida', { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText('Venta generada', { exact: true })
    ).toBeVisible();
  });
});
