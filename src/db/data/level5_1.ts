export const level5Tasks_1 = [
    {
        title: "5.1 E-commerce: Наскрізне (E2E) тестування кошика",
        description: `## 🛒 Сценарій покупки (End-to-End)

**Теорія**: Тестування повного шляху користувача (E2E) — це вершина піраміди тестування. Ми повинні перевірити, чи може користувач пройти весь шлях від вибору товару до покупки. Це найскладніші, але найважливіші тести для бізнесу.

**Приклад архітектури E2E тесту:**
\`\`\`typescript
import { test, expect } from '@playwright/test';

// Тест має читатися як зрозуміла історія
test('Користувач може успішно купити товар', async ({ page }) => {
  // 1. Arrange (Підготовка)
  await page.goto('/products');
  const cartBadge = page.locator('.cart-count');
  const checkoutBtn = page.getByRole('button', { name: 'Checkout' });
  
  // 2. Act (Дія - Вибір товару)
  await page.getByText('MacBook Pro').click();
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  
  // 3. Assert (Перевірка проміжного стану)
  await expect(cartBadge).toHaveText('1');
  
  // 4. Act (Дія - Оформлення)
  await checkoutBtn.click();
  await page.getByLabel('Card Number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Pay' }).click();
  
  // 5. Assert (Перевірка кінцевого результату)
  await expect(page.getByText('Order Successful')).toBeVisible();
});
\`\`\`

💡 **Порада**: В E2E тестах уникайте перевірки дрібних деталей UI (колір кнопки). Фокусуйтеся на бізнес-логіці.

---
### 🎯 Ваше завдання
Який термін найкраще описує тип тестування, що імітує повний шлях користувача від входу до успішного завершення складного бізнес-сценарію?
`,
        code: "import { test, expect } from '@playwright/test';\n\n// Цей тест перевіряє всю систему цілком\ntest('buy item', async ({ page }) => {\n  /* ... багато кроків ... */\n});",
        type: "quiz",
        options: [
            "E2E (End-to-End)",
            "Unit Test",
            "Integration Test",
            "API Test"
        ],
        correctAnswer: "E2E (End-to-End)"
    },
    {
        title: "5.2 Flaky Test: Правильне очікування анімацій (Auto-waiting)",
        description: `## ⏳ Проблема нестабільних тестів та фіксованих пауз

**Баг початківця**: "Мій тест іноді падає, бо кнопка ще не з'явилася. Додам \`await page.waitForTimeout(5000)\`".
**Результат**: Ваш тест ЗАВЖДИ чекає 5 секунд. Якщо таких тестів 100 — ви втратили 8 хвилин CI на порожні очікування!

**Правильне рішення**: Playwright має вбудований \`auto-waiting\` та \`retrying assertions\` (веб-очікування).

**Як це працює:**
\`\`\`typescript
// ❌ ПОГАНО:
await page.click('#load-data');
await page.waitForTimeout(3000); // Тест спить 3 секунди
const text = await page.innerText('.result');
expect(text).toBe('Success');

// ✅ ЧУДОВО:
await page.click('#load-data');
// Playwright буде автоматично опитувати DOM кожні 100мс
// Як тільки текст з'явиться - тест піде далі миттєво! (Максимум чекатиме timeout тесту)
await expect(page.locator('.result')).toHaveText('Success');
\`\`\`

## 🛠 Концепція на практиці
Методи \`toHaveText\`, \`toBeVisible\`, \`toBeEnabled\` — це **retrying assertions**. Вони самі чекають потрібного стану.

---
### 🎯 Ваше завдання
Який рядок коду використовує правильний механізм Playwright для очікування появи елемента на сторінці без використання "сліпих" фіксованих пауз?
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('flaky fix', async ({ page }) => {\n  await page.click('#load-slowly');\n  // Який код правильно дочекається появи елемента?\n});",
        type: "quiz",
        options: [
            "await expect(locator).toBeVisible()",
            "await page.waitForTimeout(5000)",
            "while(!visible) { ... }",
            "await page.pause(5000)"
        ],
        correctAnswer: "await expect(locator).toBeVisible()"
    },
    {
        title: "5.3 Shadow DOM: Робота зі схованими елементами",
        description: `## 👻 Shadow DOM: Що це і як його "пробити"

**Теорія**: Деякі веб-компоненти (Salesforce Lightning, кастомні відеоплеєри, віджети) інкапсулюють свої стилі та HTML всередині **Shadow DOM**. 
Для стандартного JavaScript (і старих інструментів на кшталт Selenium) ці елементи **невидимі** при пошуку через \`document.querySelector\`.

**Як Playwright працює з Shadow DOM:**
Він пробиває його **АВТОМАТИЧНО**. Вам взагалі нічого не потрібно робити! \`page.locator\` бачить їх так само, як звичайні елементи.

**Приклад**:
\`\`\`html
<!-- Структура на сторінці -->
<my-custom-widget>
  #shadow-root (open)
    <input class="hidden-input" type="text" />
</my-custom-widget>
\`\`\`

\`\`\`typescript
// Звичайний JS в консолі браузера дасть null:
// document.querySelector('.hidden-input') -> null

// Playwright знайде його без проблем:
await page.locator('.hidden-input').fill('Hello Shadow');
// або
await page.getByRole('textbox').fill('Hello Shadow');
\`\`\`

---
### 🎯 Ваше завдання
Як Playwright за замовчуванням обробляє пошук елементів, які знаходяться всередині відкритого (open) Shadow DOM?
`,
        code: "// HTML містить Shadow DOM\n// <custom-element> -> #shadow-root -> <button>Click me</button>\n\ntest('shadow dom', async ({ page }) => {\n  // Як знайти цю кнопку?\n  await page.getByRole('button', { name: 'Click me' }).click();\n});",
        type: "quiz",
        options: [
            "Playwright автоматично шукає в Shadow DOM",
            "Треба додати спеціальний флаг { shadow: true }",
            "Shadow DOM недоступний для Playwright",
            "Треба використовувати XPath"
        ],
        correctAnswer: "Playwright автоматично шукає в Shadow DOM"
    },
    {
        title: "5.4 Advanced Mocking: Симуляція помилок сервера (500)",
        description: `## 🛑 Негативне тестування: Як фронтенд реагує на падіння бекенду?

Ми перевіряємо "зелений" (успішний) сценарій. Але що бачить юзер, якщо база даних відвалилась або API повернуло 500 Internal Server Error? 
Білий екран? Нескінченний лоадер? Чи гарне повідомлення "Ой, щось пішло не так"?

Щоб перевірити це, нам не треба ламати реальний сервер. Ми можемо "навчити" Playwright підміняти відповіді на льоту!

## 🛠 Концепція на практиці
\`\`\`typescript
test('Обробка помилки сервера (500)', async ({ page }) => {\n
  // 1. ПЕРЕХОПЛЮЄМО запит до API перед тим, як натиснути кнопку
  await page.route('**/api/v1/checkout', async route => {\n
    // Підміняємо: замість реального бекенду повертаємо 500 помилку
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Database timeout' })
    });
  });

  // 2. ДІЯ: Юзер натискає "Оплатити"
  await page.getByRole('button', { name: 'Оплатити' }).click();

  // 3. ПЕРЕВІРКА: Фронтенд має правильно обробити цей конкретний фейл
  await expect(page.getByText('Сервер недоступний. Спробуйте пізніше.'))
        .toBeVisible();
});
\`\`\`

---
### 🎯 Ваше завдання
Який метод об'єкта \`route\` у Playwright використовується для того, щоб підмінити відповідь сервера і змусити його повернути кастомний HTTP статус (наприклад, 500)?
`,
        code: "test('server error', async ({ page }) => {\n  await page.route('**/api/data', route => {\n    // Яка команда поверне помилку 500?\n    /* Ваша відповідь */;\n  });\n});",
        type: "quiz",
        options: [
            "route.fulfill({ status: 500 })",
            "route.abort()",
            "route.continue()",
            "page.reload()"
        ],
        correctAnswer: "route.fulfill({ status: 500 })"
    },
    {
        title: "5.5 Багато вікон (Tabs): Кліки, що відкривають нову вкладку",
        description: `## 🪟 Обробка нових вкладок (\`target="_blank"\`)

**Проблема**: Ваш тест клікає на посилання "Умови використання", і воно відкривається у НОВІЙ вкладці.
Об'єкт \`page\`, з яким ви працювали, залишився на старій вкладці! Якщо ви спробуєте знайти текст на новій сторінці через старий \`page\`, тест впаде.

**Рішення**: Треба "зловити" подію створення нової вкладки і отримати новий об'єкт \`page\`.

## 🛠 Концепція на практиці
У Playwright це робиться через комбінацію \`Promise.all()\` та очікування події контексту.

\`\`\`typescript
test('Перевірка нової вкладки', async ({ page, context }) => {
  await page.goto('/home');

  // Починаємо чекати на нову вкладку ПАРАЛЕЛЬНО з кліком
  const [newPage] = await Promise.all([
    context.waitForEvent('page'), // 👈 Очікування події
    page.getByRole('link', { name: 'Умови використання' }).click() // 👈 Клік
  ]);

  // Чекаємо, поки нова вкладка завантажиться
  await newPage.waitForLoadState();

  // ТЕПЕР ПРАЦЮЄМО З НОВОЮ ВКЛАДКОЮ (newPage)
  await expect(newPage).toHaveURL(/.*terms/);
  await expect(newPage.locator('h1')).toHaveText('Terms of Service');

  // Стара сторінка все ще доступна через об'єкт 'page'!
  await expect(page.locator('.cookie-banner')).toBeVisible();
});
\`\`\`

---
### 🎯 Ваше завдання
Який метод об'єкта \`context\` використовується для "перехоплення" об'єкта нової сторінки (вкладки), яка відкривається після кліку?
`,
        code: "test('new tab', async ({ page, context }) => {\n  const [newPage] = await Promise.all([\n    /* Який метод чекає на нову вкладку? */,\n    page.locator('#open-in-new-tab').click()\n  ]);\n});",
        type: "quiz",
        options: [
            "context.waitForEvent('page')",
            "page.waitForNewTab()",
            "browser.on('target')",
            "page.expectPopup()"
        ],
        correctAnswer: "context.waitForEvent('page')"
    }
];
