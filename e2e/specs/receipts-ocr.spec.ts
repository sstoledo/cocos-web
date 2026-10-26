import * as fs from 'node:fs';
import * as path from 'node:path';
import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '@playwright/test';
import { ADMIN_EMAIL, apiSession, uiLogin } from '../helpers/session';

// The live extraction+confirm path needs a real GEMINI_API_KEY in the
// backend; CI has none, so that test is gated. The discard and stubbed
// lot-confirmation flows run unconditionally. Presence-only inspection:
// the key value itself is never read or printed.
const backendEnvPath = path.resolve(__dirname, '../../../cocos-back/.env');
const fixturePath = path.resolve(
  __dirname,
  '../assets/receipt-fixture-single.png'
);
const hasGeminiKey =
  fs.existsSync(backendEnvPath) &&
  /^GEMINI_API_KEY=.+/m.test(fs.readFileSync(backendEnvPath, 'utf8'));

test.describe
  .serial('Supplier receipt OCR flow', () => {
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
      await page
        .getByRole('button', { name: 'Descartar', exact: true })
        .click();

      await expect(page).toHaveURL(/\/receipts$/, { timeout: 15_000 });
    });

    test('confirms reviewed OCR data as a lot with a stubbed receipt', async ({
      page,
    }) => {
      const receiptId = 'e2e-receipt';
      const lotNumber = `REC-${receiptId}`;
      const receipt = {
        id: receiptId,
        status: 'pending',
        mimeType: 'image/png',
        fileName: 'receipt-fixture-single.png',
        filePublicId: 'receipts/e2e-receipt',
        fileUrl: 'https://example.test/receipt.png',
        extracted: {
          supplierName: 'DISTRIBUIDORA ANDINA S.A.',
          documentNumber: 'B-009876',
          issueDate: '2026-10-25',
          items: [
            {
              description: 'Filtro de aceite FAP-220x2',
              code: 'FAP-220x2',
              quantity: 4,
              unitPrice: 45.5,
            },
          ],
        },
        ocrModel: 'gemini-3.8-flash',
        lotId: null,
        lot: null,
        purchaseOrderId: null,
        purchaseOrder: null,
        supplierId: null,
        supplier: null,
        confirmedAt: null,
        createdAt: '2026-10-25T12:00:00.000Z',
        updatedAt: '2026-10-25T12:00:00.000Z',
      };
      let confirmPayload: {
        supplierId: string;
        items: Array<{
          productId: string;
          quantity: number;
          costPrice: number;
          expirationDate: string;
        }>;
      } | null = null;

      await page.route(
        new RegExp(`/api/receipts/${receiptId}(?:/confirm-lot)?$`),
        async (route) => {
          const request = route.request();
          if (request.method() === 'GET') {
            await route.fulfill({ json: receipt });
            return;
          }
          if (
            request.method() === 'POST' &&
            new URL(request.url()).pathname.endsWith('/confirm-lot')
          ) {
            confirmPayload = request.postDataJSON();
            await route.fulfill({
              status: 201,
              json: {
                lot: { id: 'e2e-lot', lotNumber },
                receipt: { ...receipt, status: 'confirmed', lotId: 'e2e-lot' },
              },
            });
            return;
          }
          await route.fallback();
        }
      );
      await page.route(/\/api\/lots(?:\?.*)?$/, async (route) => {
        await route.fulfill({
          json: {
            data: [
              {
                id: 'e2e-lot',
                lotNumber,
                supplier: { id: 'e2e-supplier', name: 'Repuestos Lima SAC' },
                receivedAt: '2026-10-25T12:00:00.000Z',
                items: [],
              },
            ],
            meta: { page: 1, limit: 20, total: 1 },
          },
        });
      });

      await uiLogin(page, ADMIN_EMAIL);
      await page.goto(`/receipts/${receiptId}`);
      await expect(
        page.getByText('DISTRIBUIDORA ANDINA S.A.').first()
      ).toBeVisible();

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

      await expect(page).toHaveURL(/\/lots$/, { timeout: 30_000 });
      await expect(page.getByText(lotNumber)).toBeVisible();
      expect(confirmPayload).toMatchObject({
        supplierId: expect.any(String),
        items: [
          {
            productId: expect.any(String),
            quantity: 4,
            costPrice: 45.5,
            expirationDate: '2099-12-31',
          },
        ],
      });
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
      await expect(
        page.getByText('DISTRIBUIDORA ANDINA S.A.').first()
      ).toBeVisible({ timeout: 30_000 });

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
