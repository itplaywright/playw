export const level9Tasks = [
    {
        title: "9.1 Visual Testing: Скріншот порівняння",
        description: `## 📸 Visual Regression Testing

Playwright має вбудований механізм візуального тестування! Він робить скріншот і порівнює його з "еталонним" зображенням.

\`\`\`typescript
// Перший запуск: створює еталонний скріншот
await expect(page).toHaveScreenshot('homepage.png');

// Подальші запуски: порівнює з еталоном
// Якщо є відмінності — тест падає

// Тільки конкретний елемент:
await expect(page.locator('.header')).toHaveScreenshot('header.png');

// З допуском на відмінності (pixels):
await expect(page).toHaveScreenshot('page.png', {
  maxDiffPixels: 100, // Дозволити до 100 різних пікселів
  threshold: 0.1,     // 10% допуск на різницю кольору
});

// Оновити еталонні скріншоти:
// npx playwright test --update-snapshots
\`\`\`

---
### 🎯 Ваше завдання
Попишіть тест, який:
1. Переходить на \`https://playwright.dev/\`
2. Робить скріншот всієї сторінки та порівнює з еталоном \`'playwright-home.png'\`
`,
        code: `import { test, expect } from '@playwright/test';

test('visual regression: homepage', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // Зачекаємо поки анімації стихнуть
  await page.waitForLoadState('networkidle');
  
  // TODO: Перевірте скріншот сторінки, порівнявши з 'playwright-home.png'
  // Додайте параметр maxDiffPixels: 200 для стабільності
  await expect(/* ??? */).toHaveScreenshot('playwright-home.png', {
    maxDiffPixels: /* ??? */,
  });
});`,
        type: "code"
    },
    {
        title: "9.2 Accessibility Testing: Перевірка a11y",
        description: `## ♿ Accessibility (A11y) Testing

Playwright + axe-core = автоматична перевірка доступності сайту для людей із вадами.

\`\`\`bash
npm install @axe-core/playwright
\`\`\`

\`\`\`typescript
import { checkA11y } from '@axe-core/playwright';

test('accessibility check', async ({ page }) => {
  await page.goto('/');
  
  // Перевірити всю сторінку
  await checkA11y(page, undefined, {
    detailedReport: true, // Детальний звіт про помилки
    detailedReportOptions: { html: true }, // З HTML кодом
  });
  
  // Перевірити тільки конкретний елемент:
  await checkA11y(page, 'main', {
    axeOptions: {
      rules: {
        'color-contrast': { enabled: true }, // Тільки контраст
      },
    },
  });
});
\`\`\`

**Основні помилки A11y:**
- Немає \`alt\` у зображень
- Кнопки без тексту або aria-label
- Поля форм без \`label\`
- Недостатній контраст кольорів

---
### 🎯 Ваше завдання
Яка утиліта найчастіше використовується разом з Playwright для автоматичної перевірки accessibility?
`,
        code: "",
        type: "quiz",
        options: [
            "Playwright має вбудований axe-engine і не потребує додаткових пакетів",
            "WAVE Browser Extension — перевірка через UI",
            "@axe-core/playwright — інтеграція axe-core з Playwright для програмної a11y перевірки",
            "Lighthouse CI — спеціальна утиліта саме для тестів Playwright"
        ],
        correctAnswer: "@axe-core/playwright — інтеграція axe-core з Playwright для програмної a11y перевірки"
    },
    {
        title: "9.3 Performance Testing: Метрики швидкодії",
        description: `## ⚡ Performance Metrics

Playwright може виміряти PageLoad Performance через Chrome DevTools Protocol:

\`\`\`typescript
test('performance metrics', async ({ page }) => {
  await page.goto('/');
  
  // Отримати Navigation Timing API дані
  const metrics = await page.evaluate(() => JSON.stringify(performance.timing));
  const timing = JSON.parse(metrics);
  
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  console.log(\`Час завантаження: \${loadTime}мс\`);
  
  // Перевірка: сторінка завантажується менш ніж за 3 секунди
  expect(loadTime).toBeLessThan(3000);
  
  // Або через CDP:
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');
  const perfMetrics = await client.send('Performance.getMetrics');
  console.log(perfMetrics.metrics);
});
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, який вимірює час завантаження \`playwright.dev\` та перевіряє, що він менше \`5000мс\`.
`,
        code: `import { test, expect } from '@playwright/test';

test('page load performance', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // TODO: Виміряйте час завантаження через performance.timing
  const loadTime = await page.evaluate(() => {
    const timing = /* ??? */;
    return timing.loadEventEnd - timing.navigationStart;
  });

  console.log(\`Час завантаження: \${loadTime}мс\`);

  // TODO: Перевірте, що loadTime < 5000
  expect(loadTime)./* ??? */(5000);
});`,
        type: "code"
    },
    {
        title: "9.4 Console & Network Errors Monitoring",
        description: `## 🔍 Моніторинг помилок у консолі та мережі

Хороший тест не тільки перевіряє UI, а й слідкує за помилками у фоні:

\`\`\`typescript
test('no console errors', async ({ page }) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  
  // Слухаємо помилки в консолі
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Слухаємо невдалі мережеві запити
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push(\`\${response.status()} \${response.url()}\`);
    }
  });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Перевіряємо відсутність помилок
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, що збирає всі console errors при відкритті \`playwright.dev\`, логує їх та перевіряє що масив помилок пустий.
`,
        code: `import { test, expect } from '@playwright/test';

test('no console errors on playwright.dev', async ({ page }) => {
  const consoleErrors: string[] = [];

  // TODO: Підпишіться на подію 'console'
  // Якщо msg.type() === 'error' — пушіть msg.text() у consoleErrors
  page.on(/* ??? */, (msg) => {
    if (msg./* ??? */() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('https://playwright.dev/');
  await page.waitForLoadState('networkidle');

  if (consoleErrors.length > 0) {
    console.log('Знайдено помилки:', consoleErrors);
  }

  // TODO: Перевірте, що consoleErrors пустий масив
  expect(consoleErrors)./* ??? */([]);
});`,
        type: "code"
    },
    {
        title: "9.5 PDF Generation Testing",
        description: `## 📄 Тестування PDF генерації

Playwright може зберігати сторінки як PDF і перевіряти генерацію:

\`\`\`typescript
test('generate PDF', async ({ page }) => {
  await page.goto('/invoice');
  
  // Згенерувати PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true, // Зберегти кольори фону
    margin: { top: '20px', bottom: '20px' },
  });
  
  // Перевірити, що PDF не пустий
  expect(pdfBuffer.length).toBeGreaterThan(0);
  
  // Зберегти файл (для перевірки вмісту)
  fs.writeFileSync('invoice.pdf', pdfBuffer);
  
  // Перевірити розмір (наприклад, > 10KB)
  expect(pdfBuffer.length).toBeGreaterThan(10000);
});
\`\`\`

**Важливо:** \`page.pdf()\` доступний тільки у Headless режимі та тільки для Chromium.

---
### 🎯 Ваше завдання
Яке обмеження має метод \`page.pdf()\` у Playwright?
`,
        code: "",
        type: "quiz",
        options: [
            "page.pdf() доступний тільки в headless режимі та тільки для Chromium браузера",
            "page.pdf() генерує тільки чорно-білі PDF документи",
            "page.pdf() можна використовувати тільки для сторінок без JavaScript",
            "page.pdf() доступний для всіх браузерів але тільки на Windows"
        ],
        correctAnswer: "page.pdf() доступний тільки в headless режимі та тільки для Chromium браузера"
    },
    {
        title: "9.6 Database Testing: Playwright + DB",
        description: `## 🗄️ Playwright + База Даних

Playwright не обмежений UI — можна комбінувати з прямими DB запитами:

**Підхід 1: API setup + UI verify**
\`\`\`typescript
test('user profile shows correct data', async ({ request, page }) => {
  // 1. Через API Create тестового юзера
  const response = await request.post('/api/users', {
    data: { name: 'Тест Юзер', email: 'test@qa.com' },
  });
  const { id } = await response.json();
  
  // 2. UI перевірка
  await page.goto(\`/users/\${id}\`);
  await expect(page.getByText('Тест Юзер')).toBeVisible();
  
  // 3. Cleanup через API
  await request.delete(\`/api/users/\${id}\`);
});
\`\`\`

**Підхід 2: DB setup + UI verify (потребує db client)**
\`\`\`typescript
import { Client } from 'pg';
const db = new Client({ connectionString: process.env.DATABASE_URL });

test.beforeEach(async () => {
  await db.query("INSERT INTO users (name) VALUES ('Test')");
});

test.afterEach(async () => {
  await db.query("DELETE FROM users WHERE name = 'Test'");
});
\`\`\`

---
### 🎯 Ваше завдання
Яка перевага використання API для підготовки тестових даних (а не через UI форму)?
`,
        code: "",
        type: "quiz",
        options: [
            "API підготовка даних завжди надійніша, ніж пряме підключення до БД",
            "API підготовка даних значно швидша за UI, не залежить від UI змін та легко очищається після тесту",
            "API дозволяє тестувати сторінки без відкриття браузера",
            "API підготовка даних доступна тільки у PRO версії Playwright"
        ],
        correctAnswer: "API підготовка даних значно швидша за UI, не залежить від UI змін та легко очищається після тесту"
    },
    {
        title: "9.7 Contract Testing: Перевірка API контрактів",
        description: `## 📋 Contract Testing

Contract Testing — перевірка того, що API відповідає очікуваному "контракту" (структурі):

\`\`\`typescript
test('API contract: user endpoint', async ({ request }) => {
  const response = await request.get('/api/users/1');
  const user = await response.json();
  
  // Перевірка структури відповіді (не тільки значень!)
  expect(response.status()).toBe(200);
  expect(user).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    email: expect.stringContaining('@'),
    createdAt: expect.any(String),
    // role має бути одним із дозволених значень
    role: expect.stringMatching(/^(admin|user|guest)$/),
  });
  
  // Перевірка що немає зайвих чутливих полів
  expect(user).not.toHaveProperty('password');
  expect(user).not.toHaveProperty('passwordHash');
});
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, що робить GET запит до \`https://jsonplaceholder.typicode.com/users/1\` і перевіряє, що відповідь містить поля \`id\`, \`name\`, та \`email\`.
`,
        code: `import { test, expect } from '@playwright/test';

test('contract: user API', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users/1');

  // TODO: Перевірте, що статус 200
  expect(response./* ??? */()).toBe(200);

  const user = await response./* ??? */();

  // TODO: Перевірте структуру відповіді через toMatchObject
  expect(user).toMatchObject({
    id: expect./* ??? */(Number),
    name: expect./* ??? */(String),
    email: expect./* ??? */(String),
  });

  console.log('User:', user.name, user.email);
});`,
        type: "code"
    },
    {
        title: "9.8 WebSocket Testing",
        description: `## 🔌 WebSocket тестування

Playwright може перехоплювати WebSocket з'єднання:

\`\`\`typescript
test('WebSocket messages', async ({ page }) => {
  const wsMessages: string[] = [];
  
  // Перехоплюємо WebSocket
  page.on('websocket', (ws) => {
    console.log(\`WS з'єднання: \${ws.url()}\`);
    
    ws.on('framesent', (event) => {
      wsMessages.push(\`SENT: \${event.payload}\`);
    });
    
    ws.on('framereceived', (event) => {
      wsMessages.push(\`RECEIVED: \${event.payload}\`);
    });
    
    ws.on('close', () => {
      console.log('WS закрито');
    });
  });
  
  await page.goto('/realtime-chat');
  
  // Надсилаємо повідомлення через UI
  await page.fill('#message', 'Hello!');
  await page.click('#send');
  
  // Перевіряємо що WS повідомлення були
  expect(wsMessages.length).toBeGreaterThan(0);
});
\`\`\`

---
### 🎯 Ваше завдання
Яка подія Playwright використовується для перехоплення WebSocket з'єднань на рівні сторінки?
`,
        code: "",
        type: "quiz",
        options: [
            "page.on('socket', handler)",
            "page.on('websocket', handler)",
            "page.interceptWebSocket(handler)",
            "page.route('ws://**', handler)"
        ],
        correctAnswer: "page.on('websocket', handler)"
    },
    {
        title: "9.9 Shadow DOM: Тестування Web Components",
        description: `## 🌑 Shadow DOM

Web Components ховають свій DOM у Shadow Root — звичайні CSS/XPath локатори туди не потрапляють.

\`\`\`typescript
// ❌ НЕ ПРАЦЮЄ з Shadow DOM:
await page.click('.shadow-content button'); // XPath не проникає в Shadow Root

// ✅ ПРАЦЮЄ — Playwright автоматично проникає в Shadow DOM:
// getByText, getByRole, getByLabel — пронизують Shadow Root!
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@test.com');
await page.getByText('Успішно збережено').waitFor();

// Якщо треба конкретно Shadow DOM елемент:
const element = page.locator('my-custom-element').locator('button');
// Playwright автоматично "заходить" в shadow root 👆

// locator.evaluateHandle для прямого доступу:
const shadowHost = page.locator('my-widget');
const shadowBtn = await shadowHost.evaluateHandle(
  (el) => el.shadowRoot?.querySelector('button')
);
\`\`\`

---
### 🎯 Ваше завдання
Яке твердження правильне щодо роботи Playwright з Shadow DOM?
`,
        code: "",
        type: "quiz",
        options: [
            "Playwright взагалі не підтримує Shadow DOM — треба використовувати JavaScript",
            "Playwright вимагає спеціальної конфігурації для кожного Shadow Host",
            "Методи getByRole, getByText, getByLabel автоматично проникають у Shadow DOM без додаткових налаштувань",
            "Shadow DOM доступний тільки у Firefox версії Playwright"
        ],
        correctAnswer: "Методи getByRole, getByText, getByLabel автоматично проникають у Shadow DOM без додаткових налаштувань"
    },
    {
        title: "9.10 Геолокація та персмішн-тести",
        description: `## 🌍 Геолокація та браузерні дозволи

Playwright дозволяє симулювати геолокацію та керувати дозволами браузера:

\`\`\`typescript
test('geolocation simulation', async ({ browser }) => {
  // Симулюємо місцезнаходження в Kyiv
  const context = await browser.newContext({
    geolocation: { latitude: 50.4501, longitude: 30.5234 },
    permissions: ['geolocation'], // Дозволяємо геолокацію
    locale: 'uk-UA',              // Українська локаль
    timezoneId: 'Europe/Kiev',    // Часовий пояс Kyiv
  });
  
  const page = await context.newPage();
  await page.goto('/map');
  
  // Сайт думає що ми у Kyiv!
  await expect(page.getByText('Київ')).toBeVisible();
});

// Інші дозволи:
await context.grantPermissions(['notifications', 'camera', 'microphone']);
await context.clearPermissions();
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, що відкриває \`playwright.dev\` зі встановленою геолокацією (latitude: 50.45, longitude: 30.52) та перевіряє, що сторінка завантажилася успішно (title містить 'Playwright').
`,
        code: `import { test, expect, chromium } from '@playwright/test';

test('simulated geolocation in Kyiv', async ({}) => {
  const browser = await chromium.launch();
  
  // TODO: Створіть контекст з геолокацією latitude: 50.45, longitude: 30.52
  // та дозволом 'geolocation'
  const context = await browser.newContext({
    geolocation: { latitude: /* ??? */, longitude: /* ??? */ },
    permissions: [/* ??? */],
  });
  
  const page = await context.newPage();
  await page.goto('https://playwright.dev/');
  
  // TODO: Перевірте, що title містить 'Playwright'
  await expect(page).toHaveTitle(/* ??? */);
  
  await browser.close();
});`,
        type: "code"
    },
];
