require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const finalTasks = [
    {
        id: 198,
        titleEn: "Test Annotations & Execution Control (test.skip / test.fixme)",
        titleRu: "Аннотации тестов: Управление выполнением (skip / fixme)",
        descriptionUk: `## 🏷️ Тестові анотації: Управління виконанням (test.skip / test.fixme)

**Теорія**
В реальних проєктах автотести іноді ламаються через баги на бекенді, або певний функціонал ще розробляється. Замість коментування коду Playwright пропонує професійні тестові анотації:
- \`test.skip('умова', ...)\` — пропускає тест (наприклад, тільки для WebKit або Safari).
- \`test.fixme('причина', ...)\` — позначає тест як відомий баг. Тест не запуститься і нагадає команді про необхідність лагодження.
- \`test.slow()\` — збільшує таймаут для важких операцій у 3 рази.

**Приклад**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('тест експорту великого звіту', async ({ page, browserName }) => {
    test.fixme(browserName === 'firefox', 'Відомий баг з завантаженням файлів у Firefox #1234');
    await page.goto('/reports');
});
\`\`\`

### Завдання
1. Додайте \`test.fixme()\` з коментарем про відомий дефект форми реєстрації.
2. Реалізуйте базову перевірку форми, яка виконається після виправлення бага.`,
        descriptionEn: `## 🏷️ Test Annotations & Control (test.skip / test.fixme)

**Theory**
In professional QA automation, commenting out broken tests is considered an anti-pattern. Playwright provides built-in test annotations to manage test execution cleanly:
- \`test.skip()\` — conditionally or unconditionally bypasses execution.
- \`test.fixme()\` — flags broken tests due to known bugs. Playwright skips them and reports them as tracked issues.
- \`test.slow()\` — triples test timeout for resource-heavy operations.

**Example**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('heavy report generation', async ({ page, browserName }) => {
    test.fixme(browserName === 'firefox', 'Tracked bug #1234');
    await page.goto('/reports');
});
\`\`\`

### Task
1. Mark the test using \`test.fixme('Bug #452: Submit button unresponsive')\`.
2. Locate the submit button and assert visibility for future test runs.`,
        descriptionRu: `## 🏷️ Аннотации тестов: Управление выполнением (test.skip / test.fixme)

**Теория**
Playwright предоставляет удобные аннотации для управления запуском тестов:
- \`test.skip()\` — пропуск теста (по условию или безусловно).
- \`test.fixme()\` — помечает тест как ожидающий исправления известного бага.
- \`test.slow()\` — увеличивает таймаут теста в 3 раза.

**Пример**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('сложный сценарий', async ({ page, browserName }) => {
    test.fixme(browserName === 'webkit', 'Баг рендера в Safari #789');
    await page.goto('/checkout');
});
\`\`\`

### Задание
1. Добавьте аннотацию \`test.fixme()\` с причиной бага.
2. Напишите базовую проверку видимости кнопки отправки.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('2.13 Управління виконанням тесту', async ({ page }) => {
    // TODO: 1. Позначте тест як fixme через відомий баг
    test.fixme(true, 'Баг #452: Кнопка збереження заблокована');

    await page.goto('https://example.com');
    const submitBtn = page.getByRole('button', { name: 'Save' });
    await expect(submitBtn).toBeVisible();
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('2.13 Test Execution Control', async ({ page }) => {
    // TODO: 1. Annotate test with test.fixme
    test.fixme(true, 'Bug #452: Submit button blocked');

    await page.goto('https://example.com');
    const submitBtn = page.getByRole('button', { name: 'Save' });
    await expect(submitBtn).toBeVisible();
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('2.13 Управление выполнением теста', async ({ page }) => {
    // TODO: 1. Пометьте тест через test.fixme
    test.fixme(true, 'Баг #452: Кнопка заблокирована');

    await page.goto('https://example.com');
    const submitBtn = page.getByRole('button', { name: 'Save' });
    await expect(submitBtn).toBeVisible();
});
`
    },
    {
        id: 199,
        titleEn: "Test Suite Grouping & Scope (test.describe)",
        titleRu: "Группировка тестов: Блоки test.describe",
        descriptionUk: `## 📂 Групування тестів: test.describe

**Теорія**
Блок \`test.describe\` структурує автотести за функціональними модулями (наприклад, \`Авторизація\`, \`Кошик\`, \`Особистий кабінет\`). Він дозволяє:
- Ізолювати хуки \`beforeEach\` та \`afterEach\` виключно для конкретної групи.
- Задавати специфічні конфігурації (паралелізм, таймаути) для окремого блоку тестів: \`test.describe.configure({ mode: 'parallel' })\`.
- Генерувати красиві структуровані HTML та Allure звіти.

**Приклад**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Модуль авторизації', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('успішний вхід', async ({ page }) => { /* ... */ });
    test('невірний пароль', async ({ page }) => { /* ... */ });
});
\`\`\`

### Завдання
1. Згрупуйте 2 тести в блок \`test.describe('User Authentication', () => { ... })\`.
2. Додайте спільний \`beforeEach\` для переходу на \`https://example.com\`.`,
        descriptionEn: `## 📂 Test Suite Grouping: test.describe

**Theory**
The \`test.describe\` block organizes related tests into clean logical suites (e.g. Authentication, Shopping Cart, User Profile). Benefits:
- Scopes \`beforeEach\` and \`afterEach\` hooks exclusively to this suite.
- Supports suite-level configuration: \`test.describe.configure({ mode: 'parallel' })\`.
- Structures HTML and Allure test reports with collapsible sections.

**Example**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Auth Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('valid credentials', async ({ page }) => { /* ... */ });
});
\`\`\`

### Task
1. Wrap the tests in \`test.describe('User Authentication', () => { ... })\`.
2. Add a shared \`test.beforeEach\` hook navigating to \`https://example.com\`.`,
        descriptionRu: `## 📂 Группировка тестов: test.describe

**Теория**
Блок \`test.describe\` объединяет тесты в логические сьюты (Авторизация, Корзина, Настройки). Позволяет изолировать хуки \`beforeEach\` и настраивать параллельность запусков.

**Пример**
\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Модуль авторизации', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('успешный вход', async ({ page }) => { /* ... */ });
});
\`\`\`

### Задание
1. Объедините тесты в \`test.describe('User Authentication', () => { ... })\`.
2. Добавьте хук \`beforeEach\` для открытия \`https://example.com\`.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

// TODO: 1. Огорніть тести в блок test.describe('User Authentication', ...)
test.describe('User Authentication', () => {
    // TODO: 2. Створіть спільний beforeEach
    test.beforeEach(async ({ page }) => {
        await page.goto('https://example.com');
    });

    test('перевірка головної сторінки', async ({ page }) => {
        await expect(page).toHaveTitle(/Example/);
    });
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

// TODO: 1. Wrap tests in test.describe('User Authentication', ...)
test.describe('User Authentication', () => {
    // TODO: 2. Add shared beforeEach hook
    test.beforeEach(async ({ page }) => {
        await page.goto('https://example.com');
    });

    test('verify homepage title', async ({ page }) => {
        await expect(page).toHaveTitle(/Example/);
    });
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

// TODO: 1. Оберните тесты в блок test.describe('User Authentication', ...)
test.describe('User Authentication', () => {
    // TODO: 2. Добавьте общий beforeEach
    test.beforeEach(async ({ page }) => {
        await page.goto('https://example.com');
    });

    test('проверка заголовка страницы', async ({ page }) => {
        await expect(page).toHaveTitle(/Example/);
    });
});
`
    },
    {
        id: 200,
        titleEn: "Soft Assertions: Non-blocking Validations (expect.soft)",
        titleRu: "Мягкие проверки: Soft Assertions (expect.soft)",
        descriptionUk: `## 🪶 М'які перевірки: Soft Assertions (expect.soft)

**Теорія**
За замовчуванням будь-який впалий \`expect()\` негайно зупиняє виконання тесту. Проте часто буває потрібно перевірити відразу декілька незалежних елементів (наприклад, всі бейджі товару, ціну, знижку та наявність на складі). Для цього використовують \`expect.soft()\`:
- Якщо перевірка не проходить — тест фіксує помилку, але **продовжує виконання наступних кроків**.
- Наприкінці виконання Playwright фіксує всі накопичені помилки в єдиний звіт.

**Приклад**
\`\`\`typescript
// Звичайний expect зупинить тест тут, якщо заголовок не вірний
await expect.soft(page.locator('.badge')).toHaveText('NEW');
await expect.soft(page.locator('.price')).toHaveText('$99');
await expect(page.getByRole('button', { name: 'Купити' })).toBeEnabled();
\`\`\`

### Завдання
1. Перейдіть на \`https://example.com\`.
2. Виконайте м'яку перевірку \`expect.soft\` для заголовка \`h1\`.
3. Виконайте звичайний \`expect\` для перевірки наявності посилання.`,
        descriptionEn: `## 🪶 Soft Assertions: Non-blocking Validations (expect.soft)

**Theory**
Standard \`expect()\` immediately terminates the test upon first failure. In many UI verification scenarios (checking product cards with title, price, discount tag, and stock status), you want to collect all errors in a single run. \`expect.soft()\` enables this:
- Failures are logged, but test execution proceeds.
- The test suite fails at the end, displaying every soft failure.

**Example**
\`\`\`typescript
await expect.soft(page.locator('.badge')).toHaveText('NEW');
await expect.soft(page.locator('.price')).toHaveText('$99');
await expect(page.getByRole('button', { name: 'Buy' })).toBeEnabled();
\`\`\`

### Task
1. Navigate to \`https://example.com\`.
2. Perform a non-blocking check with \`expect.soft\` on \`h1\`.
3. Conclude with a strict \`expect\` on the link element.`,
        descriptionRu: `## 🪶 Мягкие проверки: Soft Assertions (expect.soft)

**Теория**
Обычные проверки прерывают тест при первом же несовпадении. \`expect.soft()\` позволяет собрать все ошибки на странице (например, при проверке карточки товара) за один прогон без остановки теста.

**Пример**
\`\`\`typescript
await expect.soft(page.locator('.badge')).toHaveText('NEW');
await expect.soft(page.locator('.price')).toHaveText('$99');
await expect(page.getByRole('button', { name: 'Купить' })).toBeEnabled();
\`\`\`

### Задание
1. Откройте \`https://example.com\`.
2. Используйте \`expect.soft\` для проверки заголовка \`h1\`.
3. Используйте строгий \`expect\` для проверки ссылки.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('2.15 М\\'які перевірки форми', async ({ page }) => {
    await page.goto('https://example.com');

    // TODO: 1. Використайте expect.soft для перевірки заголовка h1
    await expect.soft(page.locator('h1')).toHaveText(/Example/);

    // TODO: 2. Використайте звичайний expect для перевірки посилання
    const link = page.getByRole('link');
    await expect(link).toBeVisible();
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('2.15 Soft Assertions in Playwright', async ({ page }) => {
    await page.goto('https://example.com');

    // TODO: 1. Use expect.soft to verify h1 header
    await expect.soft(page.locator('h1')).toHaveText(/Example/);

    // TODO: 2. Use regular expect for link visibility
    const link = page.getByRole('link');
    await expect(link).toBeVisible();
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('2.15 Мягкие проверки формы', async ({ page }) => {
    await page.goto('https://example.com');

    // TODO: 1. Используйте expect.soft для проверки h1
    await expect.soft(page.locator('h1')).toHaveText(/Example/);

    // TODO: 2. Используйте обычный expect для проверки ссылки
    const link = page.getByRole('link');
    await expect(link).toBeVisible();
});
`
    }
];

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Updating final 3 tasks for Track 3 (Level 2)...");
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
        console.log("Track 3 (Level 2) is 100% complete!");
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
