require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const finalTasks = [
    {
        id: 108,
        titleEn: "Viewport & Mobile Emulation (Responsive Design)",
        titleRu: "Эмуляция мобильных устройств и Viewport",
        descriptionUk: `## 📱 Viewport та емуляція мобільних пристроїв

**Теорія**
Сучасний QA має гарантувати якість веб-додатків на будь-яких екранах. Playwright дозволяє динамічно змінювати розміри вікна браузера (\`page.setViewportSize\`) або симулювати мобільні девайси (iPhone, Pixel) з підтримкою тач-скріну та відповідного User-Agent.

**Приклад**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('тест мобільного меню', async ({ page }) => {
    // Встановлюємо мобільну роздільну здатність
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://example.com');

    // На мобільному має відображатися бургер-меню
    const burgerButton = page.getByRole('button', { name: /open menu/i });
    await expect(burgerButton).toBeVisible();
});
\`\`\`

### Завдання
1. Встановіть розмір в'юпорту: ширина \`390\`, висота \`844\` (роздільна здатність iPhone 12/13/14).
2. Перейдіть на сторінку \`https://playwright.dev\`.
3. Перевірте, що кнопка меню навігації \`button[aria-label="Navigation bar toggle"]\` стала видимою.`,
        descriptionEn: `## 📱 Viewport & Mobile Emulation

**Theory**
Modern automated testing requires verifying responsive web layouts across all devices. Playwright enables on-the-fly viewport resizing via \`page.setViewportSize\` as well as complete mobile device emulation including touch events and user agents.

**Example**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('mobile responsive view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://example.com');

    const burger = page.getByRole('button', { name: /menu/i });
    await expect(burger).toBeVisible();
});
\`\`\`

### Task
1. Set the viewport size to width \`390\` and height \`844\`.
2. Navigate to \`https://playwright.dev\`.
3. Assert that the mobile toggle button \`button[aria-label="Navigation bar toggle"]\` is visible.`,
        descriptionRu: `## 📱 Viewport и адаптивный дизайн

**Теория**
Playwright позволяет проверять адаптивную верстку сайтов с помощью метода \`page.setViewportSize\`, симулируя мобильные телефоны и планшеты с нужным соотношением сторон и тач-событиями.

**Пример**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('мобильный вид', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://example.com');
    await expect(page.getByRole('button', { name: /меню/i })).toBeVisible();
});
\`\`\`

### Задание
1. Задайте viewport: ширина \`390\`, высота \`844\`.
2. Перейдите на \`https://playwright.dev\`.
3. Убедитесь, что мобильное меню \`button[aria-label="Navigation bar toggle"]\` отображается на экране.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('1.18 Тестування мобільного вьюпорту', async ({ page }) => {
    // TODO: 1. Встановіть мобільний розмір екрану (width: 390, height: 844)
    await page.setViewportSize({ width: 390, height: 844 });

    // TODO: 2. Перейдіть на https://playwright.dev
    await page.goto('https://playwright.dev');

    // TODO: 3. Перевірте видимість мобільної кнопки меню
    const toggleButton = page.locator('button[aria-label="Navigation bar toggle"]');
    await expect(toggleButton).toBeVisible();
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('1.18 Mobile Viewport Verification', async ({ page }) => {
    // TODO: 1. Set mobile viewport size (width: 390, height: 844)
    await page.setViewportSize({ width: 390, height: 844 });

    // TODO: 2. Navigate to https://playwright.dev
    await page.goto('https://playwright.dev');

    // TODO: 3. Verify mobile toggle button is visible
    const toggleButton = page.locator('button[aria-label="Navigation bar toggle"]');
    await expect(toggleButton).toBeVisible();
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('1.18 Проверка мобильного Viewport', async ({ page }) => {
    // TODO: 1. Установите размеры экрана (width: 390, height: 844)
    await page.setViewportSize({ width: 390, height: 844 });

    // TODO: 2. Перейдите на https://playwright.dev
    await page.goto('https://playwright.dev');

    // TODO: 3. Проверьте видимость кнопки мобильного меню
    const toggleButton = page.locator('button[aria-label="Navigation bar toggle"]');
    await expect(toggleButton).toBeVisible();
});
`
    },
    {
        id: 109,
        titleEn: "Assertions: Element Visibility (toBeVisible)",
        titleRu: "Проверки: Видимость элементов (toBeVisible)",
        descriptionUk: `## 👁️ Assertions: Перевірка видимості (toBeVisible)

**Теорія**
\`expect(locator).toBeVisible()\` — одна з найчастіших та найважливіших перевірок у Playwright. Вона автоматично очікує (auto-waiting), поки елемент з'явиться в DOM, матиме ненульовий розмір і не буде прихованим стилями на кшталт \`display: none\` чи \`visibility: hidden\`.

**Приклад**
\`\`\`typescript
const submitBtn = page.getByRole('button', { name: 'Зареєструватися' });
await expect(submitBtn).toBeVisible();
\`\`\`

### Завдання
1. Відкрийте сторінку \`https://playwright.dev\`.
2. Знайдіть кнопку "Get started" за роллю \`link\` та назвою \`Get started\`.
3. Додайте assertion \`toBeVisible()\`.`,
        descriptionEn: `## 👁️ Assertions: Element Visibility (toBeVisible)

**Theory**
\`expect(locator).toBeVisible()\` is the core assertion in Playwright UI testing. It provides web-first auto-retrying assertions, ensuring elements appear on screen, have non-zero geometry, and are not obscured or hidden by CSS.

**Example**
\`\`\`typescript
const submitBtn = page.getByRole('button', { name: 'Submit' });
await expect(submitBtn).toBeVisible();
\`\`\`

### Task
1. Open \`https://playwright.dev\`.
2. Locate the "Get started" link using role \`link\` and name \`Get started\`.
3. Assert visibility using \`toBeVisible()\`.`,
        descriptionRu: `## 👁️ Assertions: Проверка видимости (toBeVisible)

**Теория**
\`expect(locator).toBeVisible()\` автоматически ожидает появления элемента на экране с корректной геометрией (не скрыт через \`opacity: 0\`, \`display: none\` и т.д.).

**Пример**
\`\`\`typescript
const submitBtn = page.getByRole('button', { name: 'Войти' });
await expect(submitBtn).toBeVisible();
\`\`\`

### Задание
1. Откройте \`https://playwright.dev\`.
2. Найдите ссылку "Get started" с помощью \`getByRole('link', { name: 'Get started' })\`.
3. Проверьте её видимость через \`toBeVisible()\`.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('1.19 Перевірка видимості кнопки', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Знайдіть посилання "Get started"
    const getStartedLink = page.getByRole('link', { name: 'Get started' });

    // TODO: 2. Перевірте, що елемент видимий
    await expect(getStartedLink).toBeVisible();
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('1.19 Verify Element Visibility', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Locate the "Get started" link
    const getStartedLink = page.getByRole('link', { name: 'Get started' });

    // TODO: 2. Assert visibility
    await expect(getStartedLink).toBeVisible();
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('1.19 Проверка видимости элемента', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Найдите ссылку "Get started"
    const getStartedLink = page.getByRole('link', { name: 'Get started' });

    // TODO: 2. Проверьте видимость
    await expect(getStartedLink).toBeVisible();
});
`
    },
    {
        id: 110,
        titleEn: "Assertions: Exact Text Verification (toHaveText)",
        titleRu: "Проверки: Точный текст элементов (toHaveText)",
        descriptionUk: `## 📝 Assertions: Перевірка точного тексту (toHaveText)

**Теорія**
Метод \`expect(locator).toHaveText('expected')\` гарантує, що елемент містить точний або відповідний регулярному виразу текстовий контент. На відміну від звичайного \`locator.innerText()\`, асерт \`toHaveText\` повторює спроби (auto-retry), поки бекенд не підвантажить потрібний рядок.

**Приклад**
\`\`\`typescript
const header = page.locator('h1');
await expect(header).toHaveText('Ласкаво просимо!');
\`\`\`

### Завдання
1. Перейдіть на \`https://playwright.dev\`.
2. Знайдіть головний заголовок \`h1.hero__title\` або \`page.locator('h1')\`.
3. Перевірте регулярним виразом або підрядком, що текст містить \`Playwright\`.`,
        descriptionEn: `## 📝 Assertions: Text Verification (toHaveText)

**Theory**
The \`expect(locator).toHaveText()\` matcher verifies that element text matches expected string or RegExp. It features auto-retrying, giving single-page apps time to fetch and render content asynchronously.

**Example**
\`\`\`typescript
const header = page.locator('h1');
await expect(header).toHaveText('Welcome!');
\`\`\`

### Task
1. Navigate to \`https://playwright.dev\`.
2. Locate the main heading \`page.locator('h1')\`.
3. Assert that the heading contains \`Playwright\`.`,
        descriptionRu: `## 📝 Assertions: Проверка текста (toHaveText)

**Теория**
Ассерт \`expect(locator).toHaveText()\` с автоповторами проверяет строковое значение внутри элемента интерфейса.

**Пример**
\`\`\`typescript
const header = page.locator('h1');
await expect(header).toHaveText('Добро пожаловать!');
\`\`\`

### Задание
1. Откройте \`https://playwright.dev\`.
2. Найдите заголовок \`page.locator('h1')\`.
3. Проверьте через \`toHaveText(/Playwright/)\`, что он содержит название фреймворка.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('1.20 Перевірка тексту заголовка', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Отримайте заголовок h1
    const heading = page.locator('h1');

    // TODO: 2. Перевірте, що заголовок містить слово 'Playwright'
    await expect(heading).toHaveText(/Playwright/);
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('1.20 Heading Text Assertion', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Locate h1 heading
    const heading = page.locator('h1');

    // TODO: 2. Verify text includes 'Playwright'
    await expect(heading).toHaveText(/Playwright/);
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('1.20 Проверка текста заголовка', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Найдите заголовок h1
    const heading = page.locator('h1');

    // TODO: 2. Проверьте совпадение текста с 'Playwright'
    await expect(heading).toHaveText(/Playwright/);
});
`
    },
    {
        id: 111,
        titleEn: "Navigation: Page Reload & State Refresh (page.reload)",
        titleRu: "Навигация: Перезагрузка страницы (page.reload)",
        descriptionUk: `## 🔄 Навігація: Перезавантаження сторінки (page.reload)

**Теорія**
Метод \`page.reload()\` імітує натискання F5 користувачем. В автотестах це незамінно для перевірки збереження стану (State Persistence): перевірки, що дані в кошику, авторизаційна сесія або заповнені чернетки не зникають після релоаду.

**Приклад**
\`\`\`typescript
await page.reload();
await expect(page.locator('.user-badge')).toBeVisible();
\`\`\`

### Завдання
1. Перейдіть на \`https://playwright.dev\`.
2. Виконайте перезавантаження сторінки через \`page.reload()\`.
3. Перевірте, що URL залишився \`https://playwright.dev/\`.`,
        descriptionEn: `## 🔄 Navigation: Page Reload (page.reload)

**Theory**
\`page.reload()\` simulates a browser refresh (F5). This is a critical pattern in E2E automation for testing state persistence: ensuring user cart, saved filters, or auth cookies remain intact after reload.

**Example**
\`\`\`typescript
await page.reload();
await expect(page.locator('.user-badge')).toBeVisible();
\`\`\`

### Task
1. Navigate to \`https://playwright.dev\`.
2. Reload page via \`page.reload()\`.
3. Assert that current URL is still \`https://playwright.dev/\`.`,
        descriptionRu: `## 🔄 Навигация: Перезагрузка страницы (page.reload)

**Теория**
Метод \`page.reload()\` перезагружает текущую страницу. В тестах используется для проверки сохранения сессии, корзины покупок или фильтров после обновления.

**Пример**
\`\`\`typescript
await page.reload();
await expect(page.locator('.user-badge')).toBeVisible();
\`\`\`

### Задание
1. Откройте \`https://playwright.dev\`.
2. Перезагрузите страницу с помощью \`page.reload()\`.
3. Убедитесь с помощью \`toHaveURL\`, что адрес не изменился.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('1.21 Перезавантаження сторінки та перевірка стану', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Виконайте перезавантаження сторінки
    await page.reload();

    // TODO: 2. Перевірте, що URL відповідає сайту
    await expect(page).toHaveURL('https://playwright.dev/');
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('1.21 Page Reload and URL Verification', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Reload the page
    await page.reload();

    // TODO: 2. Verify URL stays correct
    await expect(page).toHaveURL('https://playwright.dev/');
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('1.21 Перезагрузка страницы и проверка URL', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Перезагрузите страницу
    await page.reload();

    // TODO: 2. Проверьте URL
    await expect(page).toHaveURL('https://playwright.dev/');
});
`
    }
];

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Updating final 4 tasks for Track 1...");
        for (const t of finalTasks) {
            await conn.query(
                `UPDATE tasks SET 
                    title_en = ?,
                    title_ru = ?,
                    description = ?,
                    description_en = ?,
                    description_ru = ?,
                    initial_code = ?,
                    initial_code_en = ?,
                    initial_code_ru = ?
                WHERE id = ?`,
                [
                    t.titleEn,
                    t.titleRu,
                    t.descriptionUk,
                    t.descriptionEn,
                    t.descriptionRu,
                    t.initialCodeUk,
                    t.initialCodeEn,
                    t.initialCodeRu,
                    t.id
                ]
            );
            console.log(`✓ Updated task #${t.id}: ${t.titleEn}`);
        }
        console.log("Track 1 is 100% complete!");
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
