import { test, expect } from '@playwright/test';

test('мій перший тест', async ({ page }) => {
  // 1. Перейти на сайт https://finmore.netlify.app/
  await page.goto('https://finmore.netlify.app/');
  // 2. Перевірити заголовок
  await expect(page).toHaveTitle(/Заголовок/);
});