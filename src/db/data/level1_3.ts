export const level1Tasks_3 = [
    {
        title: "1.12 clear(): Очищення полів інпуту",
        description: `## 🧹 Як правильно стерти текст?

Під час редагування профілю користувача, поля часто вже заповнені старими даними. Звісно, метод \`.fill()\` автоматично замінює старий текст на новий. Але що, якщо нам потрібно просто **стерти** вміст поля, щоб перевірити валідацію: "Поле не може бути порожнім"?

Для цього не можна вводити туди прогалини. Необхідно надіслати команду стирання — метод \`.clear()\`.

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('перевірка валідації порожнього поля', async ({ page }) => {
  const emailInput = page.getByLabel('Електронна пошта');
  
  // Користувач передумав і стер свою адресу
  await emailInput.clear();
  
  // Клікаємо кудись вбік (blur), щоб тригернути валідацію
  await page.locator('body').click();
  
  // Перевіряємо, що з'явилась помилка під полем
  await expect(page.getByText('Email обов\'язковий')).toBeVisible();
});
\`\`\`

## 💡 Чому саме .clear(), а не fill('')?
\`fill('')\` іноді інтерпретується деякими React формами як додавання "порожнього рядка" до State, в той час як \`.clear()\` ближче до натискання клавіші \`Backspace\`, що відпрацьовує всі необхідні події (Change, Input, KeyboardEvent), які змушують сучасні фреймворки зрозуміти, що поле дійсно очистилось.

---
### 🎯 Ваше завдання
Знайдіть поле пошуку (Search) за його селектором \`#search\` та повністю очистіть його за допомогою цього спеціального методу.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('стирання тексту', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Очистіть поле з ID #search\n  \n});",
        type: "code",
        options: [
            "await page.clear('#search')",
            "await page.fill('#search', '')",
            "await page.locator('#search').clear()",
            "await page.delete('#search')"
        ],
        correctAnswer: "await page.locator('#search').clear()"
    },
    {
        title: "1.13 Радіокнопки: Робота з групами",
        description: `## 📻 Радіо-групи: Вибір лише одного

Радіокнопки (Radio buttons) концептуально схожі на чекбокси, але з однією ключовою відмінністю — у групі одночасно може бути обраний лише один пункт. Якщо ви обираєте 'План PRO', інші плани знімаються автоматично.

У Playwright ви взаємодієте з ними абсолютно так само, як і з чекбоксами — використовуючи метод \`.check()\`.

## 🛠 Концепція на практиці
Ви знаходите радіокнопку (як правило, за допомогою \`getByLabel\`, оскільки радіокнопки завжди мають підписи) і викликаєте.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('вибір тарифного плану', async ({ page }) => {
  // Користувач клікає на кнопку "Місячна підписка"
  await page.getByLabel('Місячна підписка').check();
  
  // Пересвідчуємось, що система зареєструвала цей клік 
  // (кружечок став заповненим)
  await expect(page.getByLabel('Місячна підписка')).toBeChecked();
});
\`\`\`

## 💡 В чому проблема невидимих радіокнопок?
Сучасні веб-дизайнери часто ховають справжній HTML елемент \`<input type="radio">\` за допомогою CSS (ставлячи йому opacity: 0 або display: none), і замість нього малюють гарні стилізовані DIV-блоки.
Якщо ваш \`.check()\` видає помилку, що елемент невидимий — вам доведеться додати опцію **{ force: true }**. Це змусить Playwright "натиснути" незважаючи на прихований статус.

---
### 🎯 Ваше завдання
Знайдіть радіокнопку, яка підписана як **'Pro'** і "ввімкніть" її відповідним методом.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('вибір тарифу', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/pricing');\n  // Виберіть план 'Pro'\n  \n});",
        type: "code",
        options: [
            "await page.check('#plan')",
            "await page.getByLabel('Pro').check()",
            "await page.click('#plan')",
            "await page.select('#plan')"
        ],
        correctAnswer: "await page.getByLabel('Pro').check()"
    },
    {
        title: "1.14 selectOption: Дропдауни і списки",
        description: `## 📋 Як обрати країну зі списку?

Коли ви стикаєтесь зі стандартними випадаючими списками (HTML тег \`<select>\` всередині якого йдуть \`<option>\` елементи), використання простого кліку не спрацює надійно, адже список іноді навіть не рендериться у DOM для кліку.

Для цього створенний ідеальний метод — \`.selectOption()\`. Він вміє працювати з нативними \`<select>\` меню без зайвої візуальної метушні.

## 🛠 Концепція на практиці
Метод \`.selectOption()\` приймає значення \`value\` або \`label\` (видимий текст) опції, яку ви хочете вибрати.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('вибір розміру одягу та країни', async ({ page }) => {
  // Вибір за видимим текстом
  await page.locator('select#country').selectOption('Ukraine');
  
  // Вибір за HTML атрибутом value="XL"
  await page.locator('select#size').selectOption({ value: 'XL' });
  
  // Якщо це Multi-select (можна обрати кілька), просто передайте масив:
  await page.locator('select#hobbies').selectOption(['Sports', 'Music']);
});
\`\`\`

## 💡 Увага! Пастка сучасного вебу:
Дуже часто "гарні дропдауни" на модних сайтах (наприклад, Select2, React-Select, Material UI) насправді **НЕ Є** тегом \`<select>\`. Вони є набором DIV-ів.
Для таких кастомних списків метод \`selectOption\` працювати не буде! Вам доведеться зробити реальний \`.click()\` по інпуту, щоб меню відкрилось, а потім \`.getByText('Ukraine').click()\`. 

---
### 🎯 Ваше завдання
Зробіть вибір опції для нативного селекту (отриманого за тегом \`select\`). Оберіть країну **'Ukraine'** за її назвою (label).
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('dropdown вибір', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Оберіть 'Ukraine' у елементі select\n  \n});",
        type: "code",
        options: [
            "await page.selectOption('Ukraine')",
            "await page.fill('Ukraine')",
            "await page.click('Ukraine')",
            "await page.locator('select').selectOption('Ukraine')"
        ],
        correctAnswer: "await page.locator('select').selectOption('Ukraine')"
    },
    {
        title: "1.15 Hover: Наведення мишкиБез кліку",
        description: `## 🖱️ Мега-меню та тултіпи

Ралі життя: багато сучасних елементів інтерфейсу з'являються тільки тоді, коли ви просто наводите (не клікаєте!) на них курсор миші.
Наприклад: великі мега-меню в онлайн-магазинах (як на Rozetka: навів на "Ноутбуки" - відкрилась панель брендів), або підказки інструкцій (tooltips: навів на знак питання - з'явився опис).

У Playwright для симуляції переміщення курсору прямо над елементом використовується метод \`.hover()\`.

## 🛠 Концепція на практиці
Функція \`.hover()\` скролить сторінку так, щоб елемент опинився в полі зору, а потім переміщує на нього віртуальний курсор. Подія \`mouseenter\` або CSS-правило \`:hover\` відпрацьовує миттєво.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('Відкриваємо підменю в інтернет-магазині', async ({ page }) => {
  // Наводимо курсор на пункт головного меню
  const laptopsCategory = page.getByRole('button', { name: 'Ноутбуки і ПК' });
  await laptopsCategory.hover();
  
  // Тепер підменю стало видимим. Ми можемо по ньому клікнути!
  const appleCategory = page.getByText('Apple MacBook');
  await expect(appleCategory).toBeVisible(); // Обов'язково перевіряємо, чи спрацювала анімація
  await appleCategory.click();
});
\`\`\`

## 💡 Best Practices:
Іноді після наведення меню може "дребежати" або відкриватися з мікро-затримкою. Завжди використовуйте переший Assert \`toBeVisible()\` на новий елемент ПЕРЕД ТИМ, як спробуєте по ньому клікнути, щоб тест був надійним на 100%.

---
### 🎯 Ваше завдання
У вас є елемент профілю користувача з ідентифікатором \`#menu\`. Знайдіть його і використайте правильний метод, щоб просто навести на нього курсор віртуальної мишки.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('робота з hover', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Наведіть курсор на #menu\n  \n});",
        type: "code",
        options: [
            "await page.hover('#menu')",
            "await page.click('#menu')",
            "await page.mouse.move('#menu')",
            "await page.focus('#menu')"
        ],
        correctAnswer: "await page.hover('#menu')"
    },
    {
        title: "1.16 Focus: Перевірка активності (Клавіатурна навігація)",
        description: `## 🎯 Фокус: Клієнти, які не користуються мишею

Люди з вадами зору або швидкісні розробники (Power Users) часто здійснюють навігацію по сайту взагалі без мишки, користуючись клавіатурою (клавіша TAB) та екранним диктором.
З погляду автоматизації дуже важливо перевірити, чи правильно встановлюється фокус. 

Елемент "у фокусі" (Focused) стає активним — зазвичай він отримує синю рамку (CSS outline) або підсвічуваний текст. Playwright вміє керувати фокусом безпосередньо!

## 🛠 Концепція на практиці
Використовуємо метод \`.focus()\`. Він працює так само, як \`click\`, тільки він просто переводить системний курсор управління у поле без симуляції події "MouseClick".

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('авто-фокус поля при завантаженні або Tab-навігації', async ({ page }) => {
  const searchInput = page.getByPlaceholder('Шукати...');
  
  // Встановлюємо фокус вручну, нібито ми клікнули Tab
  await searchInput.focus();
  
  // Як можна зробити ASSERT на те, чи це поле зараз у фокусі?
  // Playwright має спеціальний матчер!
  await expect(searchInput).toBeFocused();
});
\`\`\`

## 💡 Навіщо це потрібно?
Тестування Accessibility (доступності). Наприклад: коли відкривається модальне вікно (Popup), перше текстове поле (Ім'я) має ОДРАЗУ автоматично отримати фокус, щоб користувач міг почати друкувати, не хапаючи мишку. Ви можете написати автотест: "Натиснути кнопку -> Модальне вікно з'явилося -> \`expect(nameInput).toBeFocused()\`". Це дуже професійний рівень!

---
### 🎯 Ваше завдання
Знайдіть поле пошуку з селектором \`#search\` та самостійно встановіть у нього фокус, підготувавши його до роботи на клавіатурі.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('робота з фокусом', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Отримайте елемент #search та передайте йому фокус\n  \n});",
        type: "code",
        options: [
            "await page.focus('#search')",
            "await page.click('#search')",
            "await page.hover('#search')",
            "await page.select('#search')"
        ],
        correctAnswer: "await page.focus('#search')"
    },
];
