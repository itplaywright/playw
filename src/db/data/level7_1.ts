export const level7Tasks = [
    {
        title: "7.1 Storage State: Збереження сесії",
        description: `## 🔐 Storage State — Вхід без повтору

У реальних проектах 80% тестів вимагають авторизації. Якщо кожен тест логінується через UI — це катастрофа для швидкості.

**Storage State** — це JSON-файл з усіма куками та localStorage після успішного входу. Playwright може "підкласти" його новому контексту браузера, і він стартуватиме вже як авторизований користувач.

\`\`\`typescript
// Один раз зберігаємо стан після логіну:
await page.context().storageState({ path: 'auth.json' });

// У тестах миттєво стартуємо як залогінений:
const context = await browser.newContext({
  storageState: 'auth.json',
});
\`\`\`

Зазвичай це роблять у \`globalSetup\` — один логін перед всіма тестами.

---
### 🎯 Ваше завдання
Напишіть тест, який:
1. Переходить на \`https://playwright.dev/\`
2. Зберігає Storage State контексту у файл \`auth-state.json\`
`,
        code: `import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test('save storage state', async ({}) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://playwright.dev/');
  
  // TODO: збережіть storageState контексту у файл 'auth-state.json'
  await context.storageState({ path: /* ??? */ });
  
  await browser.close();
});`,
        type: "code"
    },
    {
        title: "7.2 Basic Auth: HTTP Авторизація",
        description: `## 🔒 HTTP Basic Authentication

Деякі сторінки захищені на рівні HTTP (pop-up браузера з логіном/паролем). Це не форма на сторінці — це браузерне діалогове вікно.

Playwright обробляє це елегантно через \`httpCredentials\` у налаштуваннях контексту:

\`\`\`typescript
const context = await browser.newContext({
  httpCredentials: {
    username: 'admin',
    password: 'secret',
  },
});
\`\`\`

Або в \`playwright.config.ts\` для глобального застосування:
\`\`\`typescript
use: {
  httpCredentials: { username: 'user', password: 'pass' },
}
\`\`\`

Тепер браузер автоматично відповідатиме на HTTP Auth запити.

---
### 🎯 Ваше завдання
Напишіть тест, який через \`httpCredentials\` відкриває захищену сторінку \`https://httpbin.org/basic-auth/admin/secret\` і перевіряє, що відповідь містить \`"authenticated": true\`.
`,
        code: `import { test, expect, chromium } from '@playwright/test';

test('basic auth', async ({}) => {
  const browser = await chromium.launch();
  
  // TODO: Створіть контекст з httpCredentials { username: 'admin', password: 'secret' }
  const context = await browser.newContext({
    httpCredentials: {
      username: /* ??? */,
      password: /* ??? */,
    },
  });
  
  const page = await context.newPage();
  await page.goto('https://httpbin.org/basic-auth/admin/secret');
  
  // TODO: Перевірте, що body містить текст '"authenticated": true'
  await expect(page.locator('body')).toContainText(/* ??? */);
  
  await browser.close();
});`,
        type: "code"
    },
    {
        title: "7.3 Cookie Management: Читання та запис",
        description: `## 🍪 Управління Cookies

Cookies — основа авторизації на більшості сайтів. Playwright дає повний контроль:

\`\`\`typescript
// Отримати всі куки поточного контексту
const cookies = await context.cookies();

// Додати куку (симуляція "вже-залогіненого" стану)
await context.addCookies([{
  name: 'session_token',
  value: 'eyJhbGc...',
  domain: 'example.com',
  path: '/',
}]);

// Видалити всі куки (тест logout)
await context.clearCookies();
\`\`\`

Також можна фільтрувати куки за доменом: \`context.cookies(['https://example.com'])\`.

---
### 🎯 Ваше завдання
Напишіть тест, який:
1. Відкриває \`https://playwright.dev/\`
2. Читає всі cookies контексту через \`context.cookies()\`
3. Перевіряє через \`expect(cookies.length).toBeGreaterThanOrEqual(0)\`
`,
        code: `import { test, expect } from '@playwright/test';

test('cookie management', async ({ context, page }) => {
  await page.goto('https://playwright.dev/');
  
  // TODO: отримайте cookies контексту
  const cookies = await context./* ??? */();
  
  console.log('Знайдено кукі:', cookies.length);
  
  // TODO: Перевірте, що довжина масиву cookies >= 0
  expect(cookies.length)./* ??? */(0);
});`,
        type: "code"
    },
    {
        title: "7.4 localStorage та sessionStorage",
        description: `## 💾 Web Storage API

Окрім cookies, сайти зберігають дані у \`localStorage\` та \`sessionStorage\`. Playwright дає доступ до них через \`page.evaluate()\`:

\`\`\`typescript
// Записати в localStorage (симуляція вже-залогіненого стану)
await page.evaluate(() => {
  localStorage.setItem('token', 'my-auth-token');
  localStorage.setItem('user', JSON.stringify({ name: 'Іван' }));
});

// Прочитати з localStorage
const token = await page.evaluate(() => localStorage.getItem('token'));

// Очистити localStorage
await page.evaluate(() => localStorage.clear());
\`\`\`

Це потужний спосіб симулювати стан додатку без проходження через UI.

---
### 🎯 Ваше завдання
Напишіть тест, який:
1. Відкриває \`https://playwright.dev/\`
2. Записує \`theme: 'dark'\` у localStorage
3. Читає значення і перевіряє, що воно дорівнює \`'dark'\`
`,
        code: `import { test, expect } from '@playwright/test';

test('localStorage manipulation', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // TODO: Запишіть у localStorage ключ 'theme' зі значенням 'dark'
  await page.evaluate(() => {
    localStorage./* ??? */('theme', 'dark');
  });

  // TODO: Прочитайте значення ключа 'theme' з localStorage
  const theme = await page.evaluate(() => {
    return localStorage./* ??? */('theme');
  });

  // TODO: Перевірте, що theme === 'dark'
  expect(theme)./* ??? */('dark');
});`,
        type: "code"
    },
    {
        title: "7.5 Intercepting Auth Tokens: API авторизація",
        description: `## 🎯 Ловимо Bearer Token

У сучасних SPA-додатках авторизація часто відбувається через JWT Bearer Token у заголовку Authorization. Playwright може перехопити цей токен:

\`\`\`typescript
let authToken = '';

// Перехоплюємо запити до API
page.on('request', (request) => {
  const authHeader = request.headers()['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    authToken = authHeader.replace('Bearer ', '');
  }
});

// Якщо потрібно — додаємо токен до наступних API запитів
await page.route('**/api/**', async (route) => {
  await route.continue({
    headers: {
      ...route.request().headers(),
      'Authorization': \`Bearer \${authToken}\`,
    },
  });
});
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, який перехоплює **усі** запити на \`'https://playwright.dev/'\` та логує їхні URL у консоль. Перевірте, що хоча б 1 запит був зроблений (масив не пустий).
`,
        code: `import { test, expect } from '@playwright/test';

test('intercept requests', async ({ page }) => {
  const requestUrls: string[] = [];

  // TODO: Підпишіться на подію 'request' сторінки
  // і пушіть request.url() в масив requestUrls
  page.on(/* ??? */, (request) => {
    requestUrls.push(request.url());
  });

  await page.goto('https://playwright.dev/');

  // TODO: Перевірте, що requestUrls.length > 0
  expect(requestUrls.length)./* ??? */(0);
  console.log(\`Перехоплено запитів: \${requestUrls.length}\`);
});`,
        type: "code"
    },
    {
        title: "7.6 Роль Authentication Fixtures",
        description: `## 🏭 Fixtures для авторизації

Щоб не дублювати логін-логіку в кожному тесті, Playwright рекомендує **Fixtures** — кастомні "фікстури" до тестів.

\`\`\`typescript
// fixtures.ts
import { test as base } from '@playwright/test';

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'auth.json', // раніше збережений стан
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// Тепер у тестах:
import { test } from './fixtures';
test('my test', async ({ authenticatedPage }) => {
  // authenticatedPage вже авторизований!
});
\`\`\`

---
### 🎯 Ваше завдання
Яка основна перевага використання Playwright Fixtures для авторизації порівняно з логіном через UI в кожному тесті?
`,
        code: "",
        type: "quiz",
        options: [
            "Fixtures роблять тести повільнішими, але надійнішими",
            "Fixtures дозволяють уникнути дублювання коду та прискорити тести — логін відбувається один раз",
            "Fixtures можна використовувати тільки для API тестування",
            "Fixtures автоматично генерують тестові дані для форм"
        ],
        correctAnswer: "Fixtures дозволяють уникнути дублювання коду та прискорити тести — логін відбувається один раз"
    },
    {
        title: "7.7 2FA: Тестування двофакторної авторизації",
        description: `## 🔑 Two-Factor Authentication (2FA)

2FA — nightmare для класичного E2E. Але Playwright справляється!

**Стратегія 1: Disable 2FA в тестовому середовищі**
Найпростіше рішення — попросити команду не вмикати 2FA для тестового акаунту.

**Стратегія 2: TOTP через бібліотеку**
TOTP (Google Authenticator) генерує код за алгоритмом, основаним на часі. Можна генерувати код програмно:
\`\`\`typescript
import * as OTPAuth from 'otpauth';

const totp = new OTPAuth.TOTP({
  secret: OTPAuth.Secret.fromBase32(process.env.TOTP_SECRET!),
});
const code = totp.generate(); // Генерує актуальний 6-значний код
await page.fill('[data-testid="2fa-input"]', code);
\`\`\`

**Стратегія 3: Email/SMS Mock**
Якщо 2FA приходить на email/SMS — мокайте поштовий сервер (наприклад, Mailhog, Mailosaur).

---
### 🎯 Ваше завдання
Який підхід є найефективнішим для тестування 2FA у Playwright, якщо 2FA базується на TOTP (Google Authenticator)?
`,
        code: "",
        type: "quiz",
        options: [
            "Написати скрипт, який вручну відкриває Google Authenticator на телефоні",
            "Відключити 2FA перевірку тільки для виробничого сервера",
            "Використати бібліотеку otpauth для програмної генерації TOTP коду за секретним ключем",
            "Playwright не підтримує тестування 2FA — це обмеження фреймворку"
        ],
        correctAnswer: "Використати бібліотеку otpauth для програмної генерації TOTP коду за секретним ключем"
    },
    {
        title: "7.8 OAuth 2.0: Тестування соціального входу",
        description: `## 🌐 OAuth та соціальний вхід

"Увійти через Google/GitHub" — популярна фіча, яка ускладнює тестування через редіректи та капчі.

**Стратегія 1: Мокування OAuth провайдера**
Замість реального Google перехопіть редірект і підміните його відповіддю з токеном:
\`\`\`typescript
await page.route('**/oauth/callback**', async route => {
  await route.fulfill({
    status: 302,
    headers: { Location: '/dashboard?token=fake_token' },
  });
});
\`\`\`

**Стратегія 2: Storage State після реального логіну**
Один раз залогінтесь через Google вручну, збережіть storage state, і перевикористовуйте його у всіх тестах (не потребує автоматизації OAuth флоу).

**Стратегія 3: Test accounts без 2FA**
Створіть тестовий Google акаунт без 2FA + вимкніть capcha в dev середовищі.

---
### 🎯 Ваше завдання
Яка стратегія є найбільш рекомендованою для E2E тестування OAuth-логіну (наприклад, "Увійти через Google") без взаємодії з реальним Google?
`,
        code: "",
        type: "quiz",
        options: [
            "Записати UI дії у codegen і запускати їх кожного разу на google.com",
            "Зберегти Storage State після ручного логіну через Google і перевикористовувати його у тестах",
            "Написати тест, що вводить реальний логін/пароль на google.com",
            "OAuth логін неможливо тестувати, тому його треба пропускати"
        ],
        correctAnswer: "Зберегти Storage State після ручного логіну через Google і перевикористовувати його у тестах"
    },
    {
        title: "7.9 Role-Based Access Control (RBAC) Testing",
        description: `## 👑 Тестування прав доступу (RBAC)

RBAC (Role-Based Access Control) — коли різні користувачі мають різні права. Наприклад:
- **Admin** — бачить панель адміна, видаляє користувачів
- **User** — бачить тільки свій профіль
- **Guest** — бачить тільки публічні сторінки

**Стратегія тестування RBAC:**
\`\`\`typescript
// Два storage states для двох ролей
test.describe('Адмін панель', () => {
  test.use({ storageState: 'admin-auth.json' });
  test('видна адміну', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL('/403');
  });
});

test.describe('Звичайний юзер', () => {
  test.use({ storageState: 'user-auth.json' });
  test('NЕ видна юзеру', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/403'); // Перенаправлено!
  });
});
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, який перевіряє, що авторизований користувач НЕ потрапляє на \`/dashboard\` після переходу — тобто сторінка доступна (не редіректить на /login).
`,
        code: `import { test, expect } from '@playwright/test';

/**
 * Завдання: Перевірте доступність сторінки
 * Уявіть, що storageState вже налаштований у playwright.config.ts
 */
test('authorized user sees dashboard', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // TODO: Перевірте, що URL сторінки НЕ містить '/login'
  // Тобто нас не відкинуло на сторінку входу
  await expect(page).not./* ??? URL не містить '/login' */;
  
  // TODO: Перевірте, що заголовок сторінки не пустий
  const title = await page.title();
  expect(title.length)./* ??? */(0);
});`,
        type: "code"
    },
    {
        title: "7.10 JWT Decode: Перевірка payload токена",
        description: `## 🔓 Декодування JWT Token

JWT (JSON Web Token) — це рядок виду \`header.payload.signature\`. Payload — це base64-закодований JSON з даними юзера (id, role, email).

Іноді потрібно перевірити, що після логіну токен містить правильні дані:
\`\`\`typescript
// Декодуємо JWT payload без бібліотек (browser atob)
const jwtPayload = await page.evaluate((token) => {
  const base64Payload = token.split('.')[1];
  const decoded = atob(base64Payload);
  return JSON.parse(decoded);
}, jwtToken);

expect(jwtPayload.role).toBe('admin');
expect(jwtPayload.email).toBe('test@example.com');
\`\`\`

---
### 🎯 Ваше завдання
Напишіть тест, який:
1. Декодує JWT payload через \`page.evaluate\` та \`atob\`
2. Перевіряє, що payload містить поле \`sub\`

Для тесту використайте тестовий JWT: \`eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6InVzZXIifQ.signature\`
`,
        code: `import { test, expect } from '@playwright/test';

test('decode JWT payload', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6InVzZXIifQ.signature';

  // TODO: Декодуйте JWT payload за допомогою page.evaluate та atob
  const payload = await page.evaluate((token) => {
    const base64Payload = token.split('.')[/* ??? індекс payload */];
    const decoded = /* ??? */( base64Payload );
    return JSON.parse(decoded);
  }, testToken);

  console.log('Decoded JWT:', payload);

  // TODO: Перевірте, що payload.sub існує і дорівнює 'user123'
  expect(payload./* ??? */).toBe('user123');
});`,
        type: "code"
    },
];
