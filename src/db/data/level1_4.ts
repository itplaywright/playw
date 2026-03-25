export const level1Tasks_4 = [
    {
        title: "1.17 Keyboard API: Симуляція клавіш",
        description: `## ⌨️ Справжнє натискання 'Enter' чи 'Escape'

Іноді розробники роблять відправку форми не по натисканню кнопки "Зберегти" мишкою, а по натисканню клавіші \`Enter\` на клавіатурі. Або ж закриття модального вікна логічно повісити на клавішу \`Escape\`.

Чи може Playwright натискати системні клавіші? Звісно! Для цього використовується глобальний об'єкт віртуальної клавіатури \`page.keyboard\`.

## 🛠 Концепція на практиці
Доступні методи:
- \`.press('Символ або Назва')\` — натискання клавіші
- \`.down()\` / \`.up()\` — утримання клавіші (наприклад, \`Shift\`)
- \`.insertText()\` — вставка скопійованого тексту

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('автокомпліт і стрілки', async ({ page }) => {
  const search = page.getByPlaceholder('Знайти продукт');
  
  // Крок 1: швидкий ввід
  await search.fill('iPhone');
  
  // Крок 2: Чекаємо поки відкриється панель автозаповнення з сервера
  await expect(page.locator('.dropdown-menu')).toBeVisible();
  
  // Крок 3: Симулюємо стрілку "Вниз", щоб обрати перший результат
  await page.keyboard.press('ArrowDown');
  
  // Крок 4: Підтверджуємо вибір
  await page.keyboard.press('Enter');
});
\`\`\`

## 💡 Best Practices:
* Ви можете комбінувати натискання. Наприклад: \`await page.keyboard.press('Control+A')\` (щоб виділити весь текст у інпуті). 
* Пам'ятайте, що \`.fill()\` також приймає символи управління, тобто замість \`keyboard.press('Enter')\` ви часто можете просто відправити форму через кнопку сабміту. Але \`keyboard\` незамінний для тестування ігор або Canvas застосунків.

---
### 🎯 Ваше завдання
Вам потрібно спочатку заповнити поле (для прикладу \`#search\`), а потім натиснути клавішу \`Enter\` за допомогою об'єкта віртуальної клавіатури.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('швидкий пошук через enter', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Після вводу тексту, натисніть клавішу Enter\n  \n});",
        type: "code",
        options: [
            "await page.keyboard.press('Enter')",
            "await page.click('Enter')",
            "await page.type('Enter')",
            "await page.send('Enter')"
        ],
        correctAnswer: "await page.keyboard.press('Enter')"
    },
    {
        title: "1.18 Viewport: Мобільна версія (Responsive Design)",
        description: `## 📱 Як тестувати сайт для iPhone?

Вебсайти сьогодні адаптивні. На екрані ноутбука у вас велике меню, а на мобільному телефоні воно зникає і перетворюється на іконку "Гамбургера" (Burger Menu). Щоб перевірити, чи правильно працює логіка на телефонах, НЕ потрібно підключати справжній телефон кабелем (як це було в Appium). 

Playwright працює в 10 разів швидше: він просто змінює **Viewport** (розмір видимого екрану вікна). Ваша сторінка моментально перебудується за правилами CSS Media Queries.

## 🛠 Концепція на практиці
Зміна розміру дуже швидка. Її роблять методом \`page.setViewportSize()\`.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('тестування мобільного меню', async ({ page }) => {
  // Відкриваємо сайт як зазвичай (на десктопі)
  await page.goto('https://example.com');
  
  // Примусово стискаємо вікно до розмірів середнього смартфона (Ширина 375px)
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Десктопного меню вже бути не повинно
  await expect(page.getByText('Products')).not.toBeVisible();
  
  // Натомість має з'явитися мобільний бургер!
  const burgerMenu = page.locator('.mobile-burger-icon');
  await expect(burgerMenu).toBeVisible();
  
  // Клікаємо і перевіряємо, чи виїхала панель
  await burgerMenu.click();
});
\`\`\`

## 💡 Порада для професіоналів (Playwright Config):
Замість того, щоб у кожному файлі міняти розмір вікна, в Playwright є вкладка "Проекти" (playwright.config.ts), де ви створюєте глобальні профілі: "Google Chrome HD", "Pixel 5", "iPhone 13", і тести будуть автоматично запускатися на всих цих пристроях!

---
### 🎯 Ваше завдання
Зробіть симуляцію розміру екрана для пристрою, задавши об'єкту \`page\` новий \`Viewport\` зі значеннями ширини (width) **375** та висоти (height) **667**.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('симуляція', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Змініть розмір екрану на 375x667\n  \n});",
        type: "code",
        options: [
            "await page.setViewportSize({ width: 375, height: 667 })",
            "await page.resize(375, 667)",
            "await page.window.size(375, 667)",
            "await page.view(375, 667)"
        ],
        correctAnswer: "await page.setViewportSize({ width: 375, height: 667 })"
    },
    {
        title: "1.19 Assertions: Видимість як фундамент (isVisible та toBeVisible)",
        description: `## 👀 Найголовніша перевірка світу UI Автоматизації

Після кліку на кнопку "Зареєструватись" у 99% випадків стається одна з двох речей:
1. З'являється спливаюче повідомлення успіху (Modal, Toast, Alert).
2. Ви переходите на нову сторінку.

Як довести, що реєстрація успішна? Дуже просто — **перевірити, чи ВИДИМЕ це повідомлення**.
Локатор просто "знаходить" HTML-тег. Навіть якщо цей тег прихований (наприклад, \`display: none\`), локатор його бачить. А нам, як користувачам, байдуже на те, що він в DOM. Ми хочемо побачити його ВІЗУАЛЬНО.

## 🛠 Концепція на практиці
Є два шляхи перевірки:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('різниця між isVisible та toBeVisible', async ({ page }) => {
  const popup = page.getByText('Дані збережено');

  // 🔴 ВАРІАНТ 1: Звичайний метод (НЕ радимо)
  // .isVisible() повертає boolean (true/false) МИТТЄВО. 
  // Якщо попап ще не встиг виїхати (0.1 сек анімація), він поверне false, і тест впаде.
  const itExistsNow = await popup.isVisible(); 
  
  // 🟢 ВАРІАНТ 2: Playwright Web-First Assert (НАЙКРАЩИЙ)
  // expect().toBeVisible() — це магія! Він буде битися в двері до 5 секунд 
  // і питати "Ти вже видимий?", поки елемент не з'явиться!
  await expect(popup).toBeVisible();
});
\`\`\`

## 💡 Best Practices:
* Завжди, завжди використовуйте \`expect(locator).toBeVisible()\` для перевірок появи елементів. Метод \`isVisible()\` потрібен ЛИШЕ в умовних операторах (якщо кнопка є -> клікаємо, інакше йдемо далі).

---
### 🎯 Ваше завдання
Після переходу на сторінку, підтвердіть, що вказаний елемент з локатором \`locator\` з'явився на екрані і його видно користувачу, використовуючи найкращий метод.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('перевірка на видимість', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  const locator = page.locator('#success-msg');\n  // Перевірте, чи є цей елемент видимим!\n  \n});",
        type: "code",
        options: [
            "await expect(locator).toBeVisible()",
            "await expect(locator).toBeHidden()",
            "await expect(locator).toBeEnabled()",
            "await expect(locator).toBeEditable()"
        ],
        correctAnswer: "await expect(locator).toBeVisible()"
    },
    {
        title: "1.20 Assertions: Точний текст екрану",
        description: `## 📝 Як переконатись, що текст саме такий, як очікується?

Гроші люблять точність. Якщо ваш застосунок працює з фінансами, недостатньо перевірити "Чи є якась ціна на екрані?". 
Потрібно перевірити, чи ця ціна точно **дорівнює** \`$100\`.

Для перевірки вмісту елемента (його \`innerText\` / \`textContent\`) ми знову використовуємо \`expect\` з іншим матчером.

## 🛠 Концепція на практиці
Існує два різновиди цієї перевірки: Точний і Частковий.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('екзамен на точність тексту', async ({ page }) => {
  const priceBag = page.locator('.total-price');
  
  // 1️⃣ Частковий збіг (М'який варіант)
  // Якщо на екрані написано "Сума: 50.00 USD", ця перевірка пройде
  await expect(priceBag).toContainText('50.00');

  // 2️⃣ Точний збіг (Суворий варіант)
  // Якщо там "Сума: 50.00 USD", а ми очікуємо "50.00", тест ВПАДЕ!
  // Цей метод перевіряє повне співпадіння всього блоку (від символу до символу).
  await expect(priceBag).toHaveText('50.00 USD');
});
\`\`\`

## 💡 Best Practices:
* Якщо ваш тест стосується перекладу мов (i18n), або довгих параграфів тексту з пробілами, використовуйте \`toContainText\`.
* Якщо ви тестуєте конкретне важливе значення (статус ордера: 'PAID', цифри), юзайте строгий \`toHaveText\`.

---
### 🎯 Ваше завдання
Даний локатор зберігає елемент із якимось статусом. Зробіть **сувору** перевірку того, що його текстовий вміст відповідає фразі **'...'**. (Допишіть потрібний код замість коментаря).
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('строга текстова перевірка', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  const locator = page.locator('.status');\n  // Суворо перевірте, чи точний текст всередині це '...'\n  \n});",
        type: "code",
        options: [
            "await expect(locator).toHaveText('...')",
            "await expect(locator).toContainText('...')",
            "await expect(locator).toBe('...')",
            "await expect(locator).match('...')"
        ],
        correctAnswer: "await expect(locator).toHaveText('...')"
    },
    {
        title: "1.21 Navigation: Оновлення сторінки",
        description: `## 🔄 F5: Оновлення (Reload)

У UI тестуванні є класичний кейс: "Додайте товар в кошик, оновіть сторінку і переконайтесь, що товар не зник". 
Це тестування персистентності (чи правильно збереглись сесії, кеш, або LocalStorage).

Без мишки ми б натиснули F5 (або Ctrl+R). У коді на Playwright ми користуємось API сторінки.

## 🛠 Концепція на практиці
У класі \`page\` є базові методи для управління історією браузера.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('persistence test', async ({ page }) => {
  // Зайшли, змінили тему на темну
  await page.goto('/settings');
  await page.getByText('Dark Mode').check();
  
  // Перезавантажуємо вкладку "жорстко", з сервера
  await page.reload();
  
  // Крок назад в історії браузера (симуляція кнопки <-_ Назад)
  // await page.goBack(); 
  
  // Перевіряємо, що після рефрешу тема залишилась темною
  await expect(page.locator('body')).toHaveClass(/theme-dark/);
});
\`\`\`

---
### 🎯 Ваше завдання
Скористайтесь методом сторінки, щоб оновити поточну вкладку, ніби ви щойно натиснули клавішу F5.
`,
        code: "import { test, expect } from '@playwright/test';\n\ntest('оновлення', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Оновіть сторінку!\n  \n});",
        type: "code",
        options: [
            "await page.reload()",
            "await page.refresh()",
            "await page.goto(page.url())",
            "await browser.reload()"
        ],
        correctAnswer: "await page.reload()"
    }
];
