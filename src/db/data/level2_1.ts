export const level2Tasks_1 = [
    {
        title: "2.1 Page Object Model (POM): Оголошення властивостей",
        description: `## 🏗️ Архітектура тестів: Page Object Model

Уявіть, що ви написали 100 тестів. В усіх них ви використовували локатор кнопки входу: \`page.locator('.btn-login')\`. Раптом розробники змінюють клас на \`.login-button\`. Що тепер? Вам доведеться йти в усі 100 файлів і виправляти цей локатор вручну. Це жах для підтримки!

**Page Object Model (POM)** — це найпопулярніший патерн у світі автоматизації. Його суть полягає в тому, що кожна сторінка вашого сайту (або її великий компонент) представляється у вигляді TypeScript класу.

## 🛠 Концепція на практиці
Перший крок у створенні POM — це перенести всі локатори всередину класу як його властивості (properties). Ми робимо їх \`readonly\` (тільки для читання), щоб випадково не перезаписати в тестах.

\`\`\`typescript
import { Page, Locator } from '@playwright/test';

// 1. Створюємо клас сторінки
export class LoginPage {
  // 2. Оголошуємо властивості
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  // 3. Ініціалізуємо їх через конструктор
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.submitButton = page.getByRole('button', { name: 'Увійти' });
  }
}
\`\`\`

## 💡 Чому це вигідно?
Тепер локатор \`submitButton\` описаний **лише один раз** у цьому файлі. Якщо розробники змінять кнопку іншим текстом, ви зміните код тільки тут, і всі 100 тестів знову запрацюють!

---
### 🎯 Ваше завдання
Вам надано структуру класу \`LoginPage\`. Оголосіть у ньому публічну властивість \`page\` з типом \`Page\` та ініціалізуйте її всередині конструктора.
`,
        code: "import { test, expect, Page } from '@playwright/test';\n\nclass LoginPage {\n  // Оголосіть readonly властивість page\n  \n  constructor(page: Page) {\n    // Проініціалізуйте її\n    this.page = page;\n  }\n}",
        type: "code",
        options: [
            "readonly page: Page;",
            "public page: any;",
            "var page = new Page();",
            "const page: Page;"
        ],
        correctAnswer: "readonly page: Page;"
    },
    {
        title: "2.2 POM: Логічні методи (Дії)",
        description: `## 🧩 Другий рівень POM: Інкапсуляція дій

Після того, як ми зберегли всі локатори як властивості класу, час зробити тести ще чистішими.
**Тест не повинен знати, ЯК саме відбувається логін**. Тест — це сценарій (Arrange -> Act -> Assert). Йому байдуже, скільки там полів чи які на них селектори. Він хоче просто сказати: "Спробуй залогінитись з такими даними".

Для цього ми додаємо в наш клас POM **логічні методи**.

## 🛠 Концепція на практиці
Замість того, щоб у самому тесті писати \`fill()\`, \`click()\`, і т.д., ми ховаємо цю реалізацію всередині класу сторінки.

\`\`\`typescript
export class LoginPage {
  // ... (конструктор з попереднього уроку)

  // Створюємо бізнес-метод
  async loginAsUser(email: string, pass: string) {
    // Тут іде технічна реалізація
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}

// ---------------------------
// А ось як тепер виглядає ТЕСТ:
// ---------------------------
test('успішний логін', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Тест стає кришталево чистим і читається як звичайна англійська!
  await loginPage.loginAsUser('test@mail.com', '123456');
  
  await expect(page).toHaveTitle('Dashboard');
});
\`\`\`

## 💡 Професійна порада:
Методи сторінок не повинні містити Assertions (\`expect\`). Клас (Page Object) тільки взаємодіє зі сторінкою. А тестує і приймає рішення вже сам блок \`test()\`. Це правило називається Separation of Concerns (Розділення відповідальності).

---
### 🎯 Ваше завдання
Використовуючи попередньо створений екземпляр класу \`loginPage\`, виконайте метод входу (уявіть, що метод називається \`login()\`).
`,
        code: "import { test, expect, Page } from '@playwright/test';\n\nclass LoginPage { /* ... */ }\n\ntest('pom logic', async ({ page }) => {\n  const loginPage = new LoginPage(page);\n  // Викличте метод логіну\n  \n});",
        type: "code",
        options: [
            "await loginPage.login()",
            "loginPage.login()",
            "await page.login()",
            "await LoginPage.login()"
        ],
        correctAnswer: "await loginPage.login()"
    },
    {
        title: "2.3 Організація коду: Змінні середовища та конфіги",
        description: `## 🚫 Хардкод URL — це зло

Уявіть автотест, в якому написано \`await page.goto('https://staging-v2.mycompany.com/login')\`.
Сьогодні ви компанія тестує цю середу (staging), а завтра вам скажуть: "Запусти всі наявні тести на production сервері!". Що ви будете робити? Змінювати сотні файлів?

**Ніколи не хардкодьте базові посилання (Base URLs) або паролі в текстах тестів.**

## 🛠 Концепція на практиці
1. **Змінні середовища (.env файли):** зберігають чутливі дані (паролі) та URL середовища. 
2. **Конфіг Playwright (\`playwright.config.ts\`):** дозволяє визначити \`baseURL\`. 

\`\`\`typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Тепер це базове посилання
    baseURL: process.env.STAGING === '1' ? 'https://stage.com' : 'https://prod.com',
  },
});

// ---------------------------
// user.spec.ts
// ---------------------------
test('перехід на профіль', async ({ page }) => {
  // Нам більше не треба писати величезний домен! 
  // Playwright автоматично підставить його спереду.
  await page.goto('/profile');
});
\`\`\`

## 💡 Корисна порада:
Для збереження інших незмінних речей (як стандартні таймаути чи системні повідомлення) створюйте окремий файл \`constants.ts\` і імпортуйте їх: \`import { ERROR_MESSAGES } from '../config/constants'\`.

---
### 🎯 Ваше завдання
Вам треба зберегти константу з базовим URL у вашому файлі. Створіть змінну (константу), що не підлягає зміні, і назвіть її \`BASE_URL\`.
`,
        code: "import { test, expect } from '@playwright/test';\n\n// Створіть константу BASE_URL з адресою сайту\n\n\ntest('візит', async ({ page }) => {\n  // await page.goto(BASE_URL);\n});",
        type: "code",
        options: [
            "const BASE_URL = '...'",
            "var BASE_URL = '...'",
            "let BASE_URL = '...'",
            "url = '...'"
        ],
        correctAnswer: "const BASE_URL = '...'"
    },
    {
        title: "2.4 Унікалізація тестових даних",
        description: `## 🌈 Уникаємо конфліктів у базі даних (Flaky Tests)

Одна з найпоширеніших проблем у початківців:
1. Ви пишете тест на реєстрацію нового користувача: \`email: qa@test.com\`.
2. Запускаєте тест. Він працює ідеально! Створено нового юзера.
3. Запускаєте його **ще раз**. Тест падає з помилкою: "Користувач з таким email вже існує".

Ваші тести мають бути **незалежними та повторюваними (idempotent)**. Кожен запуск має генерувати унікальні тестові дані.

## 🛠 Концепція на практиці
Є кілька способів створити унікальний рядок. Найпростіший з них, що вбудований у сам JavaScript — це використання об'єкта \`Date.now()\`, який повертає поточний час у мілісекундах. Оскільки мілісекунди постійно йдуть вперед, два однакові email не створяться ніколи.

\`\`\`typescript
import { test, expect } from '@playwright/test';
// Для більш просунутих генерацій можна використовувати бібліотеки (наприклад, Faker.js)
// import { faker } from '@faker-js/faker';

test('реєстрація з унікальним email', async ({ page }) => {
  // Генеруємо email прямо в пам'яті:
  // Приклад результату: auto_1694285739124@test.com
  const uniqueEmail = \`auto_\${Date.now()}@test.com\`;
  
  // Тепер без страху використовуємо його в тесті
  await page.getByPlaceholder('Email').fill(uniqueEmail);
  
  // А якщо використовуєте Faker:
  // const randomEmail = faker.internet.email();
});
\`\`\`

## 💡 Best Practices:
* Додавайте префікси (наприклад, \`auto_\` або \`test_\` до згенерованих даних). Якщо вам колись знадобиться почистити бойову або тестову базу даних, ви легко знайдете весь "сміттєвий" тестовий контент за цим префіксом і зможете його безпечно видалити.

---
### 🎯 Ваше завдання
Який з наведених інструментів чи методів можна успішно використовувати для постійної генерації унікальних випадкових значень під час тестів?
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('dynamic data', async ({ page }) => {\n  // Як краще згенерувати унікальні дані?\n});",
        type: "code",
        options: [
            "Date.now()",
            "Math.random()",
            "faker.email()",
            "Все вищезгадане"
        ],
        correctAnswer: "Все вищезгадане"
    },
    {
        title: "2.5 Примусова дія: Відключення перевірок через Force",
        description: `## 🧱 Коли Playwright занадто "розумний"

Як ми вчили в попередніх рівнях, метод \`.click()\` містить серію жорстких перевірок Actionability (видимість, клікабельність, відсутність перекриття вікнами).

Але іноді верстальники роблять страшні речі. Наприклад, нативний невидимий інпут від файла \`<input type="file">\` повністю закритий зверху красивим круглим DIV слоєм (кнопка завантаження аватару).
Для користувача-людини цей DIV ловить клік і передає інпуту. Але для Playwright кнопка 'Upload' формально "перекрита" цим DIV "незаконно". Він видасть помилку: \`Element is intercepted by <div>\`.

## 🛠 Концепція на практиці
Якщо ви на 100% впевнені, що знаєте, що робите, ви можете наказати Playwright **проігнорувати всі перевірки клікабельності** і просто "вдарити" в математичний центр елемента.
Це робиться за допомогою прапорця \`{ force: true }\`.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('клік по перекритому елементу', async ({ page }) => {
  const hiddenUploadField = page.locator('input#avatar-upload');
  
  // Якщо виконаємо просто .click(), тест впаде.
  // Тому ми використовуємо форсоване натискання:
  await hiddenUploadField.click({ force: true });
});
\`\`\`

## 💡 Попередження (Danger Zone) ⚠️:
**Ніколи не використовуйте \`force: true\` як спосіб пофіксити "флакаючий" (нестабільний) тест!** 
Якщо тест падає через те, що елемент не встиг з'явитись, або на долю секунди закривається лоадером — то \`force: true\` приховає реальний баг "повільного сайту", з яким зіткнувся б живий користувач! Живий користувач не має вбудованої функції \`force: true\` у своїй мишці. Застосовуйте це лише тоді, коли це виправдано архітектурою верстки.

---
### 🎯 Ваше завдання
Клікніть по елементу \`button\`, використовуючи об'єкт конфігурації з параметром примусового, форсованого виконання дії.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('forced click', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть кнопку примусово\n  \n});",
        type: "code",
        options: [
            "{ force: true }",
            "{ hard: true }",
            "{ click: 'forced' }",
            "{ ignore: true }"
        ],
        correctAnswer: "{ force: true }"
    }
];
