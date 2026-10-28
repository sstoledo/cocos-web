import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, uiLogin } from '../helpers/session';

const brand = {
  id: 'brand-1',
  name: 'Castrol',
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};
const category = {
  id: 'category-1',
  name: 'Lubricantes',
  parentId: null,
  parent: null,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};
const presentation = {
  id: 'presentation-1',
  name: 'Unidad',
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

async function openMobileCrud(
  page: import('@playwright/test').Page,
  entity: 'brands' | 'categories' | 'presentations',
  fixture: object
) {
  await page.route(new RegExp(`/api/${entity}(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      json: { data: [fixture], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await uiLogin(page, ADMIN_EMAIL);
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto(`/${entity}`);
}

test('desktop brands keeps the table and hides mobile cards', async ({
  page,
}) => {
  await page.route(/\/api\/brands(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      json: { data: [brand], meta: { page: 1, limit: 10, total: 1 } },
    });
  });
  await page.setViewportSize({ width: 1200, height: 800 });
  await uiLogin(page, ADMIN_EMAIL);
  await page.goto('/brands');

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('brand-mobile-card')).toBeHidden();
});

test('mobile brands uses cards and detail back navigation', async ({
  page,
}) => {
  await openMobileCrud(page, 'brands', brand);
  await expect(page.getByTestId('brand-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();

  await page.route(/\/api\/brands\/brand-1$/, async (route) => {
    await route.fulfill({ json: brand });
  });
  await page.goto('/brands/brand-1');
  await expect(page.getByRole('link', { name: 'Volver a marcas' }))
    .toHaveAttribute('href', '/brands');
});

test('mobile categories uses cards with parent and detail navigation', async ({
  page,
}) => {
  await openMobileCrud(page, 'categories', category);
  await expect(page.getByTestId('category-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();

  await page.route(/\/api\/categories\/category-1$/, async (route) => {
    await route.fulfill({ json: category });
  });
  await page.goto('/categories/category-1');
  await expect(page.getByRole('link', { name: 'Volver a categorías' }))
    .toHaveAttribute('href', '/categories');
});

test('mobile presentations uses cards with edit and delete actions', async ({
  page,
}) => {
  await openMobileCrud(page, 'presentations', presentation);
  await expect(page.getByTestId('presentation-mobile-card')).toBeVisible();
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Editar', exact: true }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: /Eliminar/ }))
    .toBeVisible();
});
