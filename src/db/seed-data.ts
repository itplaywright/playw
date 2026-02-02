import { db } from "@/db"
import { tasks, tracks, results } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function seedDatabase() {
    console.log("💎 ЗАПУСК ПРЕМІУМ-ОНОВЛЕННЯ З ІМПОРТАМИ (50 УРОКІВ)...")

    // Use TRUNCATE to reset IDs so they start from 1
    await db.execute(sql`TRUNCATE TABLE "results", "tasks", "tracks" RESTART IDENTITY CASCADE`)

    const imp = "import { test, expect } from '@playwright/test';\n\n";
    const impPage = "import { test, expect, Page } from '@playwright/test';\n\n";

    // ==========================================
    // Рівень 1 — Base (15 завдань)
    // ==========================================
    const [level1] = await db.insert(tracks).values({
        title: "Рівень 1 — Base (Основи майстерності)",
        description: "Фундамент автоматизації: від першого кліку до мобільної емуляції.",
        order: 1
    }).returning()

    // Helper to add tasks to a track
    async function addTasks(trackId: number, tasksList: { title: string, description: string, code: string, type?: "code" | "quiz", options?: string[], correctAnswer?: string }[], difficulty: "easy" | "medium" | "hard" = "easy") {
        for (const t of tasksList) {
            await db.insert(tasks).values({
                trackId,
                title: t.title,
                description: t.description,
                initialCode: t.code,
                difficulty,
                type: t.type || "code",
                options: t.options || null,
                correctAnswer: t.correctAnswer || null
            })
        }
    }

    await addTasks(level1.id, [
        {
            title: "1.1 Доступність: Перевірка Title",
            description: "## 🏗️ Чому це важливо?\n\n**Теорія**: Перший крок будь-якого тесту — перевірка того, що ми успішно завантажили сайт. Заголовок (`title`) — це найшвидший спосіб підтвердити, що ми там, де треба.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('check title', async ({ page }) => {\n  await page.goto('https://google.com');\n  await expect(page).toHaveTitle(/Google/);\n});\n```\n\n### Завдання\nПерейдіть на сторінку `https://finmore.netlify.app/` та перевірте, що її заголовок містить слово `Finmore`.",
            code: imp + "test('перевірка title', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Додайте перевірку title\n});",
            options: [
                "await expect(page).toHaveTitle('Finmore')",
                "await expect(page).toHaveUrl('Finmore')",
                "await page.title('Finmore')",
                "expect(title).toBe('Finmore')"
            ],
            correctAnswer: "await expect(page).toHaveTitle('Finmore')"
        },
        {
            title: "1.2 getByRole: Пріоритет №1",
            description: "## 🏆 Ролі елементів\n\n**Теорія**: `getByRole` — це найбільш надійний селектор, який імітує те, як користувачі (і скрінрідери) сприймають сторінку. Краще шукати кнопку за її роллю `button` і назвою, ніж за CSS класом.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('click login', async ({ page }) => {\n  await page.getByRole('button', { name: 'Log in' }).click();\n});\n```\n\n### Завдання\nЗнайдіть кнопку з текстом 'Sign up' (або 'Реєстрація') та натисніть на неї.",
            code: imp + "test('role', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Знайдіть кнопку реєстрації\n});",
            options: [
                "page.getByRole('button', { name: 'Sign up' })",
                "page.locator('.sign-up-btn')",
                "page.xpath('//button[text()=\"Sign up\"]')",
                "page.css('button.signup')"
            ],
            correctAnswer: "page.getByRole('button', { name: 'Sign up' })"
        },
        {
            title: "1.3 getByPlaceholder",
            description: "## ✍️ Підказки в інпутах\n\n**Теорія**: Коли у полів немає явних лейблів, часто використовують placeholder (текст-підказку всередині поля).\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('fill email', async ({ page }) => {\n  await page.getByPlaceholder('name@example.com').fill('test@mail.com');\n});\n```\n\n### Завдання\nЗнайдіть поле для вводу Email за його плейсхолдером і введіть тестову пошту.",
            code: imp + "test('placeholder', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Заповніть поле email\n});",
            options: [
                "page.getByPlaceholder('Email')",
                "page.locator('.email-input')",
                "page.fill('Email', 'test@test.com')",
                "page.type('input[type=email]', 'test')"
            ],
            correctAnswer: "page.getByPlaceholder('Email')"
        },
        {
            title: "1.4 getByLabel: Зв'язок з текстом",
            description: "## 🏷️ Label-локатори\n\n**Теорія**: Це найкращий спосіб для форм. Він шукає інпут, який прив'язаний до тексту `<label>`. Це гарантує, що форма доступна.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('fill password', async ({ page }) => {\n  await page.getByLabel('Password').fill('secret123');\n});\n```\n\n### Завдання\nЗнайдіть поле паролю за його підписом (Label) і заповніть його.",
            code: imp + "test('label', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Знайдіть поле по підпису 'Email'\n});",
            options: [
                "page.getByLabel('Password')",
                "page.locator('label[for=password]')",
                "page.xpath('//label[contains(text(), \"Password\")]')",
                "page.css('#password')"
            ],
            correctAnswer: "page.getByLabel('Password')"
        },
        {
            title: "1.5 getByText: Повідомлення",
            description: "## 💬 Пошук по тексту\n\n**Теорія**: Ідеально підходить для перевірки повідомлень, заголовків або помилок. Не використовуйте для кнопок (для них є `getByRole`).\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('check error', async ({ page }) => {\n  await expect(page.getByText('Invalid password')).toBeVisible();\n});\n```\n\n### Завдання\nНатисніть кнопку входу з порожніми полями і перевірте, що з'явився текст помилки.",
            code: imp + "test('text', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть вхід і перевірте текст помилки\n});",
            options: [
                "page.getByText('Error')",
                "page.locator('.error-message')",
                "page.find('Error')",
                "page.expect('Error')"
            ],
            correctAnswer: "page.getByText('Error')"
        },
        {
            title: "1.6 fill: Введення даних",
            description: "## ⌨️ Метод fill()\n\n**Теорія**: Цей метод симулює користувача, який швидко друкує текст. Він автоматично чекає, поки поле стане активним.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('type name', async ({ page }) => {\n  await page.locator('#name').fill('John Doe');\n});\n```\n\n### Завдання\nЗаповніть форму реєстрації: введіть ім'я та пошту.",
            code: imp + "test('fill', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Введіть дані\n});",
            options: [
                "await page.fill('#name', 'John')",
                "await page.type('#name', 'John')",
                "await page.keyboard.type('John')",
                "await page.sendDate('#name', 'John')"
            ],
            correctAnswer: "await page.fill('#name', 'John')"
        },
        {
            title: "1.7 click: Взаємодія",
            description: "## 🖱️ Кліки\n\n**Теорія**: Базовий метод для взаємодії. Playwright автоматично скролить до елемента і чекає, поки він перестане рухатись, перед тим як клікнути.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('submit', async ({ page }) => {\n  await page.getByRole('button', { name: 'Submit' }).click();\n});\n```\n\n### Завдання\nЗнайдіть кнопку 'Увійти' і натисніть на неї.",
            code: imp + "test('click', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть 'Увійти'\n});",
            options: [
                "await page.click('button')",
                "await page.getByRole('button').click()",
                "await page.locator('button').tap()",
                "await page.mouse.click(10, 10)"
            ],
            correctAnswer: "await page.getByRole('button').click()"
        },
        {
            title: "1.8 Чекбокси: check()",
            description: "## ✅ check()\n\n**Теорія**: Цей метод гарантує, що галочка стоїть. Якщо вона вже стоїть — він нічого не робить. Якщо ні — клікає.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('agree terms', async ({ page }) => {\n  await page.getByLabel('I agree').check();\n  expect(await page.getByLabel('I agree').isChecked()).toBeTruthy();\n});\n```\n\n### Завдання\nВідмітьте чекбокс 'Запам'ятати мене'.",
            code: imp + "test('check', async ({ page }) => { });",
            options: [
                "await page.check('#remember')",
                "await page.click('#remember')",
                "await page.getByLabel('Remember me').check()",
                "await page.setChecked('#remember', true)"
            ],
            correctAnswer: "await page.getByLabel('Remember me').check()"
        },
        {
            title: "1.9 clear: Очищення",
            description: "## 🧹 Навіщо clear()?\n\n**Теорія**: Видалення старих даних перед новим вводом. Це корисно, коли поле має значення за замовчуванням.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('edit profile', async ({ page }) => {\n  await page.locator('#bio').clear();\n  await page.locator('#bio').fill('New bio');\n});\n```\n\n### Завдання\nОчистіть поле пошуку і введіть нове значення.",
            code: imp + "test('clear', async ({ page }) => { });",
            options: [
                "await page.clear('#search')",
                "await page.fill('#search', '')",
                "await page.locator('#search').clear()",
                "await page.delete('#search')"
            ],
            correctAnswer: "await page.locator('#search').clear()"
        },
        {
            title: "1.10 Радіокнопки",
            description: "## 📻 Радіо-групи\n\n**Теорія**: Вибір одного варіанту з багатьох. Працює аналогічно до `check()`.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('choose plan', async ({ page }) => {\n  await page.getByLabel('Pro Plan').check();\n});\n```\n\n### Завдання\nВиберіть стать або тарифний план у формі.",
            code: imp + "test('radio', async ({ page }) => { });",
            options: [
                "await page.check('#plan')",
                "await page.getByLabel('Pro').check()",
                "await page.click('#plan')",
                "await page.select('#plan')"
            ],
            correctAnswer: "await page.getByLabel('Pro').check()"
        },
        {
            title: "1.11 selectOption: Списки",
            description: "## 📋 HTML Select\n\n**Теорія**: Спеціальний метод для вибору зі стандартних `<select>` дропдаунів.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('select country', async ({ page }) => {\n  await page.locator('select#country').selectOption('Ukraine');\n});\n```\n\n### Завдання\nВиберіть 'Ukraine' зі списку країн.",
            code: imp + "test('select', async ({ page }) => { });",
            options: [
                "await page.selectOption('Ukraine')",
                "await page.fill('Ukraine')",
                "await page.click('Ukraine')",
                "await page.locator('select').selectOption('Ukraine')"
            ],
            correctAnswer: "await page.locator('select').selectOption('Ukraine')"
        },
        {
            title: "1.12 Hover: Наведення",
            description: "## 🖱️ Hover\n\n**Теорія**: Використовується для відкриття випадаючих меню або появи підказок.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('menu', async ({ page }) => {\n  await page.getByText('Products').hover();\n  await expect(page.getByText('Laptops')).toBeVisible();\n});\n```\n\n### Завдання\nНаведіть курсор на меню профілю, щоб побачити кнопку 'Вихід'.",
            code: imp + "test('hover', async ({ page }) => { });",
            options: [
                "await page.hover('#menu')",
                "await page.click('#menu')",
                "await page.mouse.move('#menu')",
                "await page.focus('#menu')"
            ],
            correctAnswer: "await page.hover('#menu')"
        },
        {
            title: "1.13 Focus: Активність",
            description: "## 🎯 focus()\n\n**Теорія**: Перевірка активного елемента. Корисно для тестування навігації клавіатурою.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('tab navigation', async ({ page }) => {\n  await page.locator('#search').focus();\n});\n```\n\n### Завдання\nЗробіть фокус на полі пошуку.",
            code: imp + "test('focus', async ({ page }) => { });",
            options: [
                "await page.focus('#search')",
                "await page.click('#search')",
                "await page.hover('#search')",
                "await page.select('#search')"
            ],
            correctAnswer: "await page.focus('#search')"
        },
        {
            title: "1.14 Keyboard: Клавіші",
            description: "## ⌨️ Keyboard API\n\n**Теорія**: Імітація натискання фізичних клавіш (Enter, Escape, стрілки).\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('search by enter', async ({ page }) => {\n  await page.fill('#search', 'Playwright');\n  await page.keyboard.press('Enter');\n});\n```\n\n### Завдання\nВведіть текст у поле і натисніть Enter.",
            code: imp + "test('keyboard', async ({ page }) => { });",
            options: [
                "await page.keyboard.press('Enter')",
                "await page.click('Enter')",
                "await page.type('Enter')",
                "await page.send('Enter')"
            ],
            correctAnswer: "await page.keyboard.press('Enter')"
        },
        {
            title: "1.15 Viewport: Mobile",
            description: "## 📱 Мобільна версія\n\n**Теорія**: Зміна розміру вікна для перевірки адаптивності.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('mobile view', async ({ page }) => {\n  await page.setViewportSize({ width: 375, height: 667 });\n  await expect(page.locator('.burger-menu')).toBeVisible();\n});\n```\n\n### Завдання\nЗмініть розмір вікна на iPhone SE і перевірте наявність бургер-меню.",
            code: imp + "test('mobile', async ({ page }) => {\n  await page.setViewportSize({ width: 375, height: 667 });\n});",
            options: [
                "await page.setViewportSize({ width: 375, height: 667 })",
                "await page.resize(375, 667)",
                "await page.window.size(375, 667)",
                "await page.view(375, 667)"
            ],
            correctAnswer: "await page.setViewportSize({ width: 375, height: 667 })"
        },
        {
            title: "1.16 Asserts: Visibility",
            description: "## 👀 Видимість\n\n**Теорія**: Найчастіша перевірка. Чи бачить користувач елемент?\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('is visible', async ({ page }) => {\n  await expect(page.locator('#success-msg')).toBeVisible();\n});\n```\n\n### Завдання\nПеревірте, що логотип сайту видимий.",
            code: imp + "test('visible', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Перевірте видимість логотипу\n});",
            options: [
                "await expect(locator).toBeVisible()",
                "await expect(locator).toBeHidden()",
                "await expect(locator).toBeEnabled()",
                "await expect(locator).toBeEditable()"
            ],
            correctAnswer: "await expect(locator).toBeVisible()"
        },
        {
            title: "1.17 Asserts: Text",
            description: "## 📝 Точний текст\n\n**Теорія**: Перевірка, що елемент містить правильний текст.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('check price', async ({ page }) => {\n  await expect(page.locator('.price')).toHaveText('$100');\n});\n```\n\n### Завдання\nПеревірте заголовок 'Welcome' на головній сторінці.",
            code: imp + "test('text', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Перевірте заголовок сторінки\n});",
            options: [
                "await expect(locator).toHaveText('...')",
                "await expect(locator).toContainText('...')",
                "await expect(locator).toBe('...')",
                "await expect(locator).match('...')"
            ],
            correctAnswer: "await expect(locator).toHaveText('...')"
        },
        {
            title: "1.18 Navigation: Reload",
            description: "## 🧭 Навігація\n\n**Теорія**: Перезавантаження сторінки або переход назад/вперед.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('refresh', async ({ page }) => {\n  await page.reload();\n});\n```\n\n### Завдання\nПерезавантажте сторінку і перевірте, що дані не зникли.",
            code: imp + "test('reload', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Перезавантажте сторінку\n});",
            options: [
                "await page.reload()",
                "await page.refresh()",
                "await page.goto(page.url())",
                "await browser.reload()"
            ],
            correctAnswer: "await page.reload()"
        }
    ], "easy")

    // Рівень 2 (12 завдань)
    const [level2] = await db.insert(tracks).values({ title: "Рівень 2 — Structure (Архітектор)", description: "Створення масштабованих систем.", order: 2 }).returning()
    await addTasks(level2.id, [
        {
            title: "2.1 POM: Оголошення властивостей",
            description: "## 🏗️ TypeScript у POM\n\n**Теорія**: Page Object Model (POM) — це патерн, де кожна сторінка сайту стає класом у коді. Спочатку треба оголосити елементи як властивості класу.\n\n**Приклад**:\n```typescript\nimport { Page, Locator } from '@playwright/test';\n\nclass HomePage {\n  readonly page: Page;\n  readonly loginButton: Locator;\n\n  constructor(page: Page) {\n    this.page = page;\n    this.loginButton = page.getByText('Login');\n  }\n}\n```\n\n### Завдання\nСтворіть клас `LoginPage`, оголосіть властивість `page` та ініціалізуйте її в конструкторі.",
            code: impPage + "class LoginPage {\n  readonly page: Page;\n  constructor(page: Page) { this.page = page; }\n}",
            options: [
                "readonly page: Page;",
                "public page: any;",
                "var page = new Page();",
                "const page: Page;"
            ],
            correctAnswer: "readonly page: Page;"
        },
        {
            title: "2.2 POM: Логічні методи",
            description: "## 🧩 Дії класу\n\n**Теорія**: Тест не повинен знати про селектори. Він має викликати зрозумілі методи, наприклад `login()`, а не `click('#btn')`.\n\n**Приклад**:\n```typescript\n// У класі\nasync search(text: string) {\n  await this.searchBox.fill(text);\n  await this.searchBtn.click();\n}\n\n// У тесті\nawait homePage.search('Playwright');\n```\n\n### Завдання\nВикористайте підготовлений клас `LoginPage`, щоб виконати вхід.",
            code: impPage + "test('pom', async ({ page }) => {\n  // Використайте клас LoginPage\n});",
            options: [
                "await loginPage.login()",
                "loginPage.login()",
                "await page.login()",
                "await LoginPage.login()"
            ],
            correctAnswer: "await loginPage.login()"
        },
        {
            title: "2.3 Організація: CONFIG",
            description: "## 🚫 Жодних хардкод url\n\n**Теорія**: Якщо URL зміниться, ви не захочете правити 500 тестів. Виносьте константи у змінні або конфіг.\n\n**Приклад**:\n```typescript\nconst BASE_URL = 'https://staging.example.com';\n\ntest('visit', async ({ page }) => {\n  await page.goto(BASE_URL);\n});\n```\n\n### Завдання\nСтворіть константу `URL` та використайте її у тесті.",
            code: imp + "const URL = 'https://finmore.netlify.app/';",
            options: [
                "const BASE_URL = '...'",
                "var BASE_URL = '...'",
                "let BASE_URL = '...'",
                "url = '...'"
            ],
            correctAnswer: "const BASE_URL = '...'"
        },
        {
            title: "2.4 Унікалізація даних",
            description: "## 🌈 Динамічні дані\n\n**Теорія**: Якщо ви створюєте юзера з email `test@test.com`, другий запуск тесту впаде, бо такий юзер вже є. Використовуйте `Date.now()` або рандом.\n\n**Приклад**:\n```typescript\nconst email = `user_${Date.now()}@test.com`;\n// user_16789456123@test.com\n```\n\n### Завдання\nСтворіть унікальний email і виведіть його в консоль.",
            code: imp + "test('unique', async () => {\n  const email = `test_${Date.now()}@mail.com`;\n});",
            options: [
                "Date.now()",
                "Math.random()",
                "faker.email()",
                "Все вищезгадане"
            ],
            correctAnswer: "Все вищезгадане"
        },
        {
            title: "2.5 Force: Форсований клік",
            description: "## 🧱 Force click\n\n**Теорія**: Іноді елемент перекритий іншим елементом (наприклад, кастомним тултіпом), але Playwright розумний і не клікає. `force: true` змушує його клікнути попри все.\n\n**Приклад**:\n```typescript\nawait page.getByRole('button').click({ force: true });\n```\n\n### Завдання\nНатисніть на 'Приховану кнопку' з параметром `force: true`.",
            code: imp + "test('force', async ({ page }) => {\n  await page.click('button', { force: true });\n});",
            options: [
                "{ force: true }",
                "{ hard: true }",
                "{ click: 'forced' }",
                "{ ignore: true }"
            ],
            correctAnswer: "{ force: true }"
        },
        {
            title: "2.6 waitForSelector",
            description: "## ⏳ Явне очікування\n\n**Теорія**: Playwright чекає автоматично, але іноді треба почекати появи елемента, з яким ми НЕ взаємодіємо прямо зараз (наприклад, спінер зник).\n\n**Приклад**:\n```typescript\nawait page.waitForSelector('.loading-spinner', { state: 'detached' });\n```\n\n### Завдання\nДочекайтеся появи елемента `.success-message`.",
            code: imp + "test('wait', async ({ page }) => { });",
            options: [
                "await page.waitForSelector('.success-message')",
                "await page.wait('.success-message')",
                "await page.pause('.success-message')",
                "await page.timeout('.success-message')"
            ],
            correctAnswer: "await page.waitForSelector('.success-message')"
        },
        {
            title: "2.7 beforeEach: Чистота",
            description: "## 🧹 Хуки (Hooks)\n\n**Теорія**: `beforeEach` виконується перед КОЖНИМ тестом. Ідеально для `goto` або логіну.\n\n**Приклад**:\n```typescript\ntest.beforeEach(async ({ page }) => {\n  await page.goto('/login');\n});\n```\n\n### Завдання\nДодайте перехід на головну сторінку у `beforeEach`.",
            code: imp + "test.beforeEach(async ({ page }) => { });",
            options: [
                "test.beforeEach",
                "test.beforeAll",
                "test.setup",
                "test.init"
            ],
            correctAnswer: "test.beforeEach"
        },
        {
            title: "2.8 Trial: Пробна дія",
            description: "## 🧪 Trial click\n\n**Теорія**: Перевірка, чи МОЖНА клікнути елемент, не виконуючи клік насправді. Корисно для валидації стану.\n\n**Приклад**:\n```typescript\nawait page.click('#submit', { trial: true });\n```\n\n### Завдання\nСпробуйте виконати trial click по кнопці.",
            code: imp + "test('trial', async ({ page }) => {\n  await page.click('button', { trial: true });\n});",
            options: [
                "{ trial: true }",
                "{ test: true }",
                "{ dryRun: true }",
                "{ check: true }"
            ],
            correctAnswer: "{ trial: true }"
        },
        {
            title: "2.9 test.step: Звіти",
            description: "## 🪜 Кроки (Steps)\n\n**Теорія**: Розбивайте тест на логічні кроки. Так у звіті буде видно: 'Login' ✅, 'Add to cart' ❌, замість просто 'Test Failed'.\n\n**Приклад**:\n```typescript\nawait test.step('Log in', async () => {\n  await page.click('button');\n});\n```\n\n### Завдання\nОгорніть ваші дії у `test.step`.",
            code: imp + "test('steps', async ({ page }) => {\n  await test.step('крок 1', async () => { });\n});",
            options: [
                "await test.step('name', async () => { ... })",
                "await test.describe('name', async () => { ... })",
                "await test.run('name', async () => { ... })",
                "await step('name', async () => { ... })"
            ],
            correctAnswer: "await test.step('name', async () => { ... })"
        },
        {
            title: "2.10 Screenshots: Докази",
            description: "## 📸 Скріншоти\n\n**Теорія**: Можна робити скріншоти всієї сторінки або окремого елемента.\n\n**Приклад**:\n```typescript\nawait page.screenshot({ path: 'page.png' });\n```\n\n### Завдання\nЗробіть скріншот сторінки.",
            code: imp + "test('screenshot', async ({ page }) => { });",
            options: [
                "await page.screenshot()",
                "await page.takeScreenshot()",
                "await page.snap()",
                "await page.capture()"
            ],
            correctAnswer: "await page.screenshot()"
        },
        {
            title: "2.11 Multi-page:Tabs",
            description: "## 🗂️ Вкладки (Tabs)\n\n**Теорія**: Коли посилання має `target='_blank'`, воно відкривається в новій вкладці. Playwright дозволяє перемикатися між ними.\n\n**Приклад**:\n```typescript\nconst [newPage] = await Promise.all([\n  context.waitForEvent('page'),\n  page.click('a[target=\"_blank\"]')\n]);\nawait newPage.waitForLoadState();\n```\n\n### Завдання\nКлікніть на посилання і отримайте нову сторінку.",
            code: imp + "test('tabs', async ({ context }) => { });",
            options: [
                "context.waitForEvent('page')",
                "page.waitForEvent('new-tab')",
                "browser.newPage()",
                "page.switchToTab()"
            ],
            correctAnswer: "context.waitForEvent('page')"
        },
        {
            title: "2.12 console: Логи",
            description: "## ⚠️ Консоль браузера\n\n**Теорія**: Ви можете слухати, що відбувається в консолі браузера (помилки, логи).\n\n**Приклад**:\n```typescript\npage.on('console', msg => console.log(msg.text()));\n```\n\n### Завдання\nПідпишіться на події консолі.",
            code: imp + "test('console', async ({ page }) => { });",
            options: [
                "page.on('console', msg => ...)",
                "page.listen('log', msg => ...)",
                "page.getLogs()",
                "console.read()"
            ],
            correctAnswer: "page.on('console', msg => ...)"
        },
        {
            title: "2.13 Annotations: Skip",
            description: "## ⏭️ Пропуск тестів\n\n**Теорія**: `test.skip()` або `test.fixme()`. Якщо функціонал зламаний або ще не готовий, не видаляйте тест, а скіпайте його.\n\n**Приклад**:\n```typescript\ntest('broken feature', async ({ page }) => {\n  test.fixme();\n});\n```\n\n### Завдання\nПозначте цей тест як `skip`.",
            code: imp + "test('skip', async ({ page }) => {\n  test.skip(true, 'Work in progress');\n});",
            options: [
                "test.skip(true, 'Reason')",
                "test.ignore()",
                "test.pass()",
                "test.comment('Reason')"
            ],
            correctAnswer: "test.skip(true, 'Reason')"
        },
        {
            title: "2.14 Grouping: Describe",
            description: "## 📦 Групування\n\n**Теорія**: `test.describe` об'єднує тести в логічні групи. Це також дозволяє застосовувати хуки лише до цієї групи.\n\n**Приклад**:\n```typescript\ntest.describe('Login flow', () => {\n  test('valid', ...);\n  test('invalid', ...);\n});\n```\n\n### Завдання\nСтворіть групу тестів.",
            code: imp + "test.describe('group', () => {\n  test('test 1', async ({ page }) => { });\n});",
            options: [
                "test.describe('group', ...)",
                "test.group('group', ...)",
                "test.suite('group', ...)",
                "describe('group', ...)"
            ],
            correctAnswer: "test.describe('group', ...)"
        },
        {
            title: "2.15 Soft Assertions",
            description: "## 🧽 М'які перевірки\n\n**Теорія**: Звичайний `expect` зупиняє тест при помилці. `expect.soft` записує помилку, але йде далі. Корисно, коли треба перевірити все: і колір, і текст, і розмір.\n\n**Приклад**:\n```typescript\nawait expect.soft(page.locator('#1')).toBeVisible();\nawait expect.soft(page.locator('#2')).toBeVisible();\n```\n\n### Завдання\nЗробіть м'яку перевірку.",
            code: imp + "test('soft', async ({ page }) => {\n  expect.soft(1).toBe(2);\n});",
            options: [
                "expect.soft(val).toBe(val)",
                "expect(val).soft.toBe(val)",
                "expect(val).toBe(val, { soft: true })",
                "softExpect(val).toBe(val)"
            ],
            correctAnswer: "expect.soft(val).toBe(val)"
        }
    ], "medium")

    // Рівень 3 (13 завдань)
    const [level3] = await db.insert(tracks).values({ title: "Рівень 3 — Advanced (Senior)", description: "Інтеграції та мокінг.", order: 3 }).returning()
    await addTasks(level3.id, [
        {
            title: "3.1 API: request.get()",
            description: "## ⚡ API Тести\n\n**Теорія**: Playwright вміє тестувати API прямо з коробки! Це супер швидко.\n\n**Приклад**:\n```typescript\nconst response = await request.get('/api/users');\nexpect(response.ok()).toBeTruthy();\n```\n\n### Завдання\nВиконайте GET запит до API.",
            code: imp + "test('api', async ({ request }) => { });",
            options: [
                "await request.get(url)",
                "await page.get(url)",
                "await fetch(url)",
                "await axis.get(url)"
            ],
            correctAnswer: "await request.get(url)"
        },
        {
            title: "3.2 API: POST запит",
            description: "## 📨 Створення даних\n\n**Теорія**: Ви можете створювати тестові дані через API за секунди перед запуском UI тесту.\n\n**Приклад**:\n```typescript\nawait request.post('/api/users', {\n  data: { name: 'Test User' }\n});\n```\n\n### Завдання\nВиконайте POST запит.",
            code: imp + "test('api post', async ({ request }) => { });",
            options: [
                "request.post(url, { data: ... })",
                "request.send(url, { body: ... })",
                "request.put(url, { json: ... })",
                "request.submit(url, ...)"
            ],
            correctAnswer: "request.post(url, { data: ... })"
        },
        {
            title: "3.3 StorageState: Кукі",
            description: "## 🍪 Сесії\n\n**Теорія**: `storageState` дозволяє зберегти кукі та localStorage у файл і потім завантажити їх, щоб не логінитись щоразу.\n\n**Приклад**:\n```typescript\ntest.use({ storageState: 'auth.json' });\n```\n\n### Завдання\nВикористайте збережений стан.",
            code: imp + "test('storage', async ({ context }) => { });",
            options: [
                "test.use({ storageState: 'auth.json' })",
                "test.load({ file: 'auth.json' })",
                "test.cookies('auth.json')",
                "test.session('auth.json')"
            ],
            correctAnswer: "test.use({ storageState: 'auth.json' })"
        },
        {
            title: "3.4 Mocking: Перехоплення",
            description: "## 🕸️ Мокінг мережі\n\n**Теорія**: Ви можете перехопити будь-який запит сторінки і скасувати його або змінити.\n\n**Приклад**:\n```typescript\n// Блокуємо картинки\nawait page.route('**/*.png', route => route.abort());\n```\n\n### Завдання\nПерехопіть запит.",
            code: imp + "test('mock', async ({ page }) => { });",
            options: [
                "await page.route(url, ...)",
                "await page.mock(url, ...)",
                "await page.intercept(url, ...)",
                "await network.stub(url, ...)"
            ],
            correctAnswer: "await page.route(url, ...)"
        },
        {
            title: "3.5 Mocking: JSON Body",
            description: "## 🛠️ Підміна відповіді\n\n**Теорія**: Можна змусити бекенд 'відповісти' те, що нам треба, навіть якщо бекенд не готовий.\n\n**Приклад**:\n```typescript\nawait page.route('/api/data', route => route.fulfill({\n  status: 200,\n  body: JSON.stringify({ items: [] })\n}));\n```\n\n### Завдання\nПідмініть відповідь сервера.",
            code: imp + "test('mock body', async ({ page }) => { });",
            options: [
                "route.fulfill({ body: ... })",
                "route.send({ data: ... })",
                "route.respond({ json: ... })",
                "route.mock({ response: ... })"
            ],
            correctAnswer: "route.fulfill({ body: ... })"
        },
        {
            title: "3.6 Custom Assertions",
            description: "## ⚖️ Власні перевірки\n\n**Теорія**: Можна написати свої матчери, наприклад `toBeWithinRange(1, 10)`.\n\n**Приклад**:\n```typescript\nexpect.extend({\n  toBeFoo(received) { /*...*/ }\n});\n```\n\n### Завдання\nОзнайомтесь з синтаксисом розширення expect.",
            code: imp + "expect.extend({ ... });",
            options: [
                "expect.extend({ ... })",
                "expect.addMatchers({ ... })",
                "expect.custom({ ... })",
                "expect.define({ ... })"
            ],
            correctAnswer: "expect.extend({ ... })"
        },
        {
            title: "3.7 Iframes",
            description: "## 🖼️ iFrames\n\n**Теорія**: iframe — це сторінка всередині сторінки. Звичайні локатори її не бачать. Треба використовувати `frameLocator`.\n\n**Приклад**:\n```typescript\nawait page.frameLocator('#my-frame').getByText('Hello').click();\n```\n\n### Завдання\nЗнайдіть елемент всередині iframe.",
            code: imp + "test('iframe', async ({ page }) => { });",
            options: [
                "page.frameLocator('#my-frame')",
                "page.locator('#my-frame').frame()",
                "page.frame('#my-frame')",
                "page.getFrame('#my-frame')"
            ],
            correctAnswer: "page.frameLocator('#my-frame')"
        },
        {
            title: "3.8 Dialogs",
            description: "## 🗨️ Alerts & Confirms\n\n**Теорія**: Системні діалоги (alert) блокують сторінку. Треба підписатися на подію `dialog` щоб їх закрити.\n\n**Приклад**:\n```typescript\npage.on('dialog', dialog => dialog.accept());\nawait page.getByRole('button').click(); // викликає алерт\n```\n\n### Завдання\nОбробіть alert.",
            code: imp + "page.on('dialog', d => d.accept());",
            options: [
                "page.on('dialog', dialog => ...)",
                "page.on('alert', alert => ...)",
                "page.handleDialog(dialog => ...)",
                "page.waitForDialog()"
            ],
            correctAnswer: "page.on('dialog', dialog => ...)"
        },
        {
            title: "3.9 expect.poll",
            description: "## 🔄 Polling\n\n**Теорія**: Якщо треба перевіряти щось, що не є звичайним DOM елементом (наприклад, запис в БД), використовуйте `expect.poll`.\n\n**Приклад**:\n```typescript\nawait expect.poll(async () => {\n  const res = await request.get('/status');\n  return res.status();\n}).toBe(200);\n```\n\n### Завдання\nВикористайте поллінг.",
            code: imp + "await expect.poll(() => ...)",
            options: [
                "await expect.poll(async () => ...)",
                "await expect.wait(async () => ...)",
                "await page.poll(async () => ...)",
                "await request.poll(async () => ...)"
            ],
            correctAnswer: "await expect.poll(async () => ...)"
        },
        {
            title: "3.10 Download",
            description: "## 📥 Скачування файлів\n\n**Теорія**: Playwright перехоплює подію `download`. Це краще, ніж шукати файл на диску.\n\n**Приклад**:\n```typescript\nconst [download] = await Promise.all([\n  page.waitForEvent('download'),\n  page.click('#download')\n]);\nawait download.saveAs('/path/file.pdf');\n```\n\n### Завдання\nСкачайте файл.",
            code: imp + "test('download', async ({ page }) => { });",
            options: [
                "page.waitForEvent('download')",
                "page.on('download')",
                "page.getDownload()",
                "browser.waitForDownload()"
            ],
            correctAnswer: "page.waitForEvent('download')"
        },
        {
            title: "3.11 Upload",
            description: "## 📤 Вивантаження\n\n**Теорія**: `setInputFiles` — найпростіший спосіб завантажити файл в `<input type='file'>`.\n\n**Приклад**:\n```typescript\nawait page.locator('input[type=file]').setInputFiles('file.txt');\n```\n\n### Завдання\nЗавантажте файл.",
            code: imp + "test('upload', async ({ page }) => { });",
            options: [
                "setInputFiles('path')",
                "uploadFile('path')",
                "fill('path')",
                "attachFile('path')"
            ],
            correctAnswer: "setInputFiles('path')"
        },
        {
            title: "3.12 Блокування мережі",
            description: "## ❌ Abort Requests\n\n**Теорія**: Як поведе себе сайт, якщо заблокувати скрипти аналітики або CSS?\n\n**Приклад**:\n```typescript\nawait page.route('**/*.css', route => route.abort());\n```\n\n### Завдання\nЗаблокуйте завантаження CSS.",
            code: imp + "test('abort', async ({ page }) => { });",
            options: [
                "route.abort()",
                "route.cancel()",
                "route.block()",
                "route.stop()"
            ],
            correctAnswer: "route.abort()"
        },
        {
            title: "3.13 Trace Viewer",
            description: "## 🕵️ Trace Viewer\n\n**Теорія**: Це машина часу для тестів. Ви бачите кожен крок, скріншот і мережевий запит у момент часу.\n\n**Приклад**:\n```typescript\n// Вмикається в конфігу або флагом --trace on\n```\n\n### Завдання\nЗапустіть тест з трейсом.",
            code: imp + "test('trace', async ({ page }) => { });",
            options: [
                "npx playwright test --trace on",
                "npx playwright test --debug",
                "npx playwright show-trace",
                "test.use({ trace: 'on' })"
            ],
            correctAnswer: "npx playwright test --trace on"
        },
        {
            title: "3.14 Clock: Час",
            description: "## ⏰ Керування часом\n\n**Теорія**: Не чекайте 5 хвилин, поки таймер закінчиться. Прокрутіть час вперед!\n\n**Приклад**:\n```typescript\nawait page.clock.install();\nawait page.clock.fastForward(10000);\n```\n\n### Завдання\nПрискорте час.",
            code: imp + "test('clock', async ({ page }) => {\n  await page.clock.install();\n});",
            options: [
                "await page.clock.fastForward(ms)",
                "await page.waitForTimeout(ms)",
                "await page.clock.tick(ms)",
                "await page.clock.jump(ms)"
            ],
            correctAnswer: "await page.clock.fastForward(ms)"
        },
        {
            title: "3.15 Permissions",
            description: "## 🔒 Дозволи\n\n**Теорія**: Геолокація, повідомлення, камера. Ви можете надати їх автоматично.\n\n**Приклад**:\n```typescript\nawait context.grantPermissions(['geolocation']);\n```\n\n### Завдання\nНадайте дозвіл на геолокацію.",
            code: imp + "test('geo', async ({ context }) => {\n  await context.grantPermissions(['geolocation']);\n});",
            options: [
                "context.grantPermissions(['geolocation'])",
                "page.setPermissions(['geolocation'])",
                "browser.grant(['geolocation'])",
                "context.allow(['geolocation'])"
            ],
            correctAnswer: "context.grantPermissions(['geolocation'])"
        },
        {
            title: "3.16 Visual Comparisons",
            description: "## 📸 Візуальні тести\n\n**Теорія**: Порівняння піксель-в-піксель. Ловить регресії верстки.\n\n**Приклад**:\n```typescript\nawait expect(page).toHaveScreenshot();\n```\n\n### Завдання\nПорівняйте скріншот.",
            code: imp + "test('visual', async ({ page }) => {\n  await expect(page).toHaveScreenshot();\n});",
            options: [
                "await expect(page).toHaveScreenshot()",
                "await expect(page).toMatchScreenshot()",
                "await page.compareScreenshot()",
                "await expect(page).toBeSameAsSnapshot()"
            ],
            correctAnswer: "await expect(page).toHaveScreenshot()"
        },
    ], "hard")

    // Рівень 4 (10 завдань)
    const [level4] = await db.insert(tracks).values({ title: "Рівень 4 — Best Practices (Lead)", description: "Інфраструктура та CI/CD.", order: 4 }).returning()
    await addTasks(level4.id, [
        {
            title: "4.1 Parallel Mode",
            description: "## 🚀 Паралелізація\n\n**Теорія**: За замовчуванням Playwright запускає файли паралельно, а тести всередині файлу — послідовно. Але можна змусити всі тести бігти одночасно!\n\n**Приклад**:\n```typescript\ntest.describe.configure({ mode: 'parallel' });\n```\n\n### Завдання\nНалаштуйте паралельний режим для файлу.",
            code: imp + "test.describe.configure({ mode: 'parallel' });",
            options: [
                "mode: 'parallel'",
                "mode: 'serial'",
                "mode: 'fully-parallel'",
                "mode: 'concurrent'"
            ],
            correctAnswer: "mode: 'parallel'"
        },
        {
            title: "4.2 Data-driven",
            description: "## 📊 Data-driven Testing\n\n**Теорія**: Не копіюйте тест 10 разів для різних даних. Використовуйте цикл.\n\n**Приклад**:\n```typescript\nconst cases = ['User 1', 'User 2'];\nfor (const name of cases) {\n  test(`create ${name}`, async ({ page }) => {\n    // ...\n  });\n}\n```\n\n### Завдання\nСтворіть тест, що запускається в циклі.",
            code: imp + "for (const c of cases) { test(`Case ${c}`, ...); }",
            options: [
                "for (const data of cases) { test(...) }",
                "test.each(cases)(...)",
                "cases.forEach(data => { test(...) })",
                "Все вищезгадане"
            ],
            correctAnswer: "Все вищезгадане"
        },
        {
            title: "4.3 Tags: @smoke",
            description: "## 🏷️ Теги (Tags)\n\n**Теорія**: Ви можете запускати тільки певні тести (наприклад, тільки критичні `smoke`).\n\n**Приклад**:\n```typescript\ntest('login page @smoke', async ({ page }) => { ... });\n// Запуск: npx playwright test --grep @smoke\n```\n\n### Завдання\nДодайте тег `@smoke` до тесту.",
            code: imp + "test('login @smoke', ...);",
            options: [
                "npx playwright test --grep @smoke",
                "npx playwright test --tag smoke",
                "npx playwright test --only smoke",
                "npx playwright test @smoke"
            ],
            correctAnswer: "npx playwright test --grep @smoke"
        },
        {
            title: "4.4 CI: YAML",
            description: "## ☁️ CI/CD (GitHub Actions)\n\n**Теорія**: Тести повинні запускатися автоматично при кожному пуші. Для цього використовують YAML конфіги.\n\n**Приклад**:\n```yaml\nname: Playwright Tests\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npx playwright test\n```\n\n### Завдання\nСкопіюйте приклад конфігу для GitHub Actions.",
            code: "# YAML code",
            options: [
                "runs-on: ubuntu-latest",
                "os: linux",
                "platform: github",
                "env: node"
            ],
            correctAnswer: "runs-on: ubuntu-latest"
        },
        {
            title: "4.5 .env: Секрети",
            description: "## 🔐 Змінні оточення (.env)\n\n**Теорія**: Ніколи не зберігайте паролі в коді! Використовуйте файл `.env`, який не потрапляє в Git.\n\n**Приклад**:\n```typescript\n// .env\n// PASSWORD=secret\n\nconsole.log(process.env.PASSWORD);\n```\n\n### Завдання\nВиведіть в консоль значення змінної середовища.",
            code: imp + "test('env', async () => { console.log(process.env.PASS); });",
            options: [
                "process.env.VAR_NAME",
                "env.VAR_NAME",
                "dotenv.get('VAR_NAME')",
                "process.getEnv('VAR_NAME')"
            ],
            correctAnswer: "process.env.VAR_NAME"
        },
        {
            title: "4.6 Custom Fixtures",
            description: "## 🛠️ Власні фікстури\n\n**Теорія**: Фікстури — це магія Playwright (`{ page }`, `{ request }`). Ви можете створити свої, наприклад `loggedInPage`, яка вже залогінена.\n\n**Приклад**:\n```typescript\nconst test = base.extend({\n  user: async ({}, use) => {\n    await use({ name: 'Bob' });\n  }\n});\n```\n\n### Завдання\nСтворіть просту фікстуру.",
            code: "import { test as base } from '@playwright/test';\n\nconst test = base.extend({ ... });",
            options: [
                "base.extend({ ... })",
                "base.use({ ... })",
                "base.add({ ... })",
                "base.createFixture({ ... })"
            ],
            correctAnswer: "base.extend({ ... })"
        },
        {
            title: "4.7 Reporters",
            description: "## 📊 Репортери\n\n**Теорія**: Playwright має гарні HTML звіти, але можна підключити Allure або Slack.\n\n**Приклад**:\n```typescript\n// playwright.config.ts\nreporter: [['html'], ['list']]\n```\n\n### Завдання\nНалаштуйте HTML репортер.",
            code: "// reporter config",
            options: [
                "reporter: 'html'",
                "reporter: 'list'",
                "reporter: [['html'], ['list']]",
                "Все вищезгадане"
            ],
            correctAnswer: "Все вищезгадане"
        },
        {
            title: "4.8 Retries",
            description: "## 🧪 Retries (Перезапуски)\n\n**Теорія**: Якщо тест впав випадково (flaky), Playwright може перезапустити його автоматично.\n\n**Приклад**:\n```typescript\n// playwright.config.ts\nretries: 2,\n```\n\n### Завдання\nВстановіть кількість перезапусків.",
            code: "// retries config",
            options: [
                "retries: 2",
                "retry: 2",
                "repeat: 2",
                "attempts: 2"
            ],
            correctAnswer: "retries: 2"
        },
        {
            title: "4.9 Global Setup",
            description: "## 🌏 Global Setup\n\n**Теорія**: Код, що виконується ОДИН раз перед усіма тестами (наприклад, створення тестової БД).\n\n**Приклад**:\n```typescript\n// global-setup.ts\nasync function globalSetup(config) {\n  await db.connect();\n}\n```\n\n### Завдання\nОпишіть функцію глобального налаштування.",
            code: "async function globalSetup() { ... }",
            options: [
                "export default async function globalSetup(config) { ... }",
                "export const setup = async () => { ... }",
                "module.exports = async () => { ... }",
                "export default globalSetup(config) { ... }"
            ],
            correctAnswer: "export default async function globalSetup(config) { ... }"
        },
        {
            title: "4.10 Projects",
            description: "## 🌐 Projects (Браузери)\n\n**Теорія**: Ви можете запускати тести в Chrome, Firefox, Safari (WebKit) та Mobile Safari одночасно через Проєкти.\n\n**Приклад**:\n```typescript\nprojects: [\n  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n  { name: 'webkit', use: { ...devices['Desktop Safari'] } },\n]\n```\n\n### Завдання\nНалаштуйте проект для WebKit.",
            code: "// projects config",
            options: [
                "{ name: 'webkit', use: { ...devices['Desktop Safari'] } }",
                "{ browser: 'safari' }",
                "{ name: 'safari' }",
                "{ use: { browserName: 'webkit' } }"
            ],
            correctAnswer: "{ name: 'webkit', use: { ...devices['Desktop Safari'] } }"
        },
        {
            title: "4.11 Serial Mode",
            description: "## ⛓️ Послідовний запуск (Serial)\n\n**Теорія**: Іноді тести залежать один від одного (Крок 1 -> Крок 2). Якщо Крок 1 впав, Крок 2 не має сенсу запускати.\n\n**Приклад**:\n```typescript\ntest.describe.configure({ mode: 'serial' });\n```\n\n### Завдання\nУвімкніть serial режим.",
            code: imp + "test.describe.configure({ mode: 'serial' });",
            options: [
                "mode: 'serial'",
                "mode: 'parallel'",
                "mode: 'sequence'",
                "mode: 'ordered'"
            ],
            correctAnswer: "mode: 'serial'"
        },
        {
            title: "4.12 Sharding",
            description: "## 🧩 Шардінг (Sharding)\n\n**Теорія**: Якщо у вас 1000 тестів, запуск на одній машині займе вічність. Шардінг дозволяє розбити їх на шматки (1/3, 2/3, 3/3) і запустити на різних серверах CI.\n\n**Приклад**:\n```bash\nnpx playwright test --shard=1/3\n```\n\n### Завдання\nНапишіть команду для запуску першого шарду з трьох.",
            code: "// npx playwright test --shard=1/3",
            options: [
                "--shard=1/3",
                "--split=1/3",
                "--parts=3",
                "--chunk=1"
            ],
            correctAnswer: "--shard=1/3"
        }
    ], "hard")

    // Рівень 5 (Challenge)
    const [level5] = await db.insert(tracks).values({ title: "Рівень 5 — Real World (Виклики)", description: "Реальні сценарії з багами та складнощами.", order: 5 }).returning()
    await addTasks(level5.id, [
        {
            title: "5.1 E-commerce: Кошик",
            description: "## 🛒 Сценарій покупки\n\n**Теорія**: Тестування повного шляху користувача (E2E) — це вершина піраміди тестування. Ми повинні перевірити, чи може користувач пройти весь шлях від вибору товару до покупки.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('buy item', async ({ page }) => {\n  await page.click('.add-to-cart');\n  await expect(page.locator('.cart-count')).toHaveText('1');\n});\n```\n\n### Завдання\n1. Відкрийте сторінку магазину.\n2. Додайте товар у кошик.\n3. Перейдіть до оформлення замовлення.\n4. Перевірте, що товар з'явився у списку замовлень.",
            code: imp + "test('e2e flow', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Реалізуйте сценарій покупки\n});",
            options: [
                "E2E (End-to-End)",
                "Unit Test",
                "Integration Test",
                "API Test"
            ],
            correctAnswer: "E2E (End-to-End)"
        },
        {
            title: "5.2 Flaky Test: Очікування",
            description: "## ⏳ Проблема нестабільних тестів\n\n**Теорія**: Елементи можуть з'являтися з затримкою або після анімації. Використання фіксованих пауз (`waitForTimeout`) — це погана практика, яка сповільнює тести.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('wait', async ({ page }) => {\n  // ✅ Правильно: авто-очікування Playwright\n  await expect(page.locator('.alert')).toBeVisible();\n});\n```\n\n### Завдання\nНатисніть кнопку, яка завантажує дані з випадковою затримкою, і перевірте результат БЕЗ використання `waitForTimeout`.",
            code: imp + "test('flaky fix', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть кнопку і дочекайтесь результату\n  // НІЯКИХ waitForTimeout!\n});",
            options: [
                "await expect(locator).toBeVisible()",
                "await page.waitForTimeout(5000)",
                "while(!visible) { ... }",
                "await page.pause(5000)"
            ],
            correctAnswer: "await expect(locator).toBeVisible()"
        },
        {
            title: "5.3 Shadow DOM",
            description: "## 👻 Shadow DOM\n\n**Теорія**: Деякі веб-компоненти (наприклад, відеоплеєри або віджети) приховують свої елементи в Shadow DOM. Playwright вміє пробивати його автоматично, але треба розуміти, як це працює.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('shadow', async ({ page }) => {\n  // Playwright автоматично знаходить елементи в Shadow DOM\n  // Вам не потрібні складні селектори\n  await page.fill('input-in-shadow', 'text');\n});\n```\n\n### Завдання\nЗнайдіть інпут, який знаходиться всередині Shadow Host, і введіть туди текст 'Hello Shadow'.",
            code: imp + "test('shadow dom', async ({ page }) => {\n  // Взаємодія з Shadow DOM\n});",
            options: [
                "Playwright автоматично шукає в Shadow DOM",
                "Треба додати спеціальний флаг { shadow: true }",
                "Shadow DOM недоступний для Playwright",
                "Треба використовувати XPath"
            ],
            correctAnswer: "Playwright автоматично шукає в Shadow DOM"
        },
        {
            title: "5.4 Authentication: Збереження стану",
            description: "## 🔑 Авторизація 1 раз на всі тести\n\n**Теорія**: Не логіньтесь у кожному тесті. Це довго і навантажує сервер. Використовуйте `storageState` для збереження куків.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('auth save', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('#email', 'user');\n  await page.fill('#pass', '123');\n  await page.click('#login');\n  \n  // Збереження стану\n  await page.context().storageState({ path: 'auth.json' });\n});\n```\n\n### Завдання\nНалаштуйте збереження куків після логіну у файл `user.json`.",
            code: imp + "test('auth save', async ({ page }) => {\n  // Виконайте вхід і збережіть storageState\n});",
            options: [
                "await page.context().storageState({ path: '...' })",
                "await context.cookies.save('...')",
                "await page.saveState('...')",
                "await auth.save('...')"
            ],
            correctAnswer: "await page.context().storageState({ path: '...' })"
        },
        {
            title: "5.5 API Mocking: 404 Error",
            description: "## 🛑 Тестування помилок\n\n**Теорія**: Як ваш фронтенд реагує, якщо сервер впав? Ми можемо симулювати це за допомогою перехоплення запитів.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('mock 404', async ({ page }) => {\n  // Перехоплення і підміна відповіді\n  await page.route('**/api/users', route => route.fulfill({ status: 404 }));\n  await page.reload();\n});\n```\n\n### Завдання\nПерехопіть запит до API і поверніть статус 500. Перевірте, що користувач бачить гарне повідомлення про помилку.",
            code: imp + "test('server error', async ({ page }) => {\n  // Змодулюйте помилку 500\n});",
            options: [
                "route.fulfill({ status: 500 })",
                "route.abort()",
                "route.continue()",
                "page.reload()"
            ],
            correctAnswer: "route.fulfill({ status: 500 })"
        },
    ], "hard")

    // Рівень 6 (Quiz)
    const [level6] = await db.insert(tracks).values({ title: "Рівень 6 — Quiz (Тести)", description: "Перевірка знань без написання коду.", order: 6 }).returning()
    await addTasks(level6.id, [
        {
            title: "6.1 Локатори",
            description: "## 🎯 Як знайти кнопку?\n\nЯкий локатор є **найкращим** для пошуку кнопки з текстом 'Save' згідно рекомендацій Playwright?",
            code: "",
            type: "quiz",
            options: [
                "page.locator('button.save')",
                "page.getByRole('button', { name: 'Save' })",
                "page.xpath('//button[text()=\"Save\"]')",
                "page.locator('#save-btn')"
            ],
            correctAnswer: "page.getByRole('button', { name: 'Save' })"
        },
        {
            title: "6.2 Auto-waiting",
            description: "## ⏳ Auto-waiting\n\nЩо робить Playwright перед тим, як клікнути по елементу?",
            code: "",
            type: "quiz",
            options: [
                "Нічого, просто клікає",
                "Чекає 5 секунд",
                "Перевіряє, чи елемент видимий, стабільний та доступний для подій",
                "Робить скріншот"
            ],
            correctAnswer: "Перевіряє, чи елемент видимий, стабільний та доступний для подій"
        },
        {
            title: "6.3 Codegen",
            description: "## 🎥 Codegen\n\nЯка команда запускає генератор тестів?",
            code: "",
            type: "quiz",
            options: [
                "npx playwright param",
                "npx playwright codegen",
                "npx playwright generate",
                "npx playwright record"
            ],
            correctAnswer: "npx playwright codegen"
        },
        {
            title: "6.4 isVisible vs toBeVisible",
            description: "## 👀 Перевірки\n\nУ чому різниця між `await page.locator('...').isVisible()` та `await expect(locator).toBeVisible()`?",
            code: "",
            type: "quiz",
            options: [
                "Різниці немає",
                "isVisible - повертає true/false миттєво, toBeVisible - чекає (retrying)",
                "isVisible - чекає, toBeVisible - миттєво",
                "toBeVisible використовується тільки для скріншотів"
            ],
            correctAnswer: "isVisible - повертає true/false миттєво, toBeVisible - чекає (retrying)"
        },
        {
            title: "6.5 Паралелізм",
            description: "## 🚀 Паралелізація\n\nСкільки воркерів (workers) Playwright використовує за замовчуванням?",
            code: "",
            type: "quiz",
            options: [
                "1",
                "Залежить від кількості ядер CPU (часто 50%)",
                "Завжди 4",
                "Безліч"
            ],
            correctAnswer: "Залежить від кількості ядер CPU (часто 50%)"
        }
    ], "easy")

    console.log("🏁✅ ОНОВЛЕННЯ ЗАВЕРШЕНЕ! 50 завдань з імпортами завантажені.")
}
