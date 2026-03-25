export const level3Tasks_2 = [
    {
        title: "3.7 iFrames: frameLocator — Елементи в «сторінці всередині сторінки»",
        description: `## 🖼️ iFrame: Острів з іншими правилами

\`<iframe>\` — це HTML-тег, що вбудовує одну веб-сторінку (або окремий документ) всередину іншої. Класичні приклади:
- Платіжні форми Stripe / PayPal / LiqPay (вони свідомо ізолюють поле введення картки в iframe з міркувань безпеки)
- Google reCaptcha
- Embedded відео з YouTube
- Чат-боти (Intercom, Zendesk тощо)

**Головна проблема із стандартними Playwright-локаторами**: метод \`page.getByRole()\` та \`page.locator()\` за замовчуванням **шукають елементи тільки у головному документі**. Вони навіть не заглядають всередину iframe. Вони для них "невидимі".

## 🛠 Концепція на практиці
Для роботи з iframe Playwright надає спеціальний метод \`page.frameLocator()\`. Він повертає об'єкт-посередник, всі локатори якого вже шукають **всередині** вказаного фрейму.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('платіжна форма у iframe', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');
  
  // 1. Вказуємо на iframe за його CSS селектором або ID
  const iframeLocator = page.frameLocator('#mce_0_ifr');
  
  // 2. Тепер шукаємо елемент ВСЕРЕДИНІ цього фрейму
  // (як ніби це звичайна сторінка з власними локаторами)
  const iframeBody = iframeLocator.locator('body');
  
  await iframeBody.click();
  await iframeBody.type('Привіт з iFrame!');
  
  // Перевіряємо текст, що опинився всередині iframe:
  await expect(iframeBody).toContainText('Привіт з iFrame!');
});
\`\`\`

## 💡 Вкладені iframe:
Можна ланцюгово вкладати frameLocator: \`page.frameLocator('#outer').frameLocator('#inner').locator('button')\` — ідеально для складних сторінок, де iframe знаходиться всередині іншого iframe.

---
### 🎯 Ваше завдання
Знайдіть правильний метод для отримання "контексту" певного iframe перед подальшою роботою з його елементами.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('iframe element', async ({ page }) => {\n  await page.goto('https://the-internet.herokuapp.com/iframe');\n  \n  // отримайте контекст iframe\n  const frame = page.frameLocator('#mce_0_ifr');\n  await frame.locator('body').click();\n});",
        type: "code",
        options: [
            "page.frameLocator('#my-frame')",
            "page.locator('#my-frame').frame()",
            "page.frame('#my-frame')",
            "page.getFrame('#my-frame')"
        ],
        correctAnswer: "page.frameLocator('#my-frame')"
    },
    {
        title: "3.8 Dialogs: Обробка системних Alert / Confirm / Prompt",
        description: `## 🗨️ Нативні браузерні діалоги — Пастка для автотестів!

Коли JavaScript-код на сторінці викликає \`window.alert("Ти впевнений?")\`, браузер повністю зупиняє виконання і чекає, доки **реальна людина** натисне "OK". А якщо на сторінці стоїть \`confirm()\`? — Тоді браузер ще й чекає клік по "Скасувати" або "Підтвердити".

Якщо ваш Playwright автотест не обробить такий діалог, він **зависне** і впаде з таймаутом. Це дуже поширена помилка новачків.

## 🛠 Концепція на практиці
Рішення: підписатися на подію \`'dialog'\` **ДО** того, як натискаєте кнопку, яка цей діалог викликає. Playwright перехопить діалог і автоматично оброблятиме його.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('підтвердження видалення (confirm dialog)', async ({ page }) => {
  await page.goto('/settings');
  
  // 1. СПОЧАТКУ підписуємось на обробник діалогів (event listener)
  // Callback отримає об'єкт 'dialog'
  page.on('dialog', async dialog => {
    // dialog.type() --> 'alert', 'confirm', 'prompt', 'beforeunload'
    console.log('Тип діалогу:', dialog.type());       // confirm
    console.log('Текст діалогу:', dialog.message());  // "Ви впевнені? Дані буде видалено!"
    
    // Для 'confirm' -> dialog.accept() або dialog.dismiss()
    // Для 'prompt'  -> dialog.accept("введений текст")
    await dialog.accept(); // Натискаємо "OK" / "Підтвердити"
  });
  
  // 2. ПОТІМ натискаємо кнопку, що викликає діалог
  await page.getByRole('button', { name: 'Видалити акаунт' }).click();
  
  // Тепер перевіряємо UI після підтвердження
  await expect(page.getByText('Акаунт видалено')).toBeVisible();
});
\`\`\`

## 💡 Важлива деталь:
Переконайтесь, що реєструєте \`page.on('dialog', ...)\` **до** дії, що викликає діалог, а не після! Інакше діалог з'явиться до того, як обробник буде зареєстрований.

---
### 🎯 Ваше завдання
Зареєструйте обробник системного dialog-вікна (alert/confirm), використовуючи правильну назву події.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('handle dialog', async ({ page }) => {\n  // підпишіться на подію діалогу\n  page.on( , dialog => dialog.accept());\n  \n  await page.getByRole('button', { name: 'Delete' }).click();\n});",
        type: "code",
        options: [
            "page.on('dialog', dialog => ...)",
            "page.on('alert', alert => ...)",
            "page.handleDialog(dialog => ...)",
            "page.waitForDialog()"
        ],
        correctAnswer: "page.on('dialog', dialog => ...)"
    },
    {
        title: "3.9 expect.poll(): Асинхронне поллінгове очікування",
        description: `## 🔄 Polling: Коли елемент поза DOM (backend jobs, emails, webhooks)

Деякі операції в реальних системах виконуються **асинхронно на бекенді**:
- Відправка email підтвердження (може займати 2-10 секунд)
- Генерація PDF-звіту на сервері
- Обробка платежу Stripe
- Завершення фонового job у черзі (RabbitMQ, Celery...)

У DOM цих змін може взагалі не бути. Як тоді тест може дочекатися, що це сталося?

Стандартний \`expect(...).toBeVisible()\` не допоможе — він перевіряє DOM.
\`page.waitForSelector()\` — теж ні, якщо немає DOM-елементу для очікування.

**\`expect.poll()\`** — це ваш рятівний круг. Він повторно викликає async-функцію (наприклад, API-запит до бекенду) через визначені інтервали, поки відповідь не задовольнить ваше твердження.

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('перевірка асинхронної обробки замовлення', async ({ request }) => {
  // 1. Ініціюємо замовлення через API
  const order = await request.post('/api/orders', {
    data: { productId: 42, quantity: 1 }
  });
  const { orderId } = await order.json();
  
  // 2. Бекенд обробить його за кілька секунд. Чекаємо!
  await expect.poll(
    async () => {
      // Ця функція ПОВТОРЮВАТИМЕТЬСЯ кожні 3000мс (за замовчуванням)
      const statusResponse = await request.get(\`/api/orders/\${orderId}\`);
      const status = await statusResponse.json();
      return status.state; // Повертаємо поточний статус
    },
    {
      timeout: 30000,  // Чекаємо максимум 30 секунд
      intervals: [1000, 2000, 3000], // Перші перевірки частіші
      message: 'Замовлення досі в обробці...'
    }
  ).toBe('completed'); // Очікуємо цей рядок у відповіді
});
\`\`\`

---
### 🎯 Ваше завдання
Для циклічної перевірки значень, що з'являються асинхронно (наприклад, зі стороннього API), який метод об'єкту \`expect\` правильно використовувати?
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('async job checking', async ({ request }) => {\n  // виконайте поллінговий запит\n  await expect.poll(\n    async () => {\n      const r = await request.get('/api/status');\n      return (await r.json()).status;\n    }\n  ).toBe('done');\n});",
        type: "code",
        options: [
            "await expect.poll(async () => ...)",
            "await expect.wait(async () => ...)",
            "await page.poll(async () => ...)",
            "await request.poll(async () => ...)"
        ],
        correctAnswer: "await expect.poll(async () => ...)"
    },
    {
        title: "3.10 File Downloads: Перехоплення і перевірка файлів",
        description: `## 📥 Тестування завантаження файлів

Кнопка "Завантажити звіт" — один з найпоширеніших UI елементів, що є невидимим для класичних тестів. Коли ви тиснете на неї, браузер ініціює завантаження файлу і поміщає його у вашу папку "Завантаження". Та як автотест перевірить, що файл:
1. Взагалі завантажився (а не видав 404)?
2. Має правильне ім'я?
3. Не є порожнім?
4. Містить правильні дані (CSV, JSON, PDF)?

Playwright надає елегантне рішення через подію \`'download'\`.

## 🛠 Концепція на практиці
Аналогічно до нових вкладок, ми використовуємо \`Promise.all\` для паралельного очікування події та кліку по trigger-кнопці.

\`\`\`typescript
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test('завантаження CSV-звіту', async ({ page }) => {
  await page.goto('/reports');
  
  // 1. Паралельно: починаємо чекати подію 'download' і клікаємо кнопку
  const [download] = await Promise.all([
    page.waitForEvent('download'), // Чекаємо на подію завантаження
    page.getByRole('button', { name: 'Download Report' }).click()
  ]);
  
  // 2. Об'єкт 'download' — це хендлер завантаження
  // Можна зберегти файл за конкретним шляхом
  const downloadPath = path.join('/tmp', download.suggestedFilename());
  await download.saveAs(downloadPath);
  
  // 3. Перевіряємо мета-інформацію
  expect(download.suggestedFilename()).toContain('.csv'); // Перевірка розширення
  
  // 4. Перевіряємо вміст файлу (опціонально)
  const fileContent = fs.readFileSync(downloadPath, 'utf-8');
  expect(fileContent).toContain('ID,Name,Date'); // Очікуємо заголовок CSV
});
\`\`\`

---
### 🎯 Ваше завдання
Який метод об'єкту \`page\` дозволяє очікувати на появу та перехоплення події завантаження файлу?
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('download file', async ({ page }) => {\n  await page.goto('https://the-internet.herokuapp.com/download');\n\n  const [download] = await Promise.all([\n    // перехопіть подію завантаження файлу\n    \n    page.getByText('some-file.txt').click()\n  ]);\n  \n  console.log('Downloaded:', download.suggestedFilename());\n});",
        type: "code",
        options: [
            "page.waitForEvent('download')",
            "page.waitForDownload()",
            "download.waitFor('complete')",
            "page.on('download', fn)"
        ],
        correctAnswer: "page.waitForEvent('download')"
    },
    {
        title: "3.11 File Upload: Завантаження файлів на сервер",
        description: `## 📤 Upload: setInputFiles() vs filechooser

Завантаження файлів на сервер — це специфічна операція, яка не піддається стандартним UI-кліком. Спробуйте звичайний \`.click()\` по кнопці вибору файлу — відкриється системний file picker (providerDialog), і Playwright **не може взаємодіяти** з такими системними вікнами ОС.

Playwright вирішує цю проблему двома способами.

## 🛠 Концепція на практиці

**Спосіб 1 (Прямий — рекомендований):** \`.setInputFiles()\`
Метод прямо встановлює файл до input[type="file"], обходячи системний діалог:
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('завантаження аватару (прямий метод)', async ({ page }) => {
  await page.goto('/profile');
  
  // Знаходимо INPUT (він може бути прихований за кнопкою!)
  // Якщо hidden — використовуємо { force: true }
  await page.locator('input[type="file"]').setInputFiles('/path/to/avatar.jpg');
  
  await page.getByRole('button', { name: 'Зберегти' }).click();
  await expect(page.getByAltText('avatar')).toBeVisible();
});
\`\`\`

**Спосіб 2 (Через interceptor):** для кнопок, що відкривають picker:
\`\`\`typescript
test('завантаження через file picker', async ({ page }) => {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'), // Чекаємо на відкриття picker
    page.getByRole('button', { name: 'Upload' }).click() // Клік відкриває picker
  ]);
  
  // Вказуємо файл через об'єкт fileChooser
  await fileChooser.setFiles('/path/to/document.pdf');
});
\`\`\`

---
### 🎯 Ваше завдання
Щоб перехопити системний файловий picker і встановити файл програмно, який об'єкт потрібно очікувати від події \`page\`?
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('file upload via picker', async ({ page }) => {\n  const [fileChooser] = await Promise.all([\n    // яку подію очікувати?\n    page.waitForEvent('filechooser'),\n    page.getByRole('button', { name: 'Upload' }).click()\n  ]);\n  await fileChooser.setFiles('./test.pdf');\n});",
        type: "code",
        options: [
            "'filechooser'",
            "'upload'",
            "'fileopen'",
            "'filedialog'"
        ],
        correctAnswer: "'filechooser'"
    },
    {
        title: "3.12 Visual Testing: Знімкове тестування (Snapshot Testing)",
        description: `## 👁️ Ловимо регресії у зовнішньому вигляді (UI Regression)

Уявіть, що розробник випадково замінив кольорову схему кнопки: з фірмового синього на яскраво-жовтий. Або вирівнювання шапки зломилось.
Ваші автотести перевіряють **функціонал** (чи кнопка клікабельна, чи текст правильний).
Але хто перевіряє **вигляд**?

**Visual / Screenshot Testing (Знімкове тестування)** — це порівняння **пікселів** поточного скріншоту з **еталонним знімком**. Якщо хоча б один піксель відрізняється, Playwright вважає тест провальним і позначає різницю на картинці.

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('UI зовнішній вигляд кнопки', async ({ page }) => {
  await page.goto('/home');
  
  const button = page.getByRole('button', { name: 'Замовити' });
  
  // 1. ПЕРШИЙ запуск: Playwright збереже snapshot у папку '__snapshots__'
  //    як еталон. Тест ЗАВЖДИ пройде першого разу.
  await expect(button).toHaveScreenshot('order-button.png');
  
  // 2. НАСТУПНІ запуски: Playwright порівнює з тим знімком.
  //    Якщо є відмінності -> FAIL + diff-картинка з виділеними відмінностями!
  
  // Можна також знімати всю сторінку цілком:
  await expect(page).toHaveScreenshot('full-page.png', {
    fullPage: true,
    maxDiffPixels: 50 // Допускаємо до 50 різних пікселів (для антиаліасінгу)
  });
});
\`\`\`

## 💡 Практична порада:
Щоб оновити еталонні знімки (коли, наприклад, вийшов новий дизайн), запускайте:
\`npx playwright test --update-snapshots\`

---
### 🎯 Ваше завдання
Яка функція Playwright виконує піксель-у-піксель порівняння з попередньо збереженим еталоном та генерує "diff"-зображення при відхиленні?
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('visual check', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  \n  // порівняйте зовнішній вигляд сторінки з еталоном\n  await expect(page)  ('homepage.png');\n});",
        type: "code",
        options: [
            ".toHaveScreenshot('name.png')",
            ".toMatchScreenshot('name.png')",
            ".toBeVisuallyEqual('name.png')",
            ".screenshot('name.png')"
        ],
        correctAnswer: ".toHaveScreenshot('name.png')"
    },
    {
        title: "3.13 Fixtures: Кастомні фікстури — Розширення тестового контексту",
        description: `## 🔌 Fixtures (Фікстури): Повторне використання контексту між тестами

До цього моменту ми використовували вбудовані фікстури Playwright: \`{ page }\`, \`{ request }\`, \`{ context }\`. Але що, якщо ваш проект має специфічні потреби? Наприклад:
- Уже авторизований \`page\` під конкретним роллю
- Готовий об'єкт Page Object Model (LoginPage, CheckoutPage)
- Тестова база даних, зачищена перед кожним тестом

**Кастомна фікстура** — це спеціальна функція, яку ви реєструєте один раз і потім можете "вставляти" у будь-який тест через деструктуризацію, точно так само, як вбудовані \`{ page }\`.

## 🛠 Концепція на практиці
\`\`\`typescript
// fixtures/index.ts
import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

// Оголошуємо тип наших фікстур
type MyFixtures = {
  loginPage: LoginPage;           // POM для сторінки логіну
  authenticatedPage: Page;        // Page вже залогіненого адміна
};

// Розширюємо стандартний 'test' нашими фікстурами
export const test = base.extend<MyFixtures>({
  // 'loginPage' — автоматично створюється для кожного тесту
  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await use(lp); // Передаємо у тест. Тест використовує і повертає управління.
    // Тут можна додати teardown-логіку після тесту
  },
  
  // 'authenticatedPage' — логінимось і передаємо вже готову сторінку
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@app.com');
    await page.fill('#pass', '123456');
    await page.click('button[type=submit]');
    await use(page); // Тест отримає page вже залогіненим!
  }
});

export { expect };
\`\`\`
Тепер у тестах:
\`\`\`typescript
// tests/dashboard.spec.ts
import { test, expect } from '../fixtures'; // Наш кастомний test, не стандартний!

test('dashboard відображається для адміна', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByRole('heading')).toHaveText('Admin Dashboard');
});
\`\`\`

---
### 🎯 Ваше завдання
Щоб розширити стандартну фікстуру Playwright власними значеннями, який метод слід викликати на об'єкті \`test\`?
`,
        code: "import { test as base, expect } from '@playwright/test';\n\n// Розширте test власними фікстурами\nexport const test = base. ({\n  myValue: async ({}, use) => {\n    await use(42);\n  }\n});",
        type: "code",
        options: [
            "base.extend({ ... })",
            "base.add({ ... })",
            "base.fixture({ ... })",
            "base.inject({ ... })"
        ],
        correctAnswer: "base.extend({ ... })"
    }
];
