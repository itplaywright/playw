import { test, expect } from '@playwright/test';

test('стабілізація тесту', async ({ page }) => {
  await page.goto('https://finmore.netlify.app/');
  
  // Авторизація
  await page.getByPlaceholder('your@email.com').fill('admin@demo.com');
  await page.getByPlaceholder('Введіть пароль').fill('admin123');
  await page.getByRole('button', { name: 'Увійти' }).click();

  // Тут може бути затримка завантаження даних
  // Ваша задача: стабілізувати перевірку балансу "Усього витрачено"
  const balance = page.getByText('Усього витрачено');
  
  // Як зробити цю перевірку стабільною?
  await expect(balance).toBeVisible();
});