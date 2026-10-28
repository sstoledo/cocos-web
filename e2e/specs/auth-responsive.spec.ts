import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

test('login mobile has no horizontal overflow and keeps full-width sign in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Welcome back' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true }))
    .toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);
});

test('reset password mobile keeps description and form within viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/reset-password');

  await expect(page.getByRole('heading', { name: 'Reset password' }))
    .toBeVisible();
  await expect(page.getByText('Enter your email to receive a reset link'))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Send reset link' }))
    .toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);
});

test('unauthorized mobile keeps a full-width return action', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/unauthorized');

  await expect(page.getByRole('heading', { name: 'Acceso denegado', level: 1 }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Volver al inicio' }))
    .toHaveClass(/w-full/);
});
