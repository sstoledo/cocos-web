import * as fs from 'node:fs';
import * as path from 'node:path';
import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '@playwright/test';
import { ADMIN_EMAIL, apiSession, uiLogin } from '../helpers/session';

// The extraction+confirm path needs a real GEMINI_API_KEY in the backend;
// CI has none, so the confirm test is gated and the discard flow runs
// unconditionally (discard only needs a pending document). Presence-only
// inspection: the key value itself is never read or printed.
const backendEnvPath = path.resolve(__dirname, '../../../cocos-back/.env');
const fixturePath = path.resolve(
  __dirname,
  '../assets/receipt-fixture-single.png'
);
const hasGeminiKey =
  fs.existsSync(backendEnvPath) &&
  /^GEMINI_API_KEY=.+/m.test(fs.readFileSync(backendEnvPath, 'utf8'));

test.describe.serial('Supplier receipt OCR flow', () => {
  let adminApi: APIRequestContext;

  test.beforeAll(async () => {
    adminApi = await apiSession(ADMIN_EMAIL);
  });

  test.afterAll(async () => {
    await adminApi?.dispose();
  });

  test('discard a pending receipt without persisting inventory', async ({
    page,
  }) => {
    await uiLogin(page, ADMIN_EMAIL);
    await page.goto('/receipts');
    await page.getByRole('button', { name: 'Cargar comprobante' }).click();

    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await page.getByRole('button', { name: 'Cargar y procesar OCR' }).click();

    // OCR runs synchronously inside the upload request; a slow provider
    // can legitimately take up to the 60s backend OCR timeout.
    await expect(page).toHaveURL(/\/receipts\/[A-Za-z0-9-]+$/, {
      timeout: 90_000,
    });

    await page.getByRole('button', { name: 'Descartar comprobante' }).click();
    await page.getByRole('button', { name: 'Descartar', exact: true }).click();

    await expect(page).toHaveURL(/\/receipts$/, { timeout: 15_000 });
  });

  test('extracts receipt data and confirms it as a lot', async ({ page }) => {
    test.skip(!hasGeminiKey, 'GEMINI_API_KEY not configured in backend');

    await uiLogin(page, ADMIN_EMAIL);
    await page.goto('/receipts');
    await page.getByRole('button', { name: 'Cargar comprobante' }).click();

    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await page.getByRole('button', { name: 'Cargar y procesar OCR' }).click();

    // OCR runs synchronously inside the upload request; a slow provider
    // can legitimately take up to the 60s backend OCR timeout.
    await expect(page).toHaveURL(/\/receipts\/[A-Za-z0-9-]+$/, {
      timeout: 90_000,
    });

    // Extraction must render the supplier line before the review form.
    await expect(page.getByText('DISTRIBUIDORA ANDINA S.A.').first())
      .toBeVisible({ timeout: 30_000 });

    // Lot mode is the default destination; resolve supplier and item.
    await page.locator('#receipt-supplier').click();
    await page
      .locator('#receipt-supplier')
      .pressSequentially('Repuestos Lima', { delay: 30 });
    await page.getByRole('option').first().click();
    await page.getByRole('option').first().waitFor({ state: 'hidden' });

    const productInput = page.locator('#receipt-items-0-product');
    await productInput.click();
    await productInput.pressSequentially('Filtro de aceite', { delay: 30 });
    await page.getByRole('option').first().click();
    await page.getByRole('option').first().waitFor({ state: 'hidden' });

    await page.locator('#receipt-items-0-expiration').fill('2099-12-31');
    await page.getByRole('button', { name: 'Confirmar comprobante' }).click();

    // Confirming a lot lands on the lots list, where the auto-numbered
    // REC- receipt lot appears.
    await expect(page).toHaveURL(/\/lots/, { timeout: 30_000 });
    await expect(page.getByText(/^REC-/).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
