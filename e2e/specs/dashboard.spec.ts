import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

async function cardRowTops(page: import('@playwright/test').Page) {
  const navigationIcons = page.getByTestId('stat-card-navigation');
  await expect(navigationIcons).toHaveCount(6);
  return navigationIcons.evaluateAll((icons) =>
    icons.map((icon) => icon.closest('a')?.getBoundingClientRect().top ?? -1)
  );
}

test('dashboard lays out six stat cards in three desktop columns', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/dashboard');

  const tops = await cardRowTops(page);
  expect(new Set(tops).size).toBe(2);
  expect(tops.filter((top) => top === tops[0])).toHaveLength(3);
});

test('dashboard keeps two mobile columns and supports dark theme', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/dashboard');

  const tops = await cardRowTops(page);
  expect(new Set(tops).size).toBe(3);
  expect(tops.filter((top) => top === tops[0])).toHaveLength(2);

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
