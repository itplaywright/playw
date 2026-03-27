export const level8Tasks = [
    {
        title: "8.1 Page Object Model (POM): Основи архітектури",
        description: `## 🏗️ Page Object Model

POM — це архітектурний паттерн, де кожна сторінка сайту описується окремим класом. Клас інкапсулює всі взаємодії з цією сторінкою.

**Без POM (погано):**
\`\`\`typescript
// В кожному тесті дублюємо локатори
await page.fill('[data-testid="email"]', 'test@test.com');
await page.fill('[data-testid="password"]', 'password');
await page.click('[data-testid="submit"]');
\`\`\`

**З POM (добре):**
\`\`\`typescript
// pages/LoginPage.ts
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }
}

// У тестах:
const loginPage = new LoginPage(page);
await loginPage.login('test@test.com', 'password');
\`\`\`

Якщо локатор змінюється — змінюєте лише клас, а не 20 тестів!

---
### 🎯 Ваше завдання
Напишіть простий POM-клас \`PlaywrightSitePage\` з методом \`getTitle()\`, який повертає заголовок сторінки. Використайте клас у тесті.
`,
        code: `import { test, expect, Page } from '@playwright/test';

// TODO: Оголосіть клас PlaywrightSitePage
class PlaywrightSitePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://playwright.dev/');
  }

  // TODO: Додайте метод getTitle(), який повертає this.page.title()
  async getTitle(): Promise<string> {
    return /* ??? */;
  }
}

test('POM: get title', async ({ page }) => {
  const site = new PlaywrightSitePage(page);
  await site.goto();
  
  const title = await site./* ??? */();
  expect(title).toContain('Playwright');
});`,
        type: "code"
    },
    {
        title: "8.2 Component Objects: Вкладені POM",
        description: `## 🧩 Component Objects (POM для компонентів)

Великі сторінки складаються з компонентів (навбар, форма, таблиця). Ви можете виокремити кожен компонент в свій клас.

\`\`\`typescript
// components/Navbar.ts
class Navbar {
  private nav: Locator;
  
  constructor(private page: Page) {
    this.nav = page.locator('nav');
  }
  
  async getLinks(): Promise<string[]> {
    const links = await this.nav.locator('a').allTextContents();
    return links;
  }
  
  async clickLink(name: string) {
    await this.nav.getByText(name).click();
  }
}

// pages/HomePage.ts
class HomePage {
  navbar: Navbar;
  
  constructor(private page: Page) {
    this.navbar = new Navbar(page); // Вбудований компонент
  }
}
\`\`\`

---
### 🎯 Ваше завдання
Напишіть POM-клас \`DocsPage\` з вкладеним методом \`getNavLinks()\`, який повертає масив текстів посилань у \`nav\` елементі. Перевірте, що їх більше 0.
`,
        code: `import { test, expect, Page } from '@playwright/test';

class DocsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://playwright.dev/docs/intro');
  }

  // TODO: Реалізуйте метод, який повертає all text contents посилань у nav
  async getNavLinks(): Promise<string[]> {
    const links = await this.page.locator('nav a')./* ??? */();
    return links;
  }
}

test('Component POM: nav links', async ({ page }) => {
  const docsPage = new DocsPage(page);
  await docsPage.goto();

  const links = await docsPage.getNavLinks();
  
  console.log('Знайдено посилань:', links.length);
  expect(links.length)./* ??? */(0);
});`,
        type: "code"
    },
    {
        title: "8.3 Builder Pattern для тестових даних",
        description: `## 🏗️ Test Data Builder Pattern

Замість хардкодування тестових даних, використовуйте Builder Pattern для генерації гнучких, читабельних тестових об'єктів.

\`\`\`typescript
class UserBuilder {
  private user = {
    email: 'default@test.com',
    password: 'DefaultPass123!',
    name: 'Test User',
    role: 'user',
  };

  withEmail(email: string) {
    this.user.email = email;
    return this; // Повертаємо this для chaining
  }

  withRole(role: string) {
    this.user.role = role;
    return this;
  }

  build() {
    return { ...this.user }; // Повертаємо копію
  }
}

// Використання:
const adminUser = new UserBuilder()
  .withEmail('admin@company.com')
  .withRole('admin')
  .build();
\`\`\`

---
### 🎯 Ваше завдання
Яка головна перевага Builder Pattern для тестових даних порівняно з хардкодованими об'єктами в кожному тесті?
`,
        code: "",
        type: "quiz",
        options: [
            "Builder Pattern робить тести повільнішими, але більш надійними",
            "Builder Pattern дозволяє гнучко створювати тестові об'єкти з мінімальним дублюванням коду",
            "Builder Pattern є частиною Playwright API і вбудований у фреймворк",
            "Builder Pattern використовується виключно для API тестування"
        ],
        correctAnswer: "Builder Pattern дозволяє гнучко створювати тестові об'єкти з мінімальним дублюванням коду"
    },
    {
        title: "8.4 Playwright Fixtures: Dependency Injection",
        description: `## 🧪 Fixtures у Playwright

Playwright Fixtures — це потужна система Dependency Injection. Фікстури — це тестові залежності, які автоматично налаштовуються і очищаються.

\`\`\`typescript
// test-fixtures.ts
import { test as base, Page } from '@playwright/test';

type Fixtures = {
  darkModePage: Page; // Сторінка з темною темою
};

export const test = base.extend<Fixtures>({
  darkModePage: async ({ page }, use) => {
    // Setup: встановлюємо темну тему через localStorage
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    await use(page); // Передаємо сторінку тесту
    // Teardown: відбувається автоматично (context закривається)
  },
});

// У тесті:
test('dark mode works', async ({ darkModePage }) => {
  await darkModePage.goto('https://example.com');
  // darkModePage вже має dark theme в localStorage!
});
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, що використовує \`addInitScript\` для встановлення \`localStorage.setItem('lang', 'uk')\` ДО завантаження сторінки. Потім перевірте, що значення правильне.
`,
        code: `import { test, expect } from '@playwright/test';

test('addInitScript sets localStorage', async ({ page }) => {
  // TODO: Використайте page.addInitScript, щоб встановити localStorage 'lang' = 'uk'
  // ДО goto, щоб скрипт виконався при завантаженні сторінки
  await page./* ??? */(async () => {
    localStorage.setItem(/* ??? */, /* ??? */);
  });

  await page.goto('https://playwright.dev/');

  // TODO: Прочитайте значення 'lang' з localStorage
  const lang = await page.evaluate(() => localStorage.getItem('lang'));
  
  expect(lang).toBe(/* ??? */);
});`,
        type: "code"
    },
    {
        title: "8.5 Parallel Tests: Налаштування паралелізму",
        description: `## ⚡ Паралельне виконання тестів

\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  // Запустити всі файли паралельно
  fullyParallel: true,
  // Кількість паралельних браузерів
  workers: process.env.CI ? 2 : 4,
});

// У конкретному тест-файлі:
test.describe.configure({ mode: 'parallel' }); // Паралельно всередині файлу
test.describe.configure({ mode: 'serial' }); // Послідовно (наступний чекає попередній)

// Окремий тест завжди останній:
test.describe('Critical flow', () => {
  test.describe.configure({ mode: 'serial' });
  
  test('Step 1: register', async ...);
  test('Step 2: verify email', async ...); // Чекає Step 1
  test('Step 3: login', async ...); // Чекає Step 2
});
\`\`\`

---
### 🎯 Ваше завдання
Що відбувається, якщо один тест зі \`serial\` групи падає? Що відбувається з наступними тестами у цій групі?
`,
        code: "",
        type: "quiz",
        options: [
            "Наступні тести продовжуються незалежно — вони ізольовані",
            "Playwright автоматично перезапускає тест, що упав",
            "Усі наступні тести у serial групі позначаються як skipped — не виконуються",
            "Playwright пропускає тільки тести у тому ж describe блоці"
        ],
        correctAnswer: "Усі наступні тести у serial групі позначаються як skipped — не виконуються"
    },
    {
        title: "8.6 Retry та Flaky Tests",
        description: `## 🔄 Flaky Tests та стратегії боротьби з ними

**Flaky test** — тест, що іноді проходить, іноді падає без зміни коду. Це проблема №1 у будь-якій команді.

**Playwright вирішення:**

1. **Retry** — перезапустити тест при падінні:
\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // 2 retry на CI, 0 локально
});
\`\`\`

2. **Причини flakiness та виправлення:**
   - **Мережа нестабільна** → \`waitForLoadState('networkidle')\`
   - **Анімація** → \`page.waitForTimeout()\` (погано!) або \`await expect().toBeVisible()\` (добре!)
   - **Стан між тестами** → ізолюйте через новий контекст/сторінку
   - **Часові залежності** → replace hardcoded waits з assertion-based waits

3. **Виявлення flaky tests:**
\`\`\`bash
npx playwright test --repeat-each=10 # Запустити кожен тест 10 разів
\`\`\`

---
### 🎯 Ваше завдання
Який підхід є ПРАВИЛЬНИМ для очікування появи елемента і є найбільш стабільним у Playwright?
`,
        code: "",
        type: "quiz",
        options: [
            "await page.waitForTimeout(3000) — чекаємо 3 секунди",
            "while(!visible) { check() } — цикл перевірки",
            "await expect(locator).toBeVisible() — retrying assertion з таймаутом",
            "page.pause() — ручна пауза тесту"
        ],
        correctAnswer: "await expect(locator).toBeVisible() — retrying assertion з таймаутом"
    },
    {
        title: "8.7 Tags та Groups: Організація тестів",
        description: `## 🏷️ Теги та фільтрація тестів

Playwright підтримує теги для організації та вибіркового запуску тестів:

\`\`\`typescript
test('login flow @smoke @auth', async ({ page }) => {
  // @smoke — базові перевірки
  // @auth — тести авторизації
});

test('checkout @e2e @payment @slow', async ({ page }) => {
  // Повільний end-to-end тест
});

// Запуск тільки smoke тестів:
// npx playwright test --grep @smoke

// Виключити повільні тести:
// npx playwright test --grep-invert @slow

// Запустити auth та payment тести:
// npx playwright test --grep "@auth|@payment"
\`\`\`

**Стандартні теги в командах:**
- \`@smoke\` — швидкі перевірки "чи живий сайт"
- \`@regression\` — повна регресія
- \`@wip\` — work in progress, пропустити на CI

---
### 🎯 Ваше завдання
Напишіть тест з тегами \`@smoke @level8\`, який відкриває playwright.dev і перевіряє, що заголовок містить "Playwright".
`,
        code: `import { test, expect } from '@playwright/test';

// TODO: Додайте теги @smoke та @level8 до назви тесту
test('playwright site loads /* ??? ТЕГИ */', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // TODO: Перевірте що title() містить 'Playwright'
  await expect(page).toHaveTitle(/* ??? */);
});`,
        type: "code"
    },
    {
        title: "8.8 Global Setup та Teardown",
        description: `## 🌍 Global Setup і Teardown

Global Setup виконується **один раз перед усіма тестами** (не перед кожним). Ідеально для:
- Ініціалізації тестової бази даних
- Збереження auth state
- Перевірки сервер доступності

\`\`\`typescript
// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Логінуємось один раз
  await page.goto('/login');
  await page.fill('#email', 'admin@test.com');
  await page.fill('#password', 'secret');
  await page.click('[type="submit"]');
  
  // Зберігаємо стан для всіх тестів
  await page.context().storageState({ path: 'auth.json' });
  await browser.close();
}

export default globalSetup;

// playwright.config.ts:
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  use: { storageState: 'auth.json' },
});
\`\`\`

---
### 🎯 Ваше завдання
Яка головна відмінність між Global Setup та beforeAll hook у Playwright?
`,
        code: "",
        type: "quiz",
        options: [
            "Вони ідентичні — просто різні назви одного механізму",
            "Global Setup виконується один раз для ВСІХ тестів у проекті, beforeAll — для тестів всередині одного describe блоку",
            "Global Setup — для API тестів, beforeAll — для UI тестів",
            "beforeAll виконується швидше через кешування результатів"
        ],
        correctAnswer: "Global Setup виконується один раз для ВСІХ тестів у проекті, beforeAll — для тестів всередині одного describe блоку"
    },
    {
        title: "8.9 Custom Reporters: Власні звіти",
        description: `## 📊 Reporters у Playwright

Playwright має вбудовані reporters і підтримує кастомні:

\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html'],                    // Красивий HTML звіт
    ['json', { outputFile: 'results.json' }], // Для CI/CD аналізу
    ['junit', { outputFile: 'junit.xml' }],   // Для Jenkins/Azure
    ['list'],                    // Простий список у терміналі
    ['./my-custom-reporter.ts'], // Ваш кастомний reporter
  ],
});
\`\`\`

**Кастомний Reporter:**
\`\`\`typescript
// my-custom-reporter.ts
class MyReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      // Відправити нотифікацію в Slack!
      console.log(\`❌ FAILED: \${test.title}\`);
    }
  }
}
export default MyReporter;
\`\`\`

---
### 🎯 Ваше завдання
Яка команда генерує та відкриває красивий HTML звіт після запуску тестів у Playwright?
`,
        code: "",
        type: "quiz",
        options: [
            "npx playwright test --output=html",
            "npx playwright report --html",
            "npx playwright show-report",
            "npx playwright generate-report"
        ],
        correctAnswer: "npx playwright show-report"
    },
    {
        title: "8.10 Test Isolation: Принципи ізоляції",
        description: `## 🛡️ Ізоляція тестів

Хороший тест повинен бути **FIRST**:
- **F**ast — швидкий
- **I**solated/Independent — незалежний від інших
- **R**epeatable — повторюваний
- **S**elf-validating — самоперевірний
- **T**imely — вчасний

**Playwright гарантує ізоляцію через:**
\`\`\`typescript
// Кожен тест отримує свіжий browser context
test('test 1', async ({ page }) => { /* ізольований context */ });
test('test 2', async ({ page }) => { /* інший ізольований context */ });

// Якщо треба спільний context (але ОБЕРЕЖНО!):
test.describe('shared state', () => {
  let sharedPage: Page;
  
  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
  });
  
  test.afterAll(async () => {
    await sharedPage.close();
  });
});
\`\`\`

---
### 🎯 Ваше завдання
Чому важливо, щоб кожен тест починав з "чистого стану" (ізольованого browser context)?
`,
        code: "",
        type: "quiz",
        options: [
            "Щоб браузер не витрачав надмірно пам'ять у процесі виконання",
            "Щоб тести не залежали один від одного і падіння одного не впливало на результати інших",
            "Playwright не підтримує спільний стан між тестами — це технічне обмеження",
            "Для прискорення запуску тестів через кешування сторінок"
        ],
        correctAnswer: "Щоб тести не залежали один від одного і падіння одного не впливало на результати інших"
    },
];
