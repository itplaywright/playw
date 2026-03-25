export const level1Tasks_2 = [
    {
        title: "1.6getByPlaceholder: Підказки для вводу",
        description: `## ✍️ Пошук за невидимим підписом (Placeholder)

Форми бувають жахливими для автоматизації. Іноді дизайнери приховують тексти \`<label>\` заради мінімалізму, залишаючи лише сірий текст підказки всередині поля — "Плейсхолдер". 

Офіційна рекомендація Playwright: якщо ви не можете використати \`getByRole\`, або \`getByLabel\`, бо їх фізично немає, шукайте інпут через \`getByPlaceholder\`.

## 🛠 Концепція на практиці
Placeholder — це атрибут HTML-тегу: \`<input placeholder="name@example.com">\`.
Коли користувач починає вводити текст, цей підпис зникає, але локатор \`getByPlaceholder\` все одно буде працювати!

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('авто-заповнення адреси', async ({ page }) => {
  // Знайде елемент <input placeholder="Введіть ваш email">
  await page.getByPlaceholder('Введіть ваш email').fill('QA_expert@mail.com');
  
  // Ви також можете використовувати частковий збіг або регулярні вирази
  await page.getByPlaceholder(/email/i).fill('Test1234');
});
\`\`\`

## 💡 Best Practices (Найкращі практики):
* Не прив'язуйтесь до цілого довгого речення, якщо воно часто змінюється. Краще шукайте ключове слово.
* Будьте обережні з перекладами. Якщо сайт багатомовний (i18n), плейсхолдер "Search" на українській версії буде "Пошук", і ваш локатор впаде! В таких випадках краще використовувати \`data-testid\`.

---
### 🎯 Ваше завдання
Знайдіть поле для вводу поштової скриньки за його плейсхолдером **'Email'** і заповніть його будь-якою адресою (наприклад, \`test@test.com\`).
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('знаходження за плейсхолдером', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Знайдіть поле по плейсхолдеру і викликайте .fill()\n  \n});",
        type: "code",
        options: [
            "page.getByPlaceholder('Email')",
            "page.locator('.email-input')",
            "page.fill('Email', 'test@test.com')",
            "page.type('input[type=email]', 'test')"
        ],
        correctAnswer: "page.getByPlaceholder('Email')"
    },
    {
        title: "1.7 getByLabel: Правильний зв'язок тексту з формою",
        description: `## 🏷️ Доступність на першому місці

Метод \`getByLabel()\` є другим найкращим способом локації після \`getByRole()\`. 

Як працюють веб-стандарти? Звичайний текст "Пароль" над полем вводу жодним чином НЕ пов'язаний з інпутом технічно, поки ви не використаєте спеціальний тег \`<label for="inputId">Пароль</label>\`.
Справжня магія: якщо лейбл і інпут зв'язані правильно, клік по тексту "Пароль" активує поле вводу автоматично! 

Playwright симулює цю поведінку: він знаходить текст \`<label>\` і сам вираховує, який \`<input>\` до нього прив'язаний.

## 🛠 Концепція на практиці
Якщо розробник зробив все за стандартами доступності (a11y), ваш тест буде дуже чистим:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('введення паролю через label', async ({ page }) => {
  // Це знайде відповідний <input>!
  await page.getByLabel('Пароль').fill('SuperSecret123');
  
  // Робота з чекбоксами (частіше за все в них є Label)
  await page.getByLabel('Погоджуюсь з умовами').check();
});
\`\`\`

## 💡 Чому це геніально?
1. Якщо розробник забув додати тег \`<label>\`, ви дізнаєтесь про це миттєво — ваш тест просто впаде. А це вже справжній баг доступності UI!
2. Тест читається як звичайна книга (знайди поле "Пароль", введи дані).

---
### 🎯 Ваше завдання
Знайдіть поле вводу за його підписом (Label) **'Password'** і виконайте заповнення.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('label локатор', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Заповніть поле Password\n  \n});",
        type: "code",
        options: [
            "page.getByLabel('Password')",
            "page.locator('label[for=password]')",
            "page.xpath('//label[contains(text(), \"Password\")]')",
            "page.css('#password')"
        ],
        correctAnswer: "page.getByLabel('Password')"
    },
    {
        title: "1.8 getByText: Повідомлення від системи",
        description: `## 💬 Як перевірити, що з'явилась помилка чи успішне повідомлення?

Найчастіше нам потрібно дізнатись, чи побачив користувач певну інформацію (наприклад: "Реєстрація успішна" або "Неправильний логін"). Для цього ідеально підходить метод \`getByText()\`.

Цей локатор знаходить елемент за його видимим текстом. Важливо розуміти: це **не для взаємодії** (не для кнопок чи інпутів), а для **перевірки статусу сторінки**.

## 🛠 Концепція на практиці
Playwright доволі гнучкий. Він ігноруватиме зайві пробіли на початку та в кінці, а також теги \`<span>\` чи \`<br>\`, які дроблять текст. Ви шукаєте СУТЬ.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('перевірка помилки', async ({ page }) => {
  // Ми очікуємо (expect), що текст буде видимим
  await expect(page.getByText('Invalid password')).toBeVisible();
  
  // Також підтримує регулярні вирази
  await expect(page.getByText(/Сервер не відповідає/i)).toBeVisible();
});
\`\`\`

## 💡 Best Practices:
* **Ніколи не клікайте по \`getByText()\`.** Якщо це текст, який можна клікнути, він за своєю суттю є кнопкою або посиланням. Для них треба використовувати \`getByRole('button')\` або \`getByRole('link')\`.
* Якщо текст великий, можете шукати лише його частину через опцію \`exact: false\` (вона включена за замовчуванням).

---
### 🎯 Ваше завдання
Після хибного сабміту форми має з'явитись повідомлення про помилку.
Використайте \`getByText\` для пошуку точного тексту **'Error'** і передайте його далі (в подальшому ви б зробили тут Assert, але зараз достатньо вибрати локатор).
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('знаходження тексту', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Отримайте локатор з текстом помилки\n  \n});",
        type: "code",
        options: [
            "page.getByText('Error')",
            "page.locator('.error-message')",
            "page.find('Error')",
            "page.expect('Error')"
        ],
        correctAnswer: "page.getByText('Error')"
    },
    {
        title: "1.9 fill(): Введення даних у форми",
        description: `## ⌨️ Метод fill(): Найшвидший спосіб друкувати

Для заповнення будь-яких текстових полів (від звичайного \`<input type="text">\` до великих \`<textarea>\`) в Playwright існує єдиний, найкращий інструмент — метод \`.fill()\`.

Як він працює? У старих фреймворках (як Selenium) потрібно було спочатку очистити поле, клікнути по ньому і потім посимвольно вводити текст (\`type()\`). \`fill()\` у Playwright робить це миттєво, за один раз, фокусуючись і викидаючи старий контент.

## 🛠 Концепція на практиці

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('написання відгуку', async ({ page }) => {
  // Знайди поле з текстом "Ваш коментар" і збережи локатор
  const commentBox = page.getByLabel('Ваш коментар');
  
  // Playwright автоматично натисне на поле, очистить його (якщо там щось було) і введе текст!
  await commentBox.fill('Дуже класний сервіс!');
  
  // Якщо ж вам треба саме імітувати натискання фізичних клавіш одна за одною з затримкою
  // (наприклад для тестування живого автокомпліту "Живий пошук"), 
  // використовують method pressSequentially(). Але у 99% випадків потрібен fill.
});
\`\`\`

## 💡 Чому саме .fill(), а не type()?
Метод \`type()\` офіційно **застарілий (deprecated)** у нових версіях Playwright. Він повільний, оскільки імітує кожне натискання клавіатури з обробкою подій \`keydown\`, \`keyup\`, \`keypress\`. Для звичайного заповнення форм користуйтесь виключно \`fill()\`, щоб ваші тести літали як ракети 🚀.

---
### 🎯 Ваше завдання
Знайдіть інпут форми (через класичний селектор або ID) і заповніть його текстом **'John'**. 
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('fill method', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Введіть ім'я в поле з ID #name\n  \n});",
        type: "code",
        options: [
            "await page.fill('#name', 'John')",
            "await page.type('#name', 'John')",
            "await page.keyboard.type('John')",
            "await page.sendDate('#name', 'John')"
        ],
        correctAnswer: "await page.fill('#name', 'John')"
    },
    {
        title: "1.10 click(): Взаємодія з елементами",
        description: `## 🖱️ Метод click(): Магія автоочікування

Натискання кнопок, посилань і зображень — найчастіша операція під час навігації.
Але є одна велика проблема вебу: часто кнопка вже є в HTML, але вона ще "їде" на своє місце через CSS анімацію, або перекрита лоадером (спіннером завантаження). 

Якщо тест намагатиметься просто "вдарити" в координати кнопки, він впаде! В старих системах (Selenium) QA інженери постійно боролися зі \`StaleElementReferenceException\`. 

Playwright вирішує це елегантно за допомогою **Actionability Checks (Перевірок на клікабельність)**.

## ⚙️ Що насправді робить метод \`click()\` під капотом?
Перед тим, як зробити віртуальне натискання, Playwright автоматично перевіряє:
1. Чи приєднаний елемент до DOM?
2. Чи він видимий? (не \`display: none\` і не \`visibility: hidden\`).
3. Чи елемент **стабільний**? (чи закінчилась CSS-анімація/транзиція). 
4. Чи елемент отримує події миші? (чи не перекриває його якесь прозоре модальне вікно або \`z-index\` баг).
5. Після цього він скролить сторінку так, щоб елемент опинився в центрі екрану!

І лише тоді відбувається клік!

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('click and wait', async ({ page }) => {
  // Ми шукаємо кнопку з роллю button
  const submitBtn = page.getByRole('button', { name: 'Submit' });
  
  // Клікаємо! Усі 5 перевірок активності запускаються автоматично під капотом!
  await submitBtn.click();
  
  // Можна кастомізувати клік
  await submitBtn.click({ button: 'right' }); // Правий клік екранізації контекстного меню
  await submitBtn.click({ clickCount: 2 }); // Подвійний клік
});
\`\`\`

---
### 🎯 Ваше завдання
Знайдіть елемент кнопки на сторінці (через \`getByRole\`) і виконайте клік по ній!
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('click demo', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть кнопку\n  \n});",
        type: "code",
        options: [
            "await page.click('button')",
            "await page.getByRole('button').click()",
            "await page.locator('button').tap()",
            "await page.mouse.click(10, 10)"
        ],
        correctAnswer: "await page.getByRole('button').click()"
    },
    {
        title: "1.11 Чекбокси: check() та uncheck()",
        description: `## ✅ Чекбокси — це не звичайний клік

Багато тестувальників-початківців роблять помилку: вони використовують \`.click()\` для чекбоксів (перемикачів) або радіо-кнопок.
Чому це погано? 
Що буде, якщо галочка **вже стоїть**, а ваш тест виконає \`click()\`? Галочка зніметься! 

Уявіть, що ви хочете перевірити, чи увімкнена розсилка новин. Якщо ви просто "клікнете" в надії встановити її, а розробник уже зробив її активною за замовчуванням — ви зламаєте тест своєю ж дією.

## 🛠 Концепція на практиці
Playwright має два спеціальних методи, які є **Ідемпотентними** (іх багаторазове повторення не змінює успішний результат на протилежний).
Це методи \`.check()\` та \`.uncheck()\`.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('прийняття правил угоди', async ({ page }) => {
  const termsCheckbox = page.getByLabel('Я прочитав та згоден з правилами');
  
  // Playwright перевіряє стан чекбоксу.
  // Якщо він ВЖЕ активний — нічого не станеться, скрипт успішно продовжиться.
  // Якщо він неактивний — Playwright пересуне курсор і клікне по ньому!
  await termsCheckbox.check();
  
  // А тепер знімемо прапорець (тільки якщо він стоїть)
  await termsCheckbox.uncheck();
  
  // Як перевірити, що галочка стоїть (Assert)?
  await expect(termsCheckbox).toBeChecked();
});
\`\`\`

---
### 🎯 Ваше завдання
Знайдіть елемент із лейблом **'Remember me'** (запам'ятати мене) і переконайтесь, що галочка там стоїть, за допомогою істинно правильного методу для роботи з чекбоксами.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('робота з чекбоксами', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/login');\n  // Встановіть стан чекбоксу в активний\n  \n});",
        type: "code",
        options: [
            "await page.check('#remember')",
            "await page.click('#remember')",
            "await page.getByLabel('Remember me').check()",
            "await page.setChecked('#remember', true)"
        ],
        correctAnswer: "await page.getByLabel('Remember me').check()"
    }
];
