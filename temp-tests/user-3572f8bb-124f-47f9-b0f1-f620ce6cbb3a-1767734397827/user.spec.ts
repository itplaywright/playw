import { test, expect } from '@playwright/test';

test('мій перший тест', async ({ page }) => {
  // 1. Перейти на сайт https://playwright.dev
  await page.goto('https://playwright.dev');
  
  // 2. Перевірити заголовок

});