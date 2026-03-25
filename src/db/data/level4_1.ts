export const level4Tasks_1 = [
    {
        title: "4.1 Parallel Mode: Прискорення пайплайну в 3–10 разів",
        description: `## 🚀 Паралельне виконання тестів — Ваш головний інструмент оптимізації

Перша команда, яку дає тімлід новому QA-інженеру: "Скоротіть час виконання тестів".
Якщо у вас 200 тестів, кожен з яких займає 5 секунд, то:
- **Послідовне виконання**: 200 × 5 = 1000 секунд (16+ хвилин!)
- **Паралельне на 4 ядрах**: ~250 секунд (4 хвилини)
- **Паралельне + Sharding на 5 machine's**: ~50 секунд (менше хвилини!)

Playwright підтримує три рівні паралелізації:

## 🛠 Концепція на практиці

### Рівень 1: Файли (за замовчуванням)
Playwright і так запускає різні \`.spec.ts\` файли **паралельно**. Це відбувається автоматично без будь-якої конфігурації.

### Рівень 2: Тести всередині одного файлу
\`\`\`typescript
// payments.spec.ts

// Ця директива дозволяє тестам ВСЕРЕДИНІ цього файлу бігти паралельно
test.describe.configure({ mode: 'parallel' });

// А тут — навпаки, послідовно (якщо наступний тест залежить від попереднього):
// test.describe.configure({ mode: 'serial' });

test('product A checkout', async ({ page }) => { /* ... */ });
test('product B checkout', async ({ page }) => { /* ... */ }); // Запускається ОДНОЧАСНО!
\`\`\`

### Рівень 3: Глобально у конфігурації
\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  // Запускає ВСІ тести (навіть усередині файлів) паралельно!
  fullyParallel: true,
  
  // Скільки паралельних воркерів використовувати
  workers: process.env.CI ? 4 : undefined, // 4 у CI, "авто" локально
});
\`\`\`

## 💡 Важлива застереження!
Паралельні тести **не повинні залежати один від одного** і не повинні ділити спільний стан (наприклад, один і той самий юзер). Кожен тест — ізольований острів.

---
### 🎯 Ваше завдання
Яке значення поля \`mode\` у \`test.describe.configure()\` дозволить тестам у межах одного describe-блоку запускатися паралельно?
`,
        code: "import { test } from '@playwright/test';\n\ntest.describe.configure({ mode: /* 'parallel' або 'serial'? */ });\n\ntest('test A', async ({ page }) => {});\ntest('test B', async ({ page }) => {});",
        type: "code",
        options: [
            "mode: 'parallel'",
            "mode: 'serial'",
            "mode: 'fully-parallel'",
            "mode: 'concurrent'"
        ],
        correctAnswer: "mode: 'parallel'"
    },
    {
        title: "4.2 Data-Driven Testing: Один тест — Безліч наборів даних",
        description: `## 📊 Параметризовані тести — DRY принцип у тестуванні

Класична антипатерн: у вас є форма реєстрації. Ви пишете тест для валідного email, потім копіюєте його у новий тест для невалідного email, потім ще раз — для порожнього поля... Результат: 5 однакових тестів з різними даними, що порушує принцип DRY (Don't Repeat Yourself).

**Data-Driven Testing (DDT)** — це техніка, при якій тестова **логіка** записана один раз, а **дані** підставляються параматрично.

## 🛠 Концепція на практиці

**Спосіб 1: Цикл for...of**
\`\`\`typescript
import { test, expect } from '@playwright/test';

// Таблиця тест-кейсів: [вхід, очікуваний результат]
const loginCases = [
    { email: 'valid@test.com',   pass: 'Abc123!',  expectedMsg: 'Welcome',          shouldPass: true },
    { email: 'bad-email',        pass: 'Abc123!',  expectedMsg: 'Invalid email',     shouldPass: false },
    { email: 'valid@test.com',   pass: '123',      expectedMsg: 'Password too short',shouldPass: false },
    { email: '',                 pass: '',         expectedMsg: 'Required fields',   shouldPass: false },
];

for (const { email, pass, expectedMsg, shouldPass } of loginCases) {
    // Тест автоматично отримує унікальну назву для кожного набору даних
    test(\`Login: \${email || 'empty'} | \${shouldPass ? '✅' : '❌'}\`, async ({ page }) => {
        await page.goto('/login');
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Password').fill(pass);
        await page.getByRole('button', { name: 'Увійти' }).click();
        
        await expect(page.getByText(expectedMsg)).toBeVisible();
    });
}
// Результат: 4 автоматично згенерованих тести з різними даними!
\`\`\`

## 💡 Best Practices:
Виносьте тест-дані в окремий JSON або .ts файл (\`test-data/login-cases.ts\`), щоб QA-менеджер міг додавати нові кейси, не торкаючись коду тестів!

---
### 🎯 Ваше завдання
Щоб запустити той самий тест з різними наборами даних в циклі, який синтаксис JavaScript найкраще підходить для ітерації по масиву тест-кейсів?
`,
        code: "import { test, expect } from '@playwright/test';\n\nconst cases = ['user1@test.com', 'user2@test.com'];\n\n// Пробіжіться по масиву і створіть тест для кожного елементу\nfor (const email of cases) {\n  test(`login: ${email}`, async ({ page }) => {\n    // ...\n  });\n}",
        type: "code",
        options: [
            "for (const data of cases) { test(...) }",
            "test.each(cases)(...)",
            "cases.forEach(data => { test(...) })",
            "Все вищезгадане"
        ],
        correctAnswer: "Все вищезгадане"
    },
    {
        title: "4.3 Tags & Grep: Вибіркове виконання тестів (@smoke / @regression)",
        description: `## 🏷️ Теги (Annotations) — Запускайте тільки що потрібно

Уявіть: ваша CI/CD платформа має два пайплайни:
1. **Pre-deploy (швидкий)** — запускається при кожному PR, має завершитись за **3 хвилини**. Перевіряє тільки критичні сценарії.
2. **Nightly (повний)** — запускається вночі, може тривати **1 годину**. Перевіряє все.

Як вибрати, які тести запускати в кожному пайплайні? Через **теги**!

## 🛠 Концепція на практиці

**Додавання тегів:**
\`\`\`typescript
import { test, expect } from '@playwright/test';

// Тег вказується безпосередньо в назві тесту або через аннотацію
test('login form @smoke @critical', async ({ page }) => { /* ... */ });

// Або через офіційну анотацію (Playwright v1.42+)
test('checkout full flow', {
    tag: ['@regression', '@payment']
}, async ({ page }) => { /* ... */ });
\`\`\`

**Вибіркове виконання:**
\`\`\`bash
# Запустити тільки smoke тести (швидкий пайплайн)
npx playwright test --grep "@smoke"

# Запустити тести, що НЕ є smoke (e.g. все крім швидких)
npx playwright test --grep-invert "@smoke"

# Запустити тести з двома конкретними тегами
npx playwright test --grep "@smoke|@critical"
\`\`\`

## 💡 Реальний приклад організації тегів:
- \`@smoke\` — 10 критичних тестів (реєстрація, логін, оплата). Тривалість: ~2 хв
- \`@regression\` — Повний набір (200+ тестів). Тривалість: ~20 хв
- \`@skip-ci\` — Тести, що потребують локального середовища або не готові

---
### 🎯 Ваше завдання
Яка команда запускає Playwright-тести, відфільтровані за тегом \`@smoke\` у назві?
`,
        code: "import { test } from '@playwright/test';\n\n// Цей тест позначений тегом @smoke в назві\ntest('login @smoke', async ({ page }) => {});\n\n// Команда для запуску тільки smoke:\n// npx playwright test --grep @smoke",
        type: "quiz",
        options: [
            "npx playwright test --grep @smoke",
            "npx playwright test --tag smoke",
            "npx playwright test --only smoke",
            "npx playwright test @smoke"
        ],
        correctAnswer: "npx playwright test --grep @smoke"
    },
    {
        title: "4.4 GitHub Actions CI: Автозапуск тестів при кожному Push",
        description: `## ☁️ CI/CD для автотестів: Ваші тести повинні стежити за кодом самі

**CI (Continuous Integration)** — практика автоматичного тестування кожного нового коміту одразу після його "заливки" в репозиторій.

Без CI: розробник пушить код, баг приховується до ранкового code review. Можливо, баг вже у прод.
З CI: баг виявляється за **2 хвилини** після пуша, ще до merge в main.

**GitHub Actions** — найпоширеніший CI-інструмент для проектів на GitHub.

## 🛠 Концепція на практиці
Потрібно створити файл \`.github/workflows/playwright.yml\` у корені проекту:

\`\`\`yaml
name: Playwright Tests

# Тригери: запускаємо при пуші або Pull Request в main/dev
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest   # Запуск на Linux в хмарі GitHub
    
    steps:
      # 1. Клонуємо репозиторій
      - uses: actions/checkout@v4
      
      # 2. Встановлюємо Node.js
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      # 3. Встановлюємо залежності (швидко, через кеш)
      - name: Install dependencies
        run: npm ci

      # 4. Встановлюємо браузери Playwright (Chromium, Firefox, WebKit)
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      # 5. Запускаємо тести!
      - name: Run Playwright tests
        run: npx playwright test

      # 6. Завантажуємо HTML-звіт як артефакт (можна скачати і подивитись)
      - uses: actions/upload-artifact@v4
        if: always()    # Навіть якщо тести впали!
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
\`\`\`

---
### 🎯 Ваше завдання
Яке поле у конфігурації GitHub Actions вказує, на якій операційній системі запускати ваш CI-pipeline?
`,
        code: "# .github/workflows/playwright.yml\nname: Playwright Tests\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest    # <-- це поле\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npx playwright test",
        type: "quiz",
        options: [
            "runs-on: ubuntu-latest",
            "os: linux",
            "platform: github",
            "env: node"
        ],
        correctAnswer: "runs-on: ubuntu-latest"
    },
    {
        title: "4.5 Environment Variables: Секрети не у вихідному коді",
        description: `## 🔐 Управління секретами та конфігурацією

Найпоширеніша (і найнебезпечніша) помилка початківця: хардкодити пароли, токени або URL прямо у файл тесту:
\`\`\`typescript
// ❌ НІКОЛИ НЕ РОБІТЬ ТАК
await page.fill('#password', 'SuperSecret123!'); // Пароль у вихідному коді!
const API_KEY = 'sk-abcde12345';                // Токен у git!
\`\`\`

Якщо такий файл потрапить у публічний репозиторій (або навіть у приватний з витоком) — ваші production дані скомпрометовані.

## 🛠 Концепція на практиці

**Локальна розробка** — файл \`.env.local\` (обов'язково в \`.gitignore\`!):
\`\`\`env
# .env.local (НЕ КОМІТЬТЕ ЦЕЙ ФАЙЛ!)
TEST_USER_EMAIL=admin@company.com
TEST_USER_PASSWORD=MySecurePass123
BASE_URL=https://staging.myapp.com
API_KEY=sk-mykey-12345
\`\`\`

**Підключення у Playwright тестах:**
\`\`\`typescript
// playwright.config.ts
export default defineConfig({
    // dotenv завантажує .env.local автоматично
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
    },
});

// У тестах:
test('login with env credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();
});
\`\`\`

**У GitHub Actions CI** — додайте секрети через Settings → Secrets:
\`\`\`yaml
- name: Run tests
  run: npx playwright test
  env:
    TEST_USER_EMAIL: \${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: \${{ secrets.TEST_USER_PASSWORD }}
\`\`\`

---
### 🎯 Ваше завдання
Як у Node.js (і у Playwright) правильно зчитати значення змінної середовища \`PASSWORD\`?
`,
        code: "import { test } from '@playwright/test';\n\ntest('login', async ({ page }) => {\n  const pass = /* як отримати process.env.PASSWORD? */;\n  await page.getByLabel('Password').fill(pass);\n});",
        type: "code",
        options: [
            "process.env.VAR_NAME",
            "env.VAR_NAME",
            "dotenv.get('VAR_NAME')",
            "process.getEnv('VAR_NAME')"
        ],
        correctAnswer: "process.env.VAR_NAME"
    },
    {
        title: "4.6 Custom Fixtures: Власний тестовий контекст (Повторення)",
        description: `## 🛠️ Поглиблене вивчення Custom Fixtures — Архітектура тестового фреймворку

У попередніх уроках ми познайомилися з фікстурами на базовому рівні. Тепер розберемо їх реальне застосування на рівні Lead-інженера.

**Проблема без кастомних фікстур:**
\`\`\`typescript
// ❌ Типовий "поганий" тест
test('checkout', async ({ page }) => {
    // Повторюється у КОЖНОМУ тесті! 20 тестів = 20 копій цього коду
    await page.goto('/login');
    await page.fill('#email', process.env.ADMIN_EMAIL!);
    await page.fill('#pass', process.env.ADMIN_PASS!);
    await page.click('button');
    await page.waitForURL('/dashboard');
    
    // Тепер сам тест...
    await page.goto('/checkout');
});
\`\`\`

## 🛠 Концепція на практиці
**Рішення — кастомна фікстура з вбудованим логіном:**
\`\`\`typescript
// fixtures/index.ts
import { test as base, expect, Page } from '@playwright/test';

type MyFixtures = {
    adminPage: Page;           // Page вже залогіненого адміна
    userPage: Page;            // Page залогіненого звичайного юзера
};

export const test = base.extend<MyFixtures>({
    adminPage: async ({ page }, use) => {
        // Логін адміна через API (супер швидко!)
        const response = await page.request.post('/api/auth/login', {
            data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASS }
        });
        const { token } = await response.json();
        
        // Встановлюємо токен прямо в localStorage
        await page.evaluate((t) => localStorage.setItem('auth_token', t), token);
        
        await use(page); // Передаємо page вже залогіненим
    },

    userPage: async ({ page }, use) => {
        // Аналогічно для звичайного юзера
        await use(page);
    },
});

// tests/orders.spec.ts
import { test, expect } from '../fixtures';

test('admin sees all orders', async ({ adminPage }) => {
    // adminPage - ВЖЕ залогінений адмін!
    await adminPage.goto('/orders');
    await expect(adminPage.getByText('All Orders')).toBeVisible();
});
\`\`\`

---
### 🎯 Ваше завдання
Щоб розширити базовий об'єкт \`test\` власними кастомними фікстурами, який метод використовується?
`,
        code: "import { test as base } from '@playwright/test';\n\n// Додайте власні фікстури до base\nexport const test = base./* ? */({ \n  myData: async ({}, use) => {\n    await use({ name: 'Test User' });\n  }\n});",
        type: "code",
        options: [
            "base.extend({ ... })",
            "base.use({ ... })",
            "base.add({ ... })",
            "base.createFixture({ ... })"
        ],
        correctAnswer: "base.extend({ ... })"
    }
];
