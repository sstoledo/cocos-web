import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { request } from 'playwright';

export const E2E_PASSWORD = 'Passw0rd.e2e';

export const RECEPTION_EMAIL = 'reception-e2e@example.com';
export const MECHANIC_EMAIL = 'mechanic-e2e@example.com';
export const MECHANIC_EMPLOYEE_NAME = 'María González';

const API_SERVER_BASE = 'http://localhost:4000';

/**
 * Opens an API session authenticated as the given user by hitting the
 * better-auth sign-in endpoint. The returned context keeps the session cookie
 * for subsequent calls and must be disposed by the caller.
 */
export async function apiSession(
  email: string,
  password: string = E2E_PASSWORD
): Promise<APIRequestContext> {
  const context = await request.newContext({ baseURL: API_SERVER_BASE });
  const response = await context.post('/api/auth/sign-in/email', {
    data: { email, password },
  });
  if (!response.ok()) {
    await context.dispose();
    throw new Error(
      `API sign-in failed for ${email}: ${response.status()} ${await response.text()}`
    );
  }
  return context;
}

/** Logs in through the real UI and waits for the authenticated landing. */
export async function uiLogin(
  page: Page,
  email: string,
  password: string = E2E_PASSWORD
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}
