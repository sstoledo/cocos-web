import * as fs from 'node:fs';
import * as path from 'node:path';
import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '@playwright/test';
import { RECEPTION_EMAIL, apiSession, uiLogin } from '../helpers/session';

// The semantic path needs a real GEMINI_API_KEY configured in the backend;
// CI has no key. When it is absent, only the legacy ILIKE path is exercised.
// This inspects presence only (single line regex), never the key value itself.
const backendEnvPath = path.resolve(__dirname, '../../../cocos-back/.env');
const hasGeminiKey =
  fs.existsSync(backendEnvPath) &&
  /^GEMINI_API_KEY=.+/m.test(fs.readFileSync(backendEnvPath, 'utf8'));

test.describe.serial('Product search two-mode behavior', () => {
  let receptionApi: APIRequestContext;

  test.beforeAll(async () => {
    receptionApi = await apiSession(RECEPTION_EMAIL);
  });

  test.afterAll(async () => {
    await receptionApi?.dispose();
  });

  test('short queries keep the legacy product search (unaffected)', async ({
    page,
  }) => {
    await uiLogin(page, RECEPTION_EMAIL);
    await page.goto('/proformas/new');

    await page.getByRole('button', { name: 'Agregar producto' }).click();
    const productCombo = page.locator('#productLines-0-productId');
    await productCombo.click();
    // Two characters stay below the semantic threshold (3+): legacy ILIKE.
    await productCombo.pressSequentially('ac', { delay: 30 });
    await page
      .getByRole('option')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByRole('option').first().click();
    await expect(productCombo).toHaveValue(/.+/);
  });

  test('long natural-language queries resolve through semantic search', async ({
    page,
  }) => {
    test.skip(!hasGeminiKey, 'GEMINI_API_KEY not configured in backend');

    // Semantic sanity through the authenticated API before the UI flow: the
    // endpoint must be configured (200) with the catalog backfilled.
    const response = await receptionApi.get(
      '/api/products/search/semantic?q=componente%20que%20tensa%20la%20correa%20del%20motor&limit=5'
    );
    expect(response.status()).toBe(200);

    await uiLogin(page, RECEPTION_EMAIL);
    await page.goto('/proformas/new');
    await page.getByRole('button', { name: 'Agregar producto' }).click();
    const productCombo = page.locator('#productLines-0-productId');
    await productCombo.click();
    await productCombo.pressSequentially('correa del motor del auto', {
      delay: 30,
    });
    await page
      .getByRole('option')
      .first()
      .waitFor({ state: 'visible', timeout: 20_000 });
    await page.getByRole('option').first().click();
    await expect(productCombo).toHaveValue(/.+/);
  });
});
