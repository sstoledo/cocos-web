import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

test('header profile menu opens the current user profile', async ({ page }) => {
  await uiLogin(page, ADMIN_EMAIL);

  await page.getByRole('button', { name: 'Abrir menú de perfil' }).click();
  await page.getByRole('menuitem', { name: 'Perfil', exact: true }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: 'Perfil', exact: true })
  ).toBeVisible();
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
  await expect(page.getByText('Admin', { exact: true })).toBeVisible();
});
