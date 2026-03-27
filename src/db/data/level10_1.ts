export const level10Tasks = [
    {
        title: "10.1 CI/CD Pipeline: GitHub Actions для Playwright",
        description: `## 🚀 GitHub Actions — Автоматичний CI/CD

GitHub Actions запускає ваші Playwright тести при кожному push або pull request:

\`\`\`yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          BASE_URL: \${{ secrets.BASE_URL }}
          AUTH_TOKEN: \${{ secrets.AUTH_TOKEN }}
      
      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: always() # Навіть якщо тести впали!
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
\`\`\`

---
### 🎯 Ваше завдання
Чому важливо додати \`if: always()\` до кроку завантаження звіту тестів у GitHub Actions?
`,
        code: "",
        type: "quiz",
        options: [
            "Щоб звіт завантажувався тільки якщо всі тести пройшли успішно",
            "Щоб звіт завантажувався навіть якщо попередній крок (тести) завершився з помилкою — інакше артефакт не збережеться при невдалих тестах",
            "if: always() прискорює виконання pipeline",
            "Без if: always() звіт завантажується двічі"
        ],
        correctAnswer: "Щоб звіт завантажувався навіть якщо попередній крок (тести) завершився з помилкою — інакше артефакт не збережеться при невдалих тестах"
    },
    {
        title: "10.2 Docker: Playwright у контейнері",
        description: `## 🐳 Playwright + Docker

Docker гарантує, що тести виконуються однаково на всіх машинах:

\`\`\`dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Копіюємо файли проекту
COPY package*.json ./
RUN npm ci

COPY . .

# Запускаємо тести
CMD ["npx", "playwright", "test"]
\`\`\`

\`\`\`bash
# Запустити тести у Docker:
docker build -t playwright-tests .
docker run playwright-tests

# З монтуванням результатів:
docker run -v $(pwd)/playwright-report:/app/playwright-report playwright-tests
\`\`\`

**Офіційний образ від Microsoft** вже містить встановлені браузери та всі залежності — не треба ставити браузери вручну!

---
### 🎯 Ваше завдання
Яка головна перевага використання офіційного образу \`mcr.microsoft.com/playwright\` у Dockerfile?
`,
        code: "",
        type: "quiz",
        options: [
            "Він дозволяє запускати тести без Node.js",
            "Він автоматично деплоїть тести у хмару",
            "Він вже містить всі необхідні браузери та системні залежності — не потрібно їх встановлювати окремо",
            "Він менший за звичайний Node.js образ за розміром"
        ],
        correctAnswer: "Він вже містить всі необхідні браузери та системні залежності — не потрібно їх встановлювати окремо"
    },
    {
        title: "10.3 Environment Variables: Безпечна конфігурація",
        description: `## 🔐 Environment Variables у Playwright

Хардкодувати URL, паролі та API ключі у тестах — смертний гріх у QA!

\`\`\`typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  
  // Глобальні змінні доступні в тестах
  // через process.env
});
\`\`\`

\`\`\`typescript
// У тестах:
test('uses env vars', async ({ page }) => {
  // BASE_URL підхоплюється автоматично через baseURL
  await page.goto('/dashboard'); // Відносний шлях!
  
  // Прямий доступ до env vars:
  const token = process.env.API_TOKEN!;
  const adminEmail = process.env.ADMIN_EMAIL!;
  
  await page.request.post('/api/login', {
    data: { email: adminEmail, token },
  });
});
\`\`\`

\`\`\`bash
# .env.test (НЕ комітьте у git!)
BASE_URL=https://staging.example.com
ADMIN_EMAIL=admin@company.com
API_TOKEN=secret_token_123
\`\`\`

---
### 🎯 Ваше завдання
Чому НЕ потрібно комітити файл \`.env\` з секретами до git репозиторію?
`,
        code: "",
        type: "quiz",
        options: [
            "Тому що .env файли не підтримуються у Windows",
            "Тому що secrets у git — це вразливість безпеки: API ключі та паролі стають доступні всім хто має доступ до репозиторію або його history",
            "Тому що Playwright не може читати .env файли з репозиторію",
            "Тому що .env файли сповільнюють роботу git"
        ],
        correctAnswer: "Тому що secrets у git — це вразливість безпеки: API ключі та паролі стають доступні всім хто має доступ до репозиторію або його history"
    },
    {
        title: "10.4 Sharding: Розподілений запуск тестів",
        description: `## ⚡ Test Sharding

Sharding — розділення набору тестів між кількома машинами для паралельного запуску:

\`\`\`bash
# Розділити тести на 3 частини:
npx playwright test --shard=1/3  # Перша третина
npx playwright test --shard=2/3  # Друга третина  
npx playwright test --shard=3/3  # Третя третина
\`\`\`

**GitHub Actions з sharding:**
\`\`\`yaml
jobs:
  test:
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    
    steps:
      - name: Run sharded tests
        run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
        
      - name: Upload blob report
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-\${{ matrix.shardIndex }}
          path: blob-report/

  merge-reports:
    needs: test
    steps:
      - name: Merge reports
        run: npx playwright merge-reports ./all-blob-reports --reporter html
\`\`\`

Таким чином 100 тестів виконуються у 4× рази швидше на 4 машинах!

---
### 🎯 Ваше завдання
Якщо у вас 80 тестів і ви запускаєте з \`--shard=2/4\`, скільки тестів приблизно виконається на цьому воркері?
`,
        code: "",
        type: "quiz",
        options: [
            "80 — всі тести на кожному shard",
            "40 — тести діляться порівну між 4 shards (80/4 = 20) — але на shard 2 йде друга чверть",
            "Приблизно 20 — Playwright рівномірно ділить тести між shards",
            "2 — тільки тести з індексом 2"
        ],
        correctAnswer: "Приблизно 20 — Playwright рівномірно ділить тести між shards"
    },
    {
        title: "10.5 Playwright Component Testing",
        description: `## 🧩 Component Testing з Playwright

Playwright може тестувати React/Vue/Angular компоненти ізольовано — без повного запуску додатку:

\`\`\`typescript
// Button.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('button renders and clicks', async ({ mount }) => {
  let clicked = false;
  
  const component = await mount(
    <Button 
      label="Click me" 
      onClick={() => { clicked = true; }}
    />
  );
  
  // Перевіряємо рендер
  await expect(component).toContainText('Click me');
  await expect(component).toBeVisible();
  
  // Клікаємо
  await component.click();
  
  // Перевіряємо поведінку
  expect(clicked).toBe(true);
  
  // Перевіряємо CSS клас
  await expect(component).toHaveClass(/btn-primary/);
});
\`\`\`

**Конфігурація:**
\`\`\`typescript
// playwright-ct.config.ts
export default defineConfig({
  testDir: './src',
  use: { ctPort: 3100 },
});
\`\`\`

---
### 🎯 Ваше завдання
Яка ключова відмінність між Component Testing та звичайним E2E тестуванням у Playwright?
`,
        code: "",
        type: "quiz",
        options: [
            "Component Testing — значно повільніше за E2E через необхідність запуску браузера",
            "Component Testing тестує ізольований компонент без повного додатку, E2E тестує реальний userflow через весь стек",
            "Component Testing доступне тільки для Vue.js додатків",
            "Component Testing не підтримує перевірку CSS стилів"
        ],
        correctAnswer: "Component Testing тестує ізольований компонент без повного додатку, E2E тестує реальний userflow через весь стек"
    },
    {
        title: "10.6 Load Testing основи: k6 + Playwright",
        description: `## 📈 Load Testing концепції

Playwright — це **функціональне** тестування. Для навантажувального тестування є інші інструменти, але їх комбінують:

**k6 (навантажувальне тестування):**
\`\`\`javascript
// k6-script.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Розігрів: 0→10 юзерів
    { duration: '1m', target: 100 },  // Навантаження: 100 юзерів
    { duration: '30s', target: 0 },   // Охолодження
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% запитів < 500мс
    http_req_failed: ['rate<0.1'],    // < 10% помилок
  },
};

export default function() {
  const res = http.get('https://example.com/api/products');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
\`\`\`

**Стратегія тестування без k6:**
- Playwright для функціональних перевірок
- Artillery/k6 для навантаження
- Lighthouse для Core Web Vitals

---
### 🎯 Ваше завдання
Яке твердження найкраще описує різницю між E2E тестуванням (Playwright) та навантажувальним тестуванням (k6)?
`,
        code: "",
        type: "quiz",
        options: [
            "Playwright і k6 вирішують одну й ту саму задачу — тільки різними мовами",
            "Playwright перевіряє коректність поведінки продукту для одного юзера, k6 перевіряє стабільність системи під великою кількістю одночасних запитів",
            "k6 більш ефективний для UI тестування — Playwright застарів",
            "Навантажувальне тестування можна замінити запуском Playwright з максимальною кількістю workers"
        ],
        correctAnswer: "Playwright перевіряє коректність поведінки продукту для одного юзера, k6 перевіряє стабільність системи під великою кількістю одночасних запитів"
    },
    {
        title: "10.7 Allure Report: Професійна звітність",
        description: `## 📊 Allure Report інтеграція

Allure — потужний фреймворк для красивих, інформативних звітів:

\`\`\`bash
npm install -D allure-playwright allure-commandline
\`\`\`

\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  reporter: [['allure-playwright']],
});
\`\`\`

\`\`\`typescript
// Annotations у тестах:
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test('user can login', async ({ page }) => {
  allure.description('Перевірка успішного входу з валідними даними');
  allure.severity('critical');
  allure.owner('QA Team');
  allure.tag('auth', 'smoke');
  
  await allure.step('Відкриваємо сторінку входу', async () => {
    await page.goto('/login');
  });
  
  await allure.step('Вводимо дані', async () => {
    await page.fill('#email', 'user@test.com');
    await page.fill('#password', 'secret');
    await page.click('[type="submit"]');
  });
  
  await allure.step('Перевіряємо редірект на дашборд', async () => {
    await expect(page).toHaveURL('/dashboard');
  });
});
\`\`\`

---
### 🎯 Ваше завдання
Яка перевага Allure Steps (\`allure.step\`) порівняно зі звичайними коментарями в коді?
`,
        code: "",
        type: "quiz",
        options: [
            "allure.step виконується швидше ніж звичайний код",
            "allure.step відображається у Allure звіті як окремий крок з часом виконання та можливістю прикріпити скріншот",
            "allure.step автоматично retry при помилці",
            "allure.step замінює beforeEach та afterEach хуки"
        ],
        correctAnswer: "allure.step відображається у Allure звіті як окремий крок з часом виконання та можливістю прикріпити скріншот"
    },
    {
        title: "10.8 TypeScript Advanced: Generic Fixtures",
        description: `## 🦺 Advanced TypeScript у Playwright

Типізовані фікстури та утиліти роблять тести надійнішими:

\`\`\`typescript
// types/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// Типізуємо всі фікстури
type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedUser: { email: string; token: string };
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  
  authenticatedUser: async ({ request }, use) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'test@qa.com', password: 'secret' },
    });
    const { token } = await res.json();
    await use({ email: 'test@qa.com', token });
  },
});

// Тепер тести повністю типізовані:
test('dashboard test', async ({ dashboardPage, authenticatedUser }) => {
  // TypeScript знає типи dashboardPage та authenticatedUser!
  console.log(authenticatedUser.email); // Автодоповнення!
});
\`\`\`

---
### 🎯 Ваше завдання
Яка ключова перевага TypeScript типізації у Playwright тестах?
`,
        code: "",
        type: "quiz",
        options: [
            "TypeScript робить тести на 50% швидшими через компіляцію",
            "TypeScript — обов'язкова вимога для запуску Playwright",
            "TypeScript забезпечує автодоповнення, раннє виявлення помилок та кращу документацію коду",
            "TypeScript дозволяє запускати тести без браузера"
        ],
        correctAnswer: "TypeScript забезпечує автодоповнення, раннє виявлення помилок та кращу документацію коду"
    },
    {
        title: "10.9 Playwright MCP та AI-assisted Testing",
        description: `## 🤖 AI у тестуванні

Нова ера: AI-assisted Test Generation!

**Playwright MCP (Model Context Protocol):**
Playwright має офіційний MCP server, який дозволяє AI-асистентам (Claude, Gemini) безпосередньо взаємодіяти з браузером.

\`\`\`json
// .mcp.json — конфігурація для Claude Desktop
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
\`\`\`

**Можливості Playwright MCP:**
- AI може відкрити браузер, клікати, вводити дані
- AI може генерувати Playwright тести на основі реальних дій
- AI може аналізувати DOM та пропонувати кращі локатори

**AI Test Generation:**
\`\`\`bash
# Codegen з AI-підказками
npx playwright codegen --ai https://example.com

# Playwright Inspector — бачить контекст та пропонує
npx playwright test --ui
\`\`\`

---
### 🎯 Ваше завдання
Що таке Playwright MCP (Model Context Protocol)?
`,
        code: "",
        type: "quiz",
        options: [
            "Новий формат конфігурації, що замінює playwright.config.ts",
            "Протокол для підключення AI-асистентів до Playwright, що дозволяє їм керувати браузером та генерувати тести",
            "Система для моніторингу продуктивності тестів у реальному часі",
            "MCP — це Multi-Core Processing, прискорення тестів через GPU"
        ],
        correctAnswer: "Протокол для підключення AI-асистентів до Playwright, що дозволяє їм керувати браузером та генерувати тести"
    },
    {
        title: "10.10 Фінальний проєкт: Full Test Suite",
        description: `## 🏆 Фінальний Рівень: Повний Test Suite

Ви пройшли весь курс Playwright! Час зібрати всі знання докупи.

**Комплексний тест-план для реального проєкту:**

\`\`\`
📁 tests/
├── 📁 auth/
│   ├── login.spec.ts       # Happy path + negative cases
│   └── session.spec.ts     # Storage state, 2FA
├── 📁 api/
│   ├── endpoints.spec.ts   # Contract testing
│   └── interceptors.spec.ts # Network mocks
├── 📁 ui/
│   ├── home.spec.ts        # Visual regression
│   ├── forms.spec.ts       # Input validation
│   └── navigation.spec.ts  # SPA routing
├── 📁 e2e/
│   └── checkout.spec.ts    # Critical user flows
└── 📁 accessibility/
    └── a11y.spec.ts        # WCAG compliance
\`\`\`

**Ваш арсенал після цього курсу:**
- ✅ Playwright API: locators, assertions, actions
- ✅ POM та архітектурні паттерни
- ✅ Auth: Cookies, Storage State, JWT
- ✅ API тестування та Network interception
- ✅ Visual, A11y та Performance тести
- ✅ CI/CD: GitHub Actions, Docker, Sharding
- ✅ AI-assisted тестування (MCP)

---
### 🎯 Ваше фінальне завдання
Напишіть мінімальний "smoke test suite" — тест, що перевіряє 3 речі разом:
1. Сторінка завантажується (status 200)
2. Title не пустий  
3. Жодних console errors
`,
        code: `import { test, expect } from '@playwright/test';

/**
 * 🏆 ФІНАЛЬНИЙ SMOKE TEST
 * Перевіряє базову "живість" сторінки
 */
test('smoke test: playwright.dev', async ({ page }) => {
  const errors: string[] = [];

  // TODO 1: Підпишіться на console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Переходимо на сторінку
  const response = await page.goto('https://playwright.dev/');

  // TODO 2: Перевірте що response.status() === 200
  expect(response?./* ??? */()).toBe(200);

  // TODO 3: Отримайте title і перевірте що він не пустий (length > 0)
  const title = await page./* ??? */();
  expect(title./* ??? */).toBeGreaterThan(0);
  
  // TODO 4: Перевірте що помилок у консолі немає
  expect(errors).toEqual(/* ??? */);
  
  console.log(\`✅ Smoke test пройдено! Title: "\${title}", Errors: \${errors.length}\`);
});`,
        type: "code"
    },
];
