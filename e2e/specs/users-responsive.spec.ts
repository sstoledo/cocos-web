import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const user = {
  id: 'user-1',
  name: 'Ana López',
  email: 'ana@example.com',
  isActive: true,
  role: { id: 'role-1', name: 'Admin' },
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

async function stubUsers(page: import('@playwright/test').Page) {
  await page.route(/\/api\/users(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [user], meta: { page: 1, limit: 20, total: 1 } },
    });
  });
}

test('desktop users keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await stubUsers(page);
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/users');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('user-mobile-card')).toBeHidden();
});

test('mobile users uses cards with role and actions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await stubUsers(page);
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/users');

  const card = page.getByTestId('user-mobile-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Ana López');
  await expect(card).toContainText('Admin');
  await expect(page.getByRole('table')).toBeHidden();
});

test('user detail provides back navigation', async ({ page }) => {
  await page.route(/\/api\/users\/user-1$/, async (route) => {
    await route.fulfill({ json: user });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/users/user-1');

  await expect(page.getByRole('link', { name: 'Volver a usuarios' }))
    .toHaveAttribute('href', '/users');
});
