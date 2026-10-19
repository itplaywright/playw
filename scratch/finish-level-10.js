require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const finalBossTasks = [
    {
        id: 892,
        titleEn: "CI/CD Pipeline: GitHub Actions for Playwright",
        titleRu: "CI/CD пайплайн: GitHub Actions для Playwright",
        descriptionUk: `## 🚀 CI/CD Pipeline: GitHub Actions для Playwright

**Теорія**
В Enterprise розробці тести запускаються автоматично при створенні Pull Request. Playwright має офіційні GitHub Actions для інсталяції браузерів, кешування залежностей та публікації звітів у GitHub Pages / Artifacts.

**Приклад**
\`\`\`yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
\`\`\`

### Завдання
1. Налаштуйте робочий процес GitHub Actions \`.github/workflows/playwright.yml\`.
2. Додайте збереження артефакту \`playwright-report\` на випадок падіння тестів (\`if: always()\`).`,
        descriptionEn: `## 🚀 CI/CD Pipeline: GitHub Actions for Playwright

**Theory**
In modern engineering workflows, automated test suites execute on every Pull Request. Playwright provides official GitHub Actions actions for headless browser provisioning, OS dependency management, and report artifact publishing.

**Example**
\`\`\`yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
\`\`\`

### Task
1. Configure a production-ready workflow in \`.github/workflows/playwright.yml\`.
2. Add report artifact archiving with \`if: always()\` condition.`,
        descriptionRu: `## 🚀 CI/CD пайплайн: GitHub Actions для Playwright

**Теория**
Playwright интегрируется в GitHub Actions для проверки каждого Pull Request с автоматическим развертыванием браузеров в Linux-окружении и архивацией HTML-отчетов.

**Пример**
\`\`\`yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
\`\`\`

### Задание
1. Опишите пайплайн запуска тестов в \`.github/workflows/playwright.yml\`.
2. Настройте выгрузку артефакта \`playwright-report\` по завершении.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

// TODO: 1. Перевірте базову конфігурацію для CI
test('10.1 Перевірка готовності до CI/CD запуску', async ({ page }) => {
    await page.goto('https://playwright.dev');
    await expect(page).toHaveTitle(/Playwright/);
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

// TODO: 1. Verify CI run readiness
test('10.1 CI/CD Readiness Verification', async ({ page }) => {
    await page.goto('https://playwright.dev');
    await expect(page).toHaveTitle(/Playwright/);
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

// TODO: 1. Проверьте готовность теста к запуску в CI
test('10.1 Проверка готовности к CI/CD запуску', async ({ page }) => {
    await page.goto('https://playwright.dev');
    await expect(page).toHaveTitle(/Playwright/);
});
`
    },
    {
        id: 893,
        titleEn: "Docker: Containerized Playwright Testing",
        titleRu: "Docker: Playwright в изолированных контейнерах",
        descriptionUk: `## 🐳 Docker: Playwright у контейнерах

**Теорія**
Офіційний Docker-образ \`mcr.microsoft.com/playwright\` містить усі шрифти та системні залежності Linux (GTK, GLib). Це гарантує, що скріншоти та шрифти рендеряться на 100% однаково як у розробника на Mac/Windows, так і на CI сервері.

**Приклад**
\`\`\`bash
docker run --rm -v $(pwd):/work/ -w /work/ mcr.microsoft.com/playwright:v1.49.0-noble npx playwright test
\`\`\`

### Завдання
1. Додайте конфігурацію для запуску в Docker.
2. Перевірте, що тести запускаються в headless режимі всередині контейнера.`,
        descriptionEn: `## 🐳 Docker: Containerized Playwright Testing

**Theory**
The official \`mcr.microsoft.com/playwright\` container image includes all Linux dependencies and system fonts. Running tests inside Docker eliminates "works on my machine" issues and guarantees identical visual rendering between local machines and CI.

**Example**
\`\`\`bash
docker run --rm -v $(pwd):/work/ -w /work/ mcr.microsoft.com/playwright:v1.49.0-noble npx playwright test
\`\`\`

### Task
1. Configure test execution for headless Docker execution.
2. Assert environment readiness inside containerized runners.`,
        descriptionRu: `## 🐳 Docker: Playwright в контейнерах

**Теория**
Официальный образ Docker \`mcr.microsoft.com/playwright\` решает проблемы со шрифтами и системными зависимостями, гарантируя 100% идентичность прогона тестов локально и на CI.

**Пример**
\`\`\`bash
docker run --rm -v $(pwd):/work/ -w /work/ mcr.microsoft.com/playwright:v1.49.0-noble npx playwright test
\`\`\`

### Задание
1. Настройте конфигурацию для контейнеризированного запуска.
2. Убедитесь в корректности выполнения тестов в headless режиме.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.2 Перевірка середовища в Docker', async ({ page }) => {
    // TODO: 1. Перейдіть на сторінку документації Docker
    await page.goto('https://playwright.dev/docs/docker');

    // TODO: 2. Перевірте наявність інструкції для офіційного образу
    const heading = page.locator('h1');
    await expect(heading).toContainText(/Docker/i);
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.2 Docker Environment Verification', async ({ page }) => {
    // TODO: 1. Navigate to Docker documentation
    await page.goto('https://playwright.dev/docs/docker');

    // TODO: 2. Assert official image docs are visible
    const heading = page.locator('h1');
    await expect(heading).toContainText(/Docker/i);
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.2 Проверка окружения Docker', async ({ page }) => {
    // TODO: 1. Откройте документацию Docker
    await page.goto('https://playwright.dev/docs/docker');

    // TODO: 2. Проверьте заголовок раздела
    const heading = page.locator('h1');
    await expect(heading).toContainText(/Docker/i);
});
`
    },
    {
        id: 894,
        titleEn: "Environment Variables: Enterprise Secrets Management",
        titleRu: "Переменные окружения: Безопасное управление секретами",
        descriptionUk: `## 🔐 Безпечне управління секретами (Environment Variables)

**Теорія**
Ніколи не зберігайте логіни, API-ключі або паролі в репозиторії. Використовуйте \`process.env\` разом із \`dotenv\` для динамічного завантаження середовищ (DEV, STAGING, PROD).

**Приклад**
\`\`\`typescript
const baseURL = process.env.BASE_URL || 'https://staging.example.com';
const userToken = process.env.AUTH_SECRET;
\`\`\`

### Завдання
1. Прочитайте змінні \`BASE_URL\` та \`TEST_USER\` через \`process.env\`.
2. Додайте дефолтні значення на випадок відсутності змінних.`,
        descriptionEn: `## 🔐 Enterprise Secrets Management

**Theory**
Hardcoding production credentials, API keys, or tokens in test suites is a critical vulnerability. Playwright projects manage secrets through environment variables and dedicated \`.env\` configurations per target environment (QA, STAGING, PROD).

**Example**
\`\`\`typescript
const baseURL = process.env.BASE_URL || 'https://staging.example.com';
const userToken = process.env.AUTH_SECRET;
\`\`\`

### Task
1. Read \`BASE_URL\` and \`TEST_USER\` from \`process.env\`.
2. Provide fallback defaults for local execution.`,
        descriptionRu: `## 🔐 Переменные окружения и секреты

**Теория**
Никогда не храните пароли и токены в кодовой базе. Playwright использует \`process.env\` для безопасного переключения между окружениями (DEV, STAGE, PROD).

**Пример**
\`\`\`typescript
const baseURL = process.env.BASE_URL || 'https://staging.example.com';
const userToken = process.env.AUTH_SECRET;
\`\`\`

### Задание
1. Получите \`BASE_URL\` и имя пользователя из \`process.env\`.
2. Задайте дефолтные значения для локальных запусков.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.3 Робота з environment variables', async ({ page }) => {
    // TODO: 1. Отримайте базовий URL зі змінних середовища
    const targetUrl = process.env.BASE_URL || 'https://playwright.dev';

    await page.goto(targetUrl);
    await expect(page).toHaveURL(/playwright/);
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.3 Environment Variables Usage', async ({ page }) => {
    // TODO: 1. Read base URL from environment variables
    const targetUrl = process.env.BASE_URL || 'https://playwright.dev';

    await page.goto(targetUrl);
    await expect(page).toHaveURL(/playwright/);
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.3 Использование переменных окружения', async ({ page }) => {
    // TODO: 1. Считайте адрес из переменных окружения
    const targetUrl = process.env.BASE_URL || 'https://playwright.dev';

    await page.goto(targetUrl);
    await expect(page).toHaveURL(/playwright/);
});
`
    },
    {
        id: 895,
        titleEn: "Test Sharding: Distributed Execution Across Matrix Runners",
        titleRu: "Шардинг тестов: Распределенный запуск на нескольких машинах",
        descriptionUk: `## ⚡ Sharding: Розподілений запуск тестів

**Теорія**
Коли сьют налічує 1000+ тестів, навіть паралельні воркери не рятують. Механізм шардингу (\`--shard=1/4\`, \`--shard=2/4\`) розбиває тести на 4 незалежні CI машини, зменшуючи тривалість прогону з 40 хвилин до 10.

**Приклад**
\`\`\`bash
# CI Runner 1:
npx playwright test --shard=1/4
# CI Runner 2:
npx playwright test --shard=2/4
\`\`\`

### Завдання
1. Налаштуйте логіку розбиття сьюту на шарди.
2. Перевірте, що сьют завершується без конфліктів у blob-звітах.`,
        descriptionEn: `## ⚡ Test Sharding: Distributed Execution

**Theory**
When enterprise suites scale past hundreds of specs, single-agent execution creates pipeline bottlenecks. Playwright natively supports sharding (\`--shard=1/4\`) to distribute specs across matrix runners in parallel.

**Example**
\`\`\`bash
# CI Matrix Agent 1:
npx playwright test --shard=1/4
# CI Matrix Agent 2:
npx playwright test --shard=2/4
\`\`\`

### Task
1. Structure test specs for independent shard execution.
2. Merge blob report artifacts from parallel shards.`,
        descriptionRu: `## ⚡ Шардинг: Распределенное выполнение тестов

**Теория**
Шардинг (\`--shard=1/4\`) распределяет тесты между отдельными серверами CI, кратно ускоряя прогон многочасовых сьютов.

**Пример**
\`\`\`bash
npx playwright test --shard=1/4
\`\`\`

### Задание
1. Подготовьте тесты к изолированному запуску в разных шардах.
2. Убедитесь в отсутствии общих блокирующих зависимостей между тестами.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.4 Ізольований тест для шардингу', async ({ page }) => {
    // TODO: 1. Переконайтеся, що тест не залежить від стану інших тестів
    await page.goto('https://playwright.dev');
    await expect(page.getByRole('link', { name: 'Docs' })).toBeVisible();
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.4 Sharded Test Execution', async ({ page }) => {
    // TODO: 1. Ensure test has zero cross-test side effects
    await page.goto('https://playwright.dev');
    await expect(page.getByRole('link', { name: 'Docs' })).toBeVisible();
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.4 Изолированный тест для шардинга', async ({ page }) => {
    // TODO: 1. Убедитесь в полной независимости теста
    await page.goto('https://playwright.dev');
    await expect(page.getByRole('link', { name: 'Docs' })).toBeVisible();
});
`
    },
    {
        id: 896,
        titleEn: "Component Testing: Testing React, Vue & Svelte in Isolation",
        titleRu: "Component Testing: Тестирование компонентов React, Vue и Svelte",
        descriptionUk: `## 🧩 Playwright Component Testing

**Теорія**
Playwright Component Testing (CT) дозволяє тестувати окремі фронтенд-компоненти (кнопки, дропдауни, складні форми) у справжньому браузері Chromium/WebKit без підняття всього бекенду.

**Приклад**
\`\`\`typescript
import { test, expect } from '@playwright/experimental-ct-react';
import Button from './Button';

test('клік по кнопці викликає callback', async ({ mount }) => {
    let clicked = false;
    const component = await mount(<Button onClick={() => clicked = true}>Submit</Button>);
    await component.click();
    expect(clicked).toBeTruthy();
});
\`\`\`

### Завдання
1. Протестуйте ізольований рендер компонента.
2. Перевірте реакцію на кліки та зміну пропсів.`,
        descriptionEn: `## 🧩 Component Testing in Isolation

**Theory**
Playwright Experimental Component Testing mounts UI components directly inside a real browser engine (Chromium, Firefox, WebKit) with full access to the real DOM, CSS cascade, and browser APIs.

**Example**
\`\`\`typescript
import { test, expect } from '@playwright/experimental-ct-react';
import Button from './Button';

test('button click triggers handler', async ({ mount }) => {
    let clicked = false;
    const component = await mount(<Button onClick={() => clicked = true}>Submit</Button>);
    await component.click();
    expect(clicked).toBeTruthy();
});
\`\`\`

### Task
1. Mount the UI component inside the isolated browser context.
2. Validate props rendering and event emissions.`,
        descriptionRu: `## 🧩 Компонентное тестирование (Component Testing)

**Теория**
Playwright CT монтирует фронтенд-компоненты (React, Vue) в настоящем браузере, проверяя стили и события без необходимости поднимать бэкенд.

**Пример**
\`\`\`typescript
import { test, expect } from '@playwright/experimental-ct-react';
import Button from './Button';

test('клик по кнопке', async ({ mount }) => {
    const component = await mount(<Button>Click</Button>);
    await component.click();
});
\`\`\`

### Задание
1. Напишите тест изолированного рендеринга компонента.
2. Проверьте события клика и передачу параметров.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.5 Перевірка концепції компонентного тестування', async ({ page }) => {
    // TODO: 1. Перейдіть на розділ документації Component Testing
    await page.goto('https://playwright.dev/docs/test-components');
    await expect(page.locator('h1')).toContainText(/Component/i);
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.5 Component Testing Concepts', async ({ page }) => {
    // TODO: 1. Navigate to Component Testing docs
    await page.goto('https://playwright.dev/docs/test-components');
    await expect(page.locator('h1')).toContainText(/Component/i);
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.5 Концепция компонентного тестирования', async ({ page }) => {
    // TODO: 1. Откройте документацию Component Testing
    await page.goto('https://playwright.dev/docs/test-components');
    await expect(page.locator('h1')).toContainText(/Component/i);
});
`
    },
    {
        id: 897,
        titleEn: "Hybrid Load Testing: Integrating k6 with Playwright",
        titleRu: "Гибридное нагрузочное тестирование: k6 и Playwright",
        descriptionUk: `## 📊 Навантажувальне тестування: k6 + Playwright

**Теорія**
Поєднання протокольного навантаження (k6 генерує 10 000 віртуальних користувачів) із браузерними метриками Playwright (перевірка реального рендерингу UI під навантаженням) дає найточнішу картину стабільності системи.

**Приклад**
\`\`\`typescript
import { browser } from 'k6/browser';

export default async function () {
    const page = await browser.newPage();
    await page.goto('https://example.com');
    // Перевірка часу рендеру під навантаженням
}
\`\`\`

### Завдання
1. Дослідіть гібридну схему вимірювання Core Web Vitals під час високого навантаження.
2. Напишіть перевірку швидкості відповіді критичних сторінок.`,
        descriptionEn: `## 📊 Hybrid Load Testing: k6 + Playwright

**Theory**
Combining protocol-level load testing (k6 simulating thousands of concurrent API users) with real browser validation (Playwright rendering frontends under load) provides complete system resilience insights.

**Example**
\`\`\`typescript
import { browser } from 'k6/browser';

export default async function () {
    const page = await browser.newPage();
    await page.goto('https://example.com');
}
\`\`\`

### Task
1. Evaluate frontend responsiveness under peak server load.
2. Verify critical user journeys remain within performance SLA thresholds.`,
        descriptionRu: `## 📊 Нагрузочное тестирование: k6 + Playwright

**Теория**
Связка k6 (генерирует тысячи запросов к API) и Playwright (проверяет отклик реального интерфейса) позволяет выявить узкие места производительности до релиза.

**Пример**
\`\`\`typescript
import { browser } from 'k6/browser';

export default async function () {
    const page = await browser.newPage();
    await page.goto('https://example.com');
}
\`\`\`

### Задание
1. Оцените скорость отклика интерфейса при имитации нагрузки.
2. Проверьте соблюдение SLA по времени загрузки страницы.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.6 Вимірювання часу завантаження під навантаженням', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://playwright.dev');
    const duration = Date.now() - start;

    // TODO: 1. Переконайтеся, що завантаження вклалося в ліміт 5000ms
    expect(duration).toBeLessThan(5000);
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.6 Measuring Page Load Duration', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://playwright.dev');
    const duration = Date.now() - start;

    // TODO: 1. Assert duration is under 5000ms
    expect(duration).toBeLessThan(5000);
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.6 Замер времени загрузки страницы', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://playwright.dev');
    const duration = Date.now() - start;

    // TODO: 1. Убедитесь, что загрузка заняла менее 5000мс
    expect(duration).toBeLessThan(5000);
});
`
    },
    {
        id: 898,
        titleEn: "Allure Report: Enterprise Test Analytics & History",
        titleRu: "Allure Report: Профессиональные аналитические отчеты",
        descriptionUk: `## 📈 Allure Report: Професійна звітність

**Теорія**
Allure Report — галузевий стандарт візуалізації результатів тестування:
- Кроки тесту (\`allure.step\`)
- Вкладення скріншотів, відео та трасувань
- Історія стабільності (Flaky, Retries, Trends)
- Зв'язок із Jira дефектами (\`allure.issue\`)

**Приклад**
\`\`\`typescript
import { allure } from 'allure-playwright';

test('платіжний сценарій', async ({ page }) => {
    await allure.step('Відкрити кошик', async () => { /* ... */ });
    await allure.issue('JIRA-9921', 'https://jira.company.com/JIRA-9921');
});
\`\`\`

### Завдання
1. Додайте кроки звітності \`test.step\` або Allure анотації.
2. Прикріпіть контекстні дані для дебагу.`,
        descriptionEn: `## 📈 Allure Report: Enterprise Reporting

**Theory**
Allure Report is the enterprise benchmark for automated test reporting, offering step-by-step hierarchies, video/trace attachments, historical defect trends, and bi-directional Jira integration.

**Example**
\`\`\`typescript
import { allure } from 'allure-playwright';

test('checkout journey', async ({ page }) => {
    await allure.step('Open Cart', async () => { /* ... */ });
    await allure.issue('JIRA-9921', 'https://jira.company.com/JIRA-9921');
});
\`\`\`

### Task
1. Instrument test cases with detailed step reporting.
2. Attach screenshots and trace artifacts upon failure.`,
        descriptionRu: `## 📈 Allure Report: Корпоративная отчетность

**Теория**
Allure предоставляет визуальные отчеты с историей прогонов, шагами тестов, видеозаписями и привязкой к багам в Jira.

**Пример**
\`\`\`typescript
import { allure } from 'allure-playwright';

test('оплата заказа', async ({ page }) => {
    await allure.step('Открыть корзину', async () => { /* ... */ });
});
\`\`\`

### Задание
1. Добавьте шаги отчета через \`test.step\`.
2. Настройте сохранение скриншотов для падений.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.7 Структурований звіт із кроками', async ({ page }) => {
    // TODO: 1. Використайте test.step для категоризації кроків
    await test.step('Відкрити головну сторінку', async () => {
        await page.goto('https://playwright.dev');
    });

    await test.step('Перевірити логотип', async () => {
        await expect(page.locator('.navbar__title')).toBeVisible();
    });
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.7 Structured Step Reporting', async ({ page }) => {
    // TODO: 1. Use test.step for clean report hierarchy
    await test.step('Navigate to Homepage', async () => {
        await page.goto('https://playwright.dev');
    });

    await test.step('Assert Brand Logo', async () => {
        await expect(page.locator('.navbar__title')).toBeVisible();
    });
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.7 Структурированный отчет с шагами', async ({ page }) => {
    // TODO: 1. Используйте test.step для группировки шагов
    await test.step('Открыть главную страницу', async () => {
        await page.goto('https://playwright.dev');
    });

    await test.step('Проверить логотип', async () => {
        await expect(page.locator('.navbar__title')).toBeVisible();
    });
});
`
    },
    {
        id: 899,
        titleEn: "Advanced TypeScript: Generic Fixtures & Typed Architecture",
        titleRu: "Продвинутый TypeScript: Generic Fixtures и строгая типизация",
        descriptionUk: `## 🧬 TypeScript Advanced: Generic Fixtures

**Теорія**
Справжній Senior QA використовує потужність TypeScript generics:
- Створення типізованих сторінкових об'єктів
- Автокомпліт для тестових даних
- Типізовані API клієнти з автоперевіркою сигнатур ендпоінтів

**Приклад**
\`\`\`typescript
type CustomFixtures = {
    userClient: ApiClient<UserData>;
    dashboardPage: DashboardPage;
};
export const test = base.extend<CustomFixtures>({ /* ... */ });
\`\`\`

### Завдання
1. Опишіть інтерфейс фікстур з типобезпечними параметрами.
2. Розширте базовий об'єкт \`test.extend\`.`,
        descriptionEn: `## 🧬 Advanced TypeScript: Generic Fixtures

**Theory**
Architecting enterprise test frameworks requires strong TypeScript typing: typed page fixtures, generic API response handlers, and type-safe environment configurations that catch errors at compile time.

**Example**
\`\`\`typescript
type CustomFixtures = {
    userClient: ApiClient<UserData>;
    dashboardPage: DashboardPage;
};
export const test = base.extend<CustomFixtures>({ /* ... */ });
\`\`\`

### Task
1. Define custom fixture contracts with generic typings.
2. Implement typed dependency injection via \`test.extend\`.`,
        descriptionRu: `## 🧬 Продвинутый TypeScript: Generic Fixtures

**Теория**
Строгая типизация фреймворка через TypeScript generics предотвращает ошибки рантайма, обеспечивает автодополнение для Page Objects и валидирует контракты API.

**Пример**
\`\`\`typescript
type CustomFixtures = {
    userClient: ApiClient<UserData>;
    dashboardPage: DashboardPage;
};
export const test = base.extend<CustomFixtures>({ /* ... */ });
\`\`\`

### Задание
1. Опишите строгий интерфейс фикстур.
2. Расширьте базовый \`test\` с автодополнением типов.`,
        initialCodeUk: `import { test as base, expect } from '@playwright/test';

// TODO: 1. Опишіть типізований інтерфейс для контексту
type MyFixtures = {
    appName: string;
};

const test = base.extend<MyFixtures>({
    appName: async ({}, use) => {
        await use('Playwright Enterprise Suite');
    }
});

test('10.8 Перевірка типізованої фікстури', async ({ appName }) => {
    expect(appName).toBe('Playwright Enterprise Suite');
});
`,
        initialCodeEn: `import { test as base, expect } from '@playwright/test';

// TODO: 1. Define typed fixture contract
type MyFixtures = {
    appName: string;
};

const test = base.extend<MyFixtures>({
    appName: async ({}, use) => {
        await use('Playwright Enterprise Suite');
    }
});

test('10.8 Typed Fixture Assertion', async ({ appName }) => {
    expect(appName).toBe('Playwright Enterprise Suite');
});
`,
        initialCodeRu: `import { test as base, expect } from '@playwright/test';

// TODO: 1. Опишите типизированный интерфейс
type MyFixtures = {
    appName: string;
};

const test = base.extend<MyFixtures>({
    appName: async ({}, use) => {
        await use('Playwright Enterprise Suite');
    }
});

test('10.8 Проверка типизированной фикстуры', async ({ appName }) => {
    expect(appName).toBe('Playwright Enterprise Suite');
});
`
    },
    {
        id: 900,
        titleEn: "Playwright MCP & AI-Assisted Agentic Testing",
        titleRu: "Playwright MCP и тестирование с помощью AI-агентов",
        descriptionUk: `## 🤖 Playwright MCP та AI-асистоване тестування

**Теорія**
Model Context Protocol (MCP) дозволяє інтегрувати Playwright безпосередньо в LLM-агентів. Штучний інтелект може самостійно:
- Досліджувати сайт у пошуках багів
- Генерувати сценарії на основі користувацьких вимог
- Автономно виправляти застарілі селектори (Self-healing tests)

**Приклад**
\`\`\`typescript
// AI Agentic verification logic
const locator = await aiHelper.findResilientLocator('shopping cart checkout button');
await locator.click();
\`\`\`

### Завдання
1. Дослідіть принципи автономного тестування за допомогою AI-інструментів.
2. Напишіть стійкий до змін інтерфейсу сценарій.`,
        descriptionEn: `## 🤖 Playwright MCP & AI-Assisted Agentic Testing

**Theory**
Model Context Protocol (MCP) connects Playwright to autonomous LLM agents, enabling AI-driven exploratory test generation, heuristic visual inspection, and dynamic self-healing locators.

**Example**
\`\`\`typescript
// Agentic test interaction
const locator = await aiHelper.findResilientLocator('shopping cart checkout button');
await locator.click();
\`\`\`

### Task
1. Explore agentic automation and LLM-assisted test workflows.
2. Build self-resilient interactions with accessibility-backed locators.`,
        descriptionRu: `## 🤖 Playwright MCP и AI-агенты в тестировании

**Теория**
Протокол MCP связывает Playwright с языковыми моделями (LLM), позволяя AI-агентам автономно исследовать интерфейс, находить дефекты и восстанавливать сломанные селекторы.

**Пример**
\`\`\`typescript
const locator = await aiHelper.findResilientLocator('shopping cart checkout button');
await locator.click();
\`\`\`

### Задание
1. Изучите подходы интеграции Playwright с искусственным интеллектом.
2. Реализуйте устойчивый к изменениям сценарий.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test('10.9 Семантична доступність для AI-агентів', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Використайте семантичний локатор, зрозумілий для AI (getByRole)
    const docsLink = page.getByRole('link', { name: 'Docs' });
    await expect(docsLink).toBeVisible();
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test('10.9 Semantic Accessibility for AI Agents', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Use semantic locator easily understood by AI agents (getByRole)
    const docsLink = page.getByRole('link', { name: 'Docs' });
    await expect(docsLink).toBeVisible();
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test('10.9 Семантическая доступность для AI-агентов', async ({ page }) => {
    await page.goto('https://playwright.dev');

    // TODO: 1. Используйте семантический локатор (getByRole)
    const docsLink = page.getByRole('link', { name: 'Docs' });
    await expect(docsLink).toBeVisible();
});
`
    },
    {
        id: 901,
        titleEn: "Capstone Project: Production-Ready Full Test Suite",
        titleRu: "Финальный дипломный проект: Production Full Test Suite",
        descriptionUk: `## 🎓 Фінальний проєкт: Production Full Test Suite

**Теорія**
Вітаємо на фінішній прямій! Фінальний дипломний проєкт поєднує всі отримані навички в єдину корпоративну систему:
- Page Object Model & Component Objects
- Авторизація через \`storageState\`
- Тестування API та Mocking
- Підтримка CI/CD, Docker та Allure звітності
- Повна типізація TypeScript

### Завдання
1. Створіть наскрізний тестовий сценарій повного користувацького циклу (E2E).
2. Застосуйте патерни чистого коду та перевірте успішне проходження сьюту.`,
        descriptionEn: `## 🎓 Capstone Project: Production Test Suite

**Theory**
Congratulations on reaching the ultimate milestone! The Capstone Project brings together every engineering pattern mastered across all tracks:
- Page Object Model & Component Objects
- Reusable StorageState Authentication
- Integrated API & Network Mocking
- CI/CD, Docker & Allure Integration
- Strict End-to-End TypeScript Typings

### Task
1. Construct an end-to-end mission-critical user flow.
2. Execute the entire capstone suite and verify 100% green pipeline status.`,
        descriptionRu: `## 🎓 Финальный проект: Production Full Test Suite

**Теория**
Поздравляем с выходом в финал! Дипломный проект объединяет все освоенные знания:
- Page Object Model и компоненты
- Авторизация через \`storageState\`
- Тестирование API и мокирование
- Поддержка CI/CD, Docker и отчетов
- Строгая типизация TypeScript

### Задание
1. Реализуйте полный сквозной сценарий пользователя (End-to-End).
2. Убедитесь в стабильности прогона финального сьюта.`,
        initialCodeUk: `import { test, expect } from '@playwright/test';

test.describe('🎓 Фінальний випускний проєкт', () => {
    test('Повний цикл: Навігація, взаємодія та верифікація', async ({ page }) => {
        // TODO: 1. Відкрийте платформу Playwright
        await page.goto('https://playwright.dev');

        // TODO: 2. Перейдіть до розділу документації
        await page.getByRole('link', { name: 'Get started' }).click();

        // TODO: 3. Підтвердіть успішне завантаження інсталяційного гайду
        await expect(page).toHaveURL(/intro/);
        await expect(page.locator('h1')).toContainText(/Installation/i);
    });
});
`,
        initialCodeEn: `import { test, expect } from '@playwright/test';

test.describe('🎓 Capstone Master Project', () => {
    test('End-to-End: Navigation, Interaction, and Verification', async ({ page }) => {
        // TODO: 1. Navigate to Playwright site
        await page.goto('https://playwright.dev');

        // TODO: 2. Click Get started button
        await page.getByRole('link', { name: 'Get started' }).click();

        // TODO: 3. Verify installation guide is active
        await expect(page).toHaveURL(/intro/);
        await expect(page.locator('h1')).toContainText(/Installation/i);
    });
});
`,
        initialCodeRu: `import { test, expect } from '@playwright/test';

test.describe('🎓 Финальный выпускной проект', () => {
    test('Полный цикл: Навигация, взаимодействие и проверка', async ({ page }) => {
        // TODO: 1. Откройте сайт Playwright
        await page.goto('https://playwright.dev');

        // TODO: 2. Нажмите Get started
        await page.getByRole('link', { name: 'Get started' }).click();

        // TODO: 3. Проверьте открытие страницы установки
        await expect(page).toHaveURL(/intro/);
        await expect(page.locator('h1')).toContainText(/Installation/i);
    });
});
`
    }
];

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Updating all 10 tasks for Track 71 (Level 10 - Professional)...");
        for (const t of finalBossTasks) {
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
        console.log("Track 71 (Level 10 - Final Boss) is 100% complete!");
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
