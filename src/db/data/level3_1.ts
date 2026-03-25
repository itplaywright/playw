export const level3Tasks_1 = [
    {
        title: "3.1 API Testing: request.get() — ваш перший API тест",
        description: `## ⚡ Playwright як потужний API тестувальник

Більшість QA-автоматизаторів-початківців думають, що Playwright — це виключно інструмент для браузера. Але це велика оманa! Playwright має вбудований API-клієнт, який дозволяє тестувати HTTP-ендпоінти з **тією самою зручністю, що і UI**.

Порівняйте:
- **Postman** — ручне тестування API, не скейлиться у CI/CD
- **Axios / node-fetch** — вимагає багато конфігурування
- **Playwright APIRequestContext** — готовий, з авторизацією, baseURL і серіалізацією прямо з коробки!

## 🛠 Концепція на практиці
Fixtures у Playwright включають фікстуру \`{ request }\`. Це вже налаштований HTTP-клієнт, готовий до роботи.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('перевірка публічного API', async ({ request }) => {
  // 1. Виконуємо GET запит
  const response = await request.get('https://jsonplaceholder.typicode.com/todos/1');
  
  // 2. Перевіряємо статус відповіді
  expect(response.ok()).toBeTruthy(); // .ok() == (status >= 200 && status < 300)
  expect(response.status()).toBe(200);
  
  // 3. Зчитуємо тіло відповіді як JSON
  const body = await response.json();
  expect(body.id).toBe(1);
  expect(body.title).toBeTruthy(); // Поле 'title' має існувати та бути правдивим значенням
});
\`\`\`

## 💡 Чому це потужніше за чисті UI тести?
API тести — це **основа надійного тестового пірамідального підходу**:
- Вони в 10-50 разів **швидші**, ніж UI тести (немає браузера)
- **Стабільніші** — не залежать від верстки та анімацій
- **Ізольованіші** — тестують лише конкретний ендпоінт
- Ви можете підготовити тестові дані через API перед запуском UI тесту!

---
### 🎯 Ваше завдання
Доповніть тест, виконавши GET запит до endpointу за допомогою правильного методу об'єкта \`request\`.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('api get', async ({ request }) => {\n  // виконайте GET запит\n  const response = await request.get('https://jsonplaceholder.typicode.com/todos/1');\n  expect(response.status()).toBe(200);\n});",
        type: "code",
        options: [
            "await request.get(url)",
            "await page.get(url)",
            "await fetch(url)",
            "await axios.get(url)"
        ],
        correctAnswer: "await request.get(url)"
    },
    {
        title: "3.2 API Testing: POST запит та перевірка відповіді",
        description: `## 📨 Створення тестових даних через API (Test Data Setup)

Уявіть, що ваш UI тест має протестувати сторінку "Список замовлень" для конкретного клієнта.
Перший підхід (поганий): логінитесь через UI, натискаєте "Створити замовлення", заповнюєте форму, зберігаєте і тільки потім переходите до тесту. Це займає **30+ секунд** і ваш тест залежить від форми створення, яку ви не тестуєте.

Правильний підхід **(API-first setup)**: перед UI тестом, в \`beforeEach\`, ви надсилаєте POST запит на \`/api/orders\` і за 0.5 секунди у вас є тестовий об'єкт. Потім UI тест перевіряє лише свій сценарій — відображення замовлень.

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('створення нового ресурсу через API', async ({ request }) => {
  // 1. Відправляємо POST з тілом запиту через поле 'data'
  const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
    data: {
      title: 'Тестова стаття',
      body: 'Зміст статті автотест',
      userId: 1,
    }
  });

  // 2. Перевіряємо, що ресурс СТВОРЕНО (статус 201 Created)
  expect(response.status()).toBe(201);

  // 3. Беремо тіло відповіді і перевіряємо, що сервер повернув наш ID
  const createdPost = await response.json();
  expect(createdPost.id).toBeDefined(); // id має існувати (сервер його присвоює)
  expect(createdPost.title).toBe('Тестова стаття');
});
\`\`\`

## 💡 Best Practices:
- Завжди перевіряйте статус відповіді (200 vs 201 vs 204!)
- Verifyте форму відповіді (структуру JSON), а не лише сам факт запиту
- Відокремлюйте **API setup** (у \`beforeAll\`/\`beforeEach\`) від **UI assertions** (у самому тесті)

---
### 🎯 Ваше завдання
Виконайте POST запит на API з тілом даних. Знайдіть правильний метод і формат передачі даних.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('create resource', async ({ request }) => {\n  const response = await request.post('https://jsonplaceholder.typicode.com/posts', {\n    // як передати дані?\n    data: { title: 'Test', userId: 1 }\n  });\n  expect(response.status()).toBe(201);\n});",
        type: "code",
        options: [
            "request.post(url, { data: ... })",
            "request.send(url, { body: ... })",
            "request.put(url, { json: ... })",
            "request.submit(url, ...)"
        ],
        correctAnswer: "request.post(url, { data: ... })"
    },
    {
        title: "3.3 StorageState: Збереження сесій — Don't Login Every Time!",
        description: `## 🍪 Перевикористання авторизаційних сесій

Кожен UI тест, що вимагає авторизованого користувача, традиційно йде через повний логін у UI:
1. goto('/login')
2. fill(email)
3. fill(password)
4. click('Login')
5. waitForNavigation...

Це 2-4 секунди на кожен тест. Якщо у вас є 50 тестів, що потребують авторизації — ви витрачаєте **3-4+ хвилини** щоразу лише на процедуру входу!

**StorageState** — це рятівний прийом. Ви логінитесь **один раз**, зберігаєте повний стан браузера (cookies + localStorage + sessionStorage) у файл, і потім кожен тест просто **завантажує** цей файл замість того, щоб проходити логін знову.

## 🛠 Концепція на практиці
Крок 1: Спеціальний setup-скрипт (виконується один раз)
\`\`\`typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('aутентифікація', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('admin@app.com');
  await page.getByPlaceholder('Password').fill('SuperSecret123');
  await page.getByRole('button', { name: 'Увійти' }).click();
  
  // Зберігаємо весь стан браузера (cookies, localStorage, тощо)
  await page.context().storageState({ path: '.auth/user.json' });
});
\`\`\`

Крок 2: У тестах, де потрібна авторизація:
\`\`\`typescript
// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';

// ВСЕ! Одного рядка достатньо для автоматичного логіну
test.use({ storageState: '.auth/user.json' });

test('перевíрка дашборду', async ({ page }) => {
  await page.goto('/dashboard');
  // Ми вже залогінені! Жодного goto('/login')!
  await expect(page.getByRole('heading')).toHaveText('Мій дашборд');
});
\`\`\`

## 💡 Best Practices:
Налаштуйте \`playwright.config.ts\`, щоб setup-проект виконувався першим:
- Проект "setup" запускається -> \`.auth/user.json\` зберігається
- Проект "tests" запускається з \`dependencies: ['setup']\` і використовує збережену сесію

---
### 🎯 Ваше завдання
Підключіть збережений файл стану авторизації до тестового файлу за допомогою правильного рядка конфігурації.
`,
        code: "import { test, expect } from '@playwright/test';\n\n// підключіть збережену авторизаційну сесію\n\n\ntest('dashboard access', async ({ page }) => {\n  await page.goto('/dashboard');\n});",
        type: "code",
        options: [
            "test.use({ storageState: 'auth.json' })",
            "test.load({ file: 'auth.json' })",
            "test.cookies('auth.json')",
            "test.session('auth.json')"
        ],
        correctAnswer: "test.use({ storageState: 'auth.json' })"
    },
    {
        title: "3.4 Network Mocking: page.route() — Перехоплення запитів",
        description: `## 🕸️ Мокінг мережі: Ізолюємо фронтенд від бекенду

Одна з найпоширеніших причин нестабільних тестів (flaky tests): **залежність від зовнішніх систем**.
- Бекенд-сервер лежить або відповідає повільно
- Третя сторона (Stripe API, Sendgrid тощо) недоступна
- Тестова база даних ще не заповнена потрібними даними

**Network Mocking** дозволяє повністю ізолювати вашу UI-перевірку від стану бекенду. Ви перехоплюєте мережеві запити до конкретних URL та відповідаєте на них "підробленими" (mock) даними прямо у тесті!

## 🛠 Концепція на практиці
Метод \`page.route()\` приймає **glob-pattern або RegExp** і callback-функцію.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('відображення списку продуктів (мок бекенду)', async ({ page }) => {
  // 1. Перехоплюємо запит ДО переходу на сторінку!
  await page.route('**/api/products', async route => {
    // 2. Повертаємо наші ТЕСТОВІ дані замість реального бекенду
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Playwright Book', price: 100 },
        { id: 2, name: 'TypeScript Guide', price: 80 }
      ])
    });
  });
  
  // 3. Переходимо на сторінку — вона запросить /api/products, і отримає наші мок-дані
  await page.goto('/products');
  
  // 4. Перевіряємо UI з нашими керованими даними
  await expect(page.getByText('Playwright Book')).toBeVisible();
  
  // Можна також просто ЗАБЛОКУВАТИ запити (щоб сторінка не вантажила рекламу або трекери):
  await page.route('**/*.{png,jpg}', route => route.abort());
});
\`\`\`

## 💡 Порада:
Щоб "вимкнути" мок позаяк він більше не потрібен у цій сесії, використовуйте \`page.unroute(url, handler)\`.

---
### 🎯 Ваше завдання
Знайдіть правильний метод для реєстрації обробника запитів, що дозволяє перехоплювати та змінювати мережеву комунікацію.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('mocked API', async ({ page }) => {\n  // перехопіть запит до API\n  \n  await page.goto('/products');\n});",
        type: "code",
        options: [
            "await page.route(url, ...)",
            "await page.mock(url, ...)",
            "await page.intercept(url, ...)",
            "await network.stub(url, ...)"
        ],
        correctAnswer: "await page.route(url, ...)"
    },
    {
        title: "3.5 Network Mocking: route.fulfill() — Підміна тіла відповіді",
        description: `## 🛠️ Гнучка підміна відповідей сервера (HTTP Stubbing)

Попередній урок показав базову концепцію \`page.route()\`. Тепер поглибимося в метод \`route.fulfill()\` — інструмент для **детальної підміни відповіді сервера**.

За допомогою \`fulfill()\` ви контролюєте _кожен_ аспект HTTP-відповіді:
- **Статус** (200, 404, 500, 503 — будь-який!)
- **Заголовки** (Content-Type, Authorization...)
- **Тіло відповіді** (JSON рядок, HTML, бінарні дані)

## 🛠 Концепція на практиці
Ось три сценарії, що покривають 90% потреб:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('різні сценарії мокувань', () => {
  
  // 1. Симуляція успішного запиту
  test('успіх', async ({ page }) => {
    await page.route('**/api/data', route => route.fulfill({
      status: 200,
      body: JSON.stringify({ data: [1, 2, 3] }),
      contentType: 'application/json'
    }));
  });

  // 2. Симуляція серверної помилки — тест перевіряє, що UI впоратись з 500!
  test('помилка сервера', async ({ page }) => {
    await page.route('**/api/data', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    }));
    await page.goto('/dashboard');
    // Перевіряємо, що UI показує "Щось пішло не так"
    await expect(page.getByText('Помилка з'єднання')).toBeVisible();
  });

  // 3. Тимчасова затримка відповіді — тест перевіряє лоадер
  test('повільний сервер', async ({ page }) => {
    await page.route('**/api/data', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 секунди затримки!
      await route.fulfill({ status: 200, body: '{}' });
    });
    await page.goto('/dashboard');
    // Перевіряємо появу спінера (Loading...)
    await expect(page.locator('.loading-spinner')).toBeVisible();
  });
});
\`\`\`

---
### 🎯 Ваше завдання
Щоб відповісти на мережевий запит фейковими даними, використайте правильний метод об'єкту \`route\`.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('mock response', async ({ page }) => {\n  await page.route('**/api/data', route => {\n    // відповідайте фейковими даними\n    route.fulfill({ status: 200, body: '{}' });\n  });\n});",
        type: "code",
        options: [
            "route.fulfill({ body: ... })",
            "route.send({ data: ... })",
            "route.respond({ json: ... })",
            "route.mock({ response: ... })"
        ],
        correctAnswer: "route.fulfill({ body: ... })"
    },
    {
        title: "3.6 Custom Matchers: expect.extend() — Свої перевірки",
        description: `## ⚖️ Розширення Playwright власними матчерами

Вбудовані матчери Playwright дуже потужні: \`toBeVisible()\`, \`toHaveText()\`, \`toHaveURL()\`.
Але у кожному проекті є специфічна **бізнес-логіка**, яку незручно перевіряти стандартними засобами.

Наприклад:
- Ціна в діапазоні (1000–9999 грн)
- Email відповідає корпоративному стандарту (@company.com)
- Дата прийнятна (не пізніше ніж 30 днів від сьогодні)

Замість того, щоб писати захаращений код в кожному тесті, можна **одноразово** записати ці правила у вигляді **кастомного матчера** і потім використовувати їх як звичайний \`.toBe()\`.

## 🛠 Концепція на практиці
\`\`\`typescript
// Крок 1: Оголошуємо типи (TypeScript вимагає це)
import { expect } from '@playwright/test';

interface CustomMatchers {
  toBeWithinRange(min: number, max: number): void;
}
declare module '@playwright/test' {
  interface Matchers<R> extends CustomMatchers {}
}

// Крок 2: Реалізуємо матчер
expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => pass
        ? \`очікували, що \${received} НЕ буде в діапазоні [\${min}, \${max}]\`
        : \`очікували, що \${received} буде в діапазоні [\${min}, \${max}]\`
    };
  }
});

// Крок 3: Використовуємо в тестах — читається ідеально!
test('ціна в допустимому діапазоні', async ({ page }) => {
  const price = 5499;
  expect(price).toBeWithinRange(1000, 9999); // Власний матчер!
});
\`\`\`

---
### 🎯 Ваше завдання
Щоб зареєструвати нові кастомні матчери для глобального використання, який метод об'єкту \`expect\` слід викликати?
`,
        code: "import { expect } from '@playwright/test';\n\n// Зареєструйте власний матчер\n({\n  toBePositive(received: number) {\n    return { pass: received > 0, message: () => 'not positive' };\n  }\n});",
        type: "code",
        options: [
            "expect.extend({ ... })",
            "expect.addMatchers({ ... })",
            "expect.custom({ ... })",
            "expect.define({ ... })"
        ],
        correctAnswer: "expect.extend({ ... })"
    }
];
