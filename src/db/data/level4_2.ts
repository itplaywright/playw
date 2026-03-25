export const level4Tasks_2 = [
    {
        title: "4.7 Reporters: HTML, Allure, Slack — Звіти як інструмент комунікації",
        description: `## 📊 Репортери — Ваша комунікація з командою

Тести запустились і щось впало. Ви — QA-інженер, і ваша задача не лише "знайти баг", але і **ефективно повідомити** про нього: Developers, PM, Stakeholders.

Без репортерів: "Тест впав. Ось стектрейс. Розбирайтесь."
З репортерами: посилання на красивий HTML-звіт зі скріншотами кроків, відеозаписом виконання і трейсом.

## 🛠 Концепція на практиці

**Налаштування у \`playwright.config.ts\`:**
\`\`\`typescript
export default defineConfig({
    reporter: [
        // 1. HTML-звіт — Вбудований, красивий, з усіма деталями
        ['html', { open: 'never' }], // 'never' = не відкривати автоматично
        
        // 2. List — Простий вивід у консоль під час виконання
        ['list'],
        
        // 3. GitHub Actions — Форматує вивід для GitHub CI
        process.env.CI ? ['github'] : ['dot'],
        
        // 4. Allure Reporter (потребує встановлення)
        // ['allure-playwright'],
        
        // 5. JSON — Для кастомних інтеграцій (Slack, Jira, тощо)
        ['json', { outputFile: 'results.json' }],
    ],
    
    use: {
        // Записуємо відео і трейс при падінні тесту
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
});
\`\`\`

**Перегляд HTML-звіту:**
\`\`\`bash
npx playwright show-report
# Відкриє браузер з інтерактивним звітом
\`\`\`

## 💡 Корисна комбінація:
Для реальних проектів рекомендований стек: \`html\` + \`list\` + умовний github/dot + \`json\` для Slack-інтеграції.

---
### 🎯 Ваше завдання
Яка комбінація репортерів у \`playwright.config.ts\` одночасно генерує HTML-звіт і виводить список тестів у консоль?
`,
        code: "// playwright.config.ts\nimport { defineConfig } from '@playwright/test';\n\nexport default defineConfig({\n  reporter: /* ваша відповідь тут */,\n});",
        type: "quiz",
        options: [
            "reporter: [['html'], ['list']]",
            "reporter: 'html'",
            "reporter: 'list'",
            "Все вищезгадане"
        ],
        correctAnswer: "Все вищезгадане"
    },
    {
        title: "4.8 Retries: Боремося з Flaky тестами",
        description: `## 🧪 Flaky Tests та Retries — Правда про нестабільні тести

**Flaky test** (від англ. "flaky" — нестабільний, примхливий) — це тест, що іноді проходить, а іноді падає, **без змін у коді**. Виник з нічого, впав знову без причини.

Причини flakiness:
- **Мережа**: відповідь бекенду прийшла на 0.1 сек пізніше за timeout
- **Анімації**: елемент ще анімується, коли Playwright намагається клікнути
- **Race conditions**: два процеси змагаються за спільний ресурс
- **Зовнішні API**: Stripe, Firebase, SendGrid іноді "гальмують"

## 🛠 Концепція на практиці

**Глобально у конфігурації:**
\`\`\`typescript
// playwright.config.ts
export default defineConfig({
    // При першому падінні — перезапустити до 2 разів
    // Якщо тест пройшов з 2-ї спроби -> позначається як "flaky" у звіті
    retries: process.env.CI ? 2 : 0, // Retries тільки у CI (не локально!)
});
\`\`\`

**Для конкретного тесту:**
\`\`\`typescript
test('flaky third-party payment', async ({ page }) => {
    // Цей конкретний тест отримає додаткові 3 спроби
    test.slow(); // маркер "повільний" = утроєний timeout
    test.retries(3); // конкретно для цього тесту
    
    await page.goto('/checkout');
    // ... тест зі Stripe API
});
\`\`\`

## ⚠️ Важлива Порада:
**Retries — це тимчасовий пластир, НЕ лікування!**
Якщо тест flaky — розберіться чому. Retries дозволяють нестабільним тестам не блокувати релізний пайплайн, поки ви шукаєте корінь проблеми. Але Retries в \`0\` локально — зберігають час розробника.

---
### 🎯 Ваше завдання
Яке ім'я параметра у \`playwright.config.ts\` встановлює кількість автоматичних перезапусків при падінні тесту?
`,
        code: "// playwright.config.ts\nimport { defineConfig } from '@playwright/test';\n\nexport default defineConfig({\n  /* ім'я опції */: 2, // перезапустити до 2 разів при падінні\n});",
        type: "quiz",
        options: [
            "retries: 2",
            "retry: 2",
            "repeat: 2",
            "attempts: 2"
        ],
        correctAnswer: "retries: 2"
    },
    {
        title: "4.9 Global Setup & Teardown: Підготовка інфраструктури",
        description: `## 🌏 Global Setup — Код, що запускається один раз на весь тестовий run

Уявіть, що перед запуском 200 тестів вам потрібно:
1. Зачистити тестову базу даних
2. Застартувати mock-сервер
3. Увійти в систему і зберегти auth.json
4. Завантажити тестові дані через API

Якщо робити це в \`beforeAll\` кожного тестового файлу — роботи не уникнути. А якщо файлів 20? Global Setup вирішує цю задачу: він виконується **один раз** перед УСІМ тестовим запуском, і **один раз** після нього.

## 🛠 Концепція на практиці
\`\`\`typescript
// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
    console.log('🌏 Запуск глобального налаштування...');
    
    // 1. Логінемось один раз — зберігаємо для всіх тестів
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(config.projects[0].use.baseURL + '/login');
    await page.fill('#email', process.env.ADMIN_EMAIL!);
    await page.fill('#pass', process.env.ADMIN_PASS!);
    await page.click('[type=submit]');
    
    // Зберігаємо cookies/localStorage для використання в тестах
    await page.context().storageState({ path: '.auth/admin.json' });
    await browser.close();
    
    console.log('✅ Global Setup завершено!');
}
\`\`\`

\`\`\`typescript
// global-teardown.ts
export default async function globalTeardown() {
    // Очищення: видалення тестових даних, зупинка сервісів тощо
    console.log('🧹 Очищення після тестів...');
}
\`\`\`

\`\`\`typescript
// playwright.config.ts
export default defineConfig({
    globalSetup: require.resolve('./global-setup'),
    globalTeardown: require.resolve('./global-teardown'),
});
\`\`\`

---
### 🎯 Ваше завдання
Яка правильна сигнатура функції Global Setup у Playwright (TypeScript)?
`,
        code: "// global-setup.ts\nimport { FullConfig } from '@playwright/test';\n\n// Яка правильна сигнатура?\nexport default async function globalSetup(config: FullConfig) {\n  // Setup code...\n}",
        type: "code",
        options: [
            "export default async function globalSetup(config) { ... }",
            "export const setup = async () => { ... }",
            "module.exports = async () => { ... }",
            "export default globalSetup(config) { ... }"
        ],
        correctAnswer: "export default async function globalSetup(config) { ... }"
    },
    {
        title: "4.10 Projects: Крос-браузерне тестування",
        description: `## 🌐 Projects — Один тест, Три браузери

Ваш сайт виглядає ідеально в Chrome. А у Safari? А в Firefox? А на мобільному?
Кожен браузер має свій рушій (не тільки різні назви!):
- **Chromium** — рушій Chrome, Edge, Brave (>65% ринку)
- **Firefox (Gecko)** — власний рушій Mozilla
- **WebKit** — рушій Safari на Mac і iOS (критично для Apple-юзерів)

**Playwright** унікальний тим, що нативно підтримує всі три рушії без додаткових бібліотек!

## 🛠 Концепція на практиці

\`\`\`typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    projects: [
        // Desktop браузери
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        
        // Mobile емуляція
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13'] },
        },
    ],
});
\`\`\`

**Запуск на конкретному браузері:**
\`\`\`bash
npx playwright test --project=webkit        # Тільки Safari
npx playwright test --project=chromium     # Тільки Chrome
npx playwright test                        # Всі браузери!
\`\`\`

## 💡 Рада щодо оптимізації:
Не всі тести потрібно запускати у всіх браузерах. \`@smoke\` тести — у всіх трьох. Детальні регресійні — тільки у Chromium. Це зберігає час CI.

---
### 🎯 Ваше завдання
Яка правильна конфігурація для налаштування проекту тестування в браузері WebKit (Safari)?
`,
        code: "// playwright.config.ts\nimport { defineConfig, devices } from '@playwright/test';\n\nexport default defineConfig({\n  projects: [\n    {\n      name: 'webkit',\n      use: { ...devices['Desktop Safari'] },\n    },\n  ]\n});",
        type: "quiz",
        options: [
            "{ name: 'webkit', use: { ...devices['Desktop Safari'] } }",
            "{ browser: 'safari' }",
            "{ name: 'safari' }",
            "{ use: { browserName: 'webkit' } }"
        ],
        correctAnswer: "{ name: 'webkit', use: { ...devices['Desktop Safari'] } }"
    },
    {
        title: "4.11 Serial Mode: Коли тести залежать один від одного",
        description: `## ⛓️ Serial Mode — Послідовні тести з реальними залежностями

Усі правила тестування кричать: "Тести мають бути незалежними!". І це правда — в ідеалі.
Але в реальному світі зустрічаються ситуації, де незалежність просто неможлива:

1. **E2E flow онлайн-магазину**: Реєстрація → Підтвердження email → Перший логін → Додавання в кошик → Оплата. Якщо реєстрація (крок 1) впала, запускати "Оплату" (крок 5) безглуздо — вона впаде з тієї ж причини і лише забере час.

2. **Навчальний сценарій**: Студент проходить курс за кроками. "Урок 5" залежить від проходження "Уроку 4".

Для таких сценаріїв існує **Serial Mode**.

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

// Усі тести в цьому describe ВИКОНУВАТИМУТЬСЯ ПОСЛІДОВНО
// Якщо перший впав — всі наступні автоматично отримають статус SKIPPED
test.describe.configure({ mode: 'serial' });

let userId: string;

test.describe('E2E: Реєстрація та покупка', () => {
    test('Крок 1: Реєстрація нового юзера', async ({ request }) => {
        const response = await request.post('/api/users', {
            data: { email: 'e2e@test.com', name: 'E2E User' }
        });
        expect(response.status()).toBe(201);
        const user = await response.json();
        userId = user.id; // Зберігаємо ID для наступних тестів
    });

    test('Крок 2: Логін', async ({ page }) => {
        // Цей тест не запуститься, якщо Крок 1 впав!
        await page.goto('/login');
        // ... логін
    });

    test('Крок 3: Оплата', async ({ page }) => {
        // Цей тест не запуститься, якщо Кроки 1 або 2 впали!
        await page.goto(\`/profile/\${userId}\`);
        // ...
    });
});
\`\`\`

---
### 🎯 Ваше завдання
Яке значення \`mode\` у \`test.describe.configure()\` змушує тести виконуватись **послідовно**, і при падінні першого — пропускає всі наступні?
`,
        code: "import { test } from '@playwright/test';\n\ntest.describe.configure({ mode: /* ? */ });\n\ntest('step 1: register', async () => {});\ntest('step 2: login', async () => {}); // Запустится тільки якщо step 1 пройшов",
        type: "code",
        options: [
            "mode: 'serial'",
            "mode: 'parallel'",
            "mode: 'sequence'",
            "mode: 'ordered'"
        ],
        correctAnswer: "mode: 'serial'"
    },
    {
        title: "4.12 Sharding: Розбиття тестів на CI-машини",
        description: `## 🧩 Sharding (Шардінг) — Масштабування на множину машин

**Сценарій**: Your flagship product has 2000 tests. На 1 машині вони виконуються 40 хвилин. Це неприйнятно для CI/CD, де релізний цикл має займати не більше 10 хвилин.

**Sharding** — техніка розбиття тестового набору на **N рівних шматків (шардів)**, кожен з яких виконується **паралельно на окремій машині** (або Docker-контейнері).

При N=4 шардах: 40 хвилин → **10 хвилин!**
При N=8 шардах: 40 хвилин → **5 хвилин!**

## 🛠 Концепція на практиці

**Запуск шардів (у GitHub Actions):**
\`\`\`yaml
# .github/workflows/playwright.yml
jobs:
  test:
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4]     # 4 паралельних runner'а
        shardTotal: [4]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
      # Кожна machine отримає: 1/4, 2/4, 3/4, 4/4 — різні тести!
\`\`\`

**Локально (для перевірки):**
\`\`\`bash
# Запустити першу чверть тестів
npx playwright test --shard=1/4

# Запустити другу чверть
npx playwright test --shard=2/4
\`\`\`

## 💡 Як зібрати результати?
Кожен шард генерує свій \`blob-report\`. Після завершення всіх шардів — об'єднайте їх командою:
\`\`\`bash
npx playwright merge-reports --reporter=html ./blob-reports/
\`\`\`

---
### 🎯 Ваше завдання
Яка CLI-опція Playwright дозволяє запустити перший шард із трьох?
`,
        code: "# Запуск тестів з шардуванням\n# Запустити перший шард із трьох:\nnpx playwright test /* ваша відповідь */\n\n# Усього буде 3 машини:\n# Machine 1: --shard=1/3\n# Machine 2: --shard=2/3\n# Machine 3: --shard=3/3",
        type: "quiz",
        options: [
            "--shard=1/3",
            "--split=1/3",
            "--parts=3",
            "--chunk=1"
        ],
        correctAnswer: "--shard=1/3"
    }
];
