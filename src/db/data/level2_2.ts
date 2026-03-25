export const level2Tasks_2 = [
    {
        title: "2.6 Явне очікування: waitForSelector",
        description: `## ⏳ Динамічні елементи та лоадери

У попередніх темах ми обговорювали автоочікування (Auto-waiting), коли Playwright чекає на видимість і клікабельність елемента **перед тим**, як щось з ним зробити. Або за допомогою \`toBeVisible()\`.

Але що робити, якщо вам потрібно навпаки — почекати, **поки щось зникне**? Або почекати на подію, яка не пов'язана з кліком?
Наприклад: ви натиснули кнопку "Оплатити", з'явився великий крутилка (спінер) на весь екран. Вам треба почекати, поки він зникне, перш ніж перевірити повідомлення. В цей момент ви не взаємодієте зі спінером, ви не клікаєте його. Вам просто потрібне повідомлення про те, що він пішов!

## 🛠 Концепція на практиці
Метод \`page.waitForSelector()\` (або його сучасний аналог з Locator) — це універсальний інструмент. У нього є потужний параметр \`state\`, який описує подію життєвого циклу елемента: \`visible\`, \`hidden\`, \`attached\`, \`detached\`.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('очікування лоадера', async ({ page }) => {
  // Натискаємо "Оплатити"
  await page.getByRole('button', { name: 'Оплатити' }).click();
  
  // Явне очікування: Чекаємо, поки лоадер ПЕРЕСТАНЕ бути видимим.
  // Максимальний час очікування — 5000 мс, але ми міняємо на 30 сек
  await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 30000 });
  
  // Тепер можна продовжувати, блок гарантовано зник
  await expect(page.locator('.success-message')).toBeVisible();
});
\`\`\`

## 💡 Порада замість \`.waitForSelector\`:
У найновіших версіях Playwright \`waitForSelector\` залишили для сумісності з Puppeteer. Найсучасніший підхід (The Playwright Way) — це використовувати Locator з методом \`.waitFor()\`.
\`await page.locator('.loading-spinner').waitFor({ state: 'hidden' });\`

---
### 🎯 Ваше завдання
Використовуючи метод \`waitForSelector\`, накажіть тесту затриматись і дочекатися, поки елемент із селектором \`.success-message\` стане видимим (за замовчуванням \`state: 'visible'\`).
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('wait event', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Зачекайте на появу `.success-message`\n  \n});",
        type: "code",
        options: [
            "await page.waitForSelector('.success-message')",
            "await page.wait('.success-message')",
            "await page.pause('.success-message')",
            "await page.timeout('.success-message')"
        ],
        correctAnswer: "await page.waitForSelector('.success-message')"
    },
    {
        title: "2.7 beforeEach: Чистота тестів і Хуки",
        description: `## 🧹 Ніхто не любить дублювати код

Якщо у вас є 5 тестів, які перевіряють різні сторінки налаштувань профілю користувача:
1. Завантажити фото
2. Змінити пароль
3. Змінити ім'я

У кожному з цих трьох тестів першими рядками будуть дії: "відкрий \`/login\`" -> "введи логін" -> "введи пароль" -> "натисни вхід". 
По-перше, ви порушуєте головне програмістське правило **DRY** (Don't Repeat Yourself). По-друге, що якщо логін зламається? У вас впадуть всі три тести, і щоб полагодити логіку логіну (наприклад, змінився локатор кнопки), треба буде пройтися по всім трьом тестам.

## 🛠 Концепція на практиці
Для цього використовують **Тестові Хуки (Test Hooks)** — спеціальні блоки коду, які Playwright запускає автоматично.

Найпопулярніший хук — це \`beforeEach\`. Весь код всередині нього буде виконано рівно за одну мить ПЕРЕД початком **кожного** тесту у вашому файлі.

\`\`\`typescript
import { test, expect } from '@playwright/test';

// Цей блок виконається 3 рази (бо внизу 3 тести)
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('user@app.com');
  await page.getByPlaceholder('Password').fill('12345');
  await page.getByRole('button', { name: 'Log In' }).click();
  // Можемо навіть чекати на головну сторінку тут!
});

test('завантаження фото', async ({ page }) => {
  // О диво! Ми вже залогінені, можемо зразу тестувати фото!
  await page.getByText('Upload Photo').click();
});

test('зміна імені', async ({ page }) => {
  // І тут ми теж вже залогінені, в чистому новому браузері!
});
\`\`\`

## 💡 Best Practices:
Існує ще \`beforeAll\`, який виконується **тільки один раз** для всіх тестів у файлі. Але будьте з ним дуже обережні! \`beforeAll\` не створює нову порожню сторінку (бо сторінки ізолюються на рівні тесту), а ділить одну сесію (або створює базу даних). Найкраще рішення для UI тестів — завжди користуватись \`beforeEach\`.

---
### 🎯 Ваше завдання
Створіть хук життєвого циклу, який відпрацьовуватиме перед кожним тестом, щоб зменшити дублювання навігації.
`,
        code: "import { test, expect } from '@playwright/test';\n\n// Оголосіть хук, що спрацьовує перед кожним тестом\n  async ({ page }) => {\n    await page.goto('https://finmore.netlify.app/');\n  }\n);",
        type: "code",
        options: [
            "test.beforeEach",
            "test.beforeAll",
            "test.setup",
            "test.init"
        ],
        correctAnswer: "test.beforeEach"
    },
    {
        title: "2.8 Trial: Пробна дія без наслідків",
        description: `## 🧪 Як перевірити, чи кнопка клікабельна, НЕ натискаючи її?

Уявіть ситуацію: є кнопка "Видалити всі дані користувача". Якщо ми натиснемо на неї випадково у робочому середовищі, ми зіпсуємо дані (навіть якщо це staging). Але нам потрібно якось перевірити з боку логіки тестів, чи доступна вона користувачеві (чи немає на ній прозорого DIV'у, що перекриває і забороняє клік).

Звичайна перевірка \`.isVisible()\` тут не допоможе — кнопка може бути видима, але "перекрита".
Ось де магія Playwright сяє — це функція **Trial (Випробування)**.

## 🛠 Концепція на практиці
Використовуючи опцію \`{ trial: true }\`, Playwright виконує весь цикл Actionability Checks:
1. Знаходить елемент у DOM;
2. Скролить його у видиму зону екрана;
3. Впевняється, що він промальований (CSS visible / opacity);
4. Симулює подію Hover (відсутність перекриваючого \`z-index\` слоя).
**Але в останню нано-секунду Playwright НЕ надсилає браузеру подію миші (ClickEvent)!**

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('пробна дія: перевірка клікабельності ядерки', async ({ page }) => {
  const nukeButton = page.getByRole('button', { name: 'Запуск ракети' });
  
  // Якщо кнопка перекрита, цей метод кине виключення (Exception) і тест впаде.
  // Якщо з кнопкою все гаразд — метод пройде мовчки.
  await nukeButton.click({ trial: true });
});
\`\`\`

## 💡 Для чого ще це потрібно?
Це також геніальний спосіб "прикрутити" авто-скролінг. Викликавши \`.click({ trial: true })\`, ви змушуєте сторінку елегантно прокрутитись до цього елементу без жодних кліків і \`scrollIntoViewIfNeeded\`.

---
### 🎯 Ваше завдання
Переконайтеся, що небезпечна кнопка реально клікабельна, задавши об'єкт конфігурації \`trial\`!
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('trial click', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  const dangerBtn = page.getByRole('button', { name: 'Delete All' });\n  \n  // Виконайте перевірку на клік без самої дії\n  await dangerBtn.click( );\n});",
        type: "code",
        options: [
            "{ trial: true }",
            "{ test: true }",
            "{ dryRun: true }",
            "{ check: true }"
        ],
        correctAnswer: "{ trial: true }"
    },
    {
        title: "2.9 test.step: Категоризація та звіти",
        description: `## 🪜 Кроки (Steps) — ваш ключ до красивих звітів

Ваш тест може містити до 50 рядків коду. В ньому може бути заповнення масивної анкети реєстрації.
Якщо тест впаде на 38-му рядку, у стандартному звіті ви просто побачите червоний хрестик навпроти довгої назви тесту: "Реєстрація і купівля успішні ❌". Вам доведеться читати логи помилок, щоб зрозуміти, ЩО САМЕ пішло не так: реєстрація, пошук товару чи оплата?

Playwright має вбудовану систему логування — **\`test.step()\`**.

## 🛠 Концепція на практиці
Ви просто загортаєте блоки коду в окремі асинхронні калбеки. Кожен такий крок матиме гарну розворотну "акордеонну" структуру у звіті.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('тестування повного флоу магазину', async ({ page }) => {
  // Крок 1
  await test.step('Авторизація', async () => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('u@u.com');
    await page.getByPlaceholder('Pass').fill('123');
    await page.getByRole('button').click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Крок 2
  await test.step('Додавання товару в кошик', async () => {
    await page.goto('/products');
    await page.getByText('MacBook Pro').click();
    await page.getByRole('button', { name: 'Buy' }).click();
  });
});
\`\`\`

## 💡 Чому саме .step(), а не коментарі // ?
Усі ` + "`" + "//" + "`" + ` коментарі зникають у момент запуску коду. Спеціальний HTML-Report Playwright'у (або Allure Report) нічого не знає про коментарі. А от \`test.step()\` напряму репортить назву кроку у файл логів і збирає час його виконання (наприклад: \`Авторизація: 1.2s\`). Якщо тест впаде на 2 кроці, перший крок буде позначений зеленою галочкою. Ви зекономите години часу під час розслідування!

---
### 🎯 Ваше завдання
Огорніть блок дій всередині тесту в формальний "крок" Playwright з назвою **'крок 1'**.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('steps demo', async ({ page }) => {\n  // Викликайте функцію формування кроку\n  \n});",
        type: "code",
        options: [
            "await test.step('назва', async () => { ... })",
            "await test.describe('назва', async () => { ... })",
            "await test.run('назва', async () => { ... })",
            "await step('назва', async () => { ... })"
        ],
        correctAnswer: "await test.step('назва', async () => { ... })"
    },
    {
        title: "2.10 Screenshots: Автоматичні докази багів",
        description: `## 📸 Картинка варта тисячі рядків логів

Роботи швидкі і потужні, але вони іноді німі: вони падають і кидають помилки на кшталт "Locator Timeout: expected visible". Ви відкриваєте сайт вручну, щоб перевірити, а там все працює! Ви дивуєтесь. Знайома історія "flaky" (нестабільних) тестів.

У такі моменти врятувати ситуацію може лише одне: зробити **скріншот** у той самий момент, коли бот дивиться на сторінку! Можливо, виявиться, що сайт видав "Сервер тимчасово недоступний 503", або ж верстка розвалилась і кнопка втекла за межі екрана.

## 🛠 Концепція на практиці
Додайте збереження знімка екрана будь-де у скрипті.
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('зберігаємо зображення після успішної операції', async ({ page }) => {
  await page.goto('https://makeup.com.ua/');
  
  // 1. Повний скріншот сторінки, що зберігається в файл:
  await page.screenshot({ path: 'makeup-home.png' });
  
  // 2. Довгий скріншот (з автоматичним прокручуванням до низу!):
  await page.screenshot({ path: 'full-page.png', fullPage: true });

  // 3. Знімок КОНКРЕТНОГО елемента екрану (докази цілісності кнопки):
  const searchBtn = page.locator('#search-btn');
  await searchBtn.screenshot({ path: 'search.png' });
});
\`\`\`

## 💡 Best Practices:
Ви дуже рідко будете писати \`page.screenshot()\` самостійно в тестах. Натомість, у \`playwright.config.ts\` ви ставите налаштування \`use: { screenshot: 'only-on-failure' }\`. Тоді скріншоти робитимуться магічно, АВТОМАТИЧНО і ТІЛЬКИ тоді, коли тест "впаде" (завершиться з помилкою), і будуть автоматично приєднані до вашого звіту (HTML-Report). Це ідеальний підхід Senior-QA.

---
### 🎯 Ваше завдання
Перед вами пустий тест. Накажіть об'єкту \`page\` "заскрінити" поточний стан екрану.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('capture screen', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Зробіть скріншот всієї сторінки\n  \n});",
        type: "code",
        options: [
            "await page.screenshot()",
            "await page.takeScreenshot()",
            "await page.snap()",
            "await page.capture()"
        ],
        correctAnswer: "await page.screenshot()"
    }
];
