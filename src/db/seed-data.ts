import { db } from "./index";
import { tasks, tracks } from "./schema";
import { eq, and } from "drizzle-orm";

export async function seedDatabase() {
    console.log("💎 ЗАПУСК ПРЕМІУМ-ОНОВЛЕННЯ З ІМПОРТАМИ (50 УРОКІВ)...");

    const imp = "import { test, expect } from '@playwright/test';\n\n";
    const impPage = "import { test, expect, Page } from '@playwright/test';\n\n";

    // ==========================================
    // Рівень 1 — Base (15 завдань)
    // ==========================================
    const level1Data = {
        title: "Рівень 1 — Base (Основи майстерності)",
        description: "Фундамент автоматизації: від першого кліку до мобільної емуляції.",
        order: 1
    };

    await db.insert(tracks).values(level1Data)
        .onDuplicateKeyUpdate({
            set: {
                description: level1Data.description,
                order: level1Data.order
            }
        });
    
    const [level1] = await db.select().from(tracks).where(eq(tracks.title, level1Data.title));

    // Helper to add tasks to a track
    async function addTasks(trackId: number, tasksList: { title: string, description: string, code: string, type?: "code" | "quiz", options?: any, correctAnswer?: string }[], difficulty: "easy" | "medium" | "hard" = "easy") {
        let currentOrder = 1;
        for (const t of tasksList) {
            await db.insert(tasks).values({
                trackId,
                title: t.title,
                description: t.description,
                initialCode: t.code,
                difficulty,
                type: t.type || "code",
                options: t.options || null,
                correctAnswer: t.correctAnswer || null,
                order: currentOrder++
            }).onDuplicateKeyUpdate({
                set: {
                    difficulty,
                    type: t.type || "code",
                    options: t.options || null,
                    correctAnswer: t.correctAnswer || null,
                    order: currentOrder - 1
                }
            });
        }
    }

    // Level 1 Tasks
    await addTasks(level1.id, [
        {
            title: "1.1 Структура тесту: test()",
            description: "## 🧪 Перший тест\n\n**Теорія**: Будь-який тест у Playwright починається з виклику функції `test()`. Вона приймає назву тесту та асинхронну функцію, яка містить сам код тесту. Об'єкт `{ page }` — це ізольована вкладка браузера для цього конкретного тесту.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('мій перший тест', async ({ page }) => {\n  // код тесту\n});\n```\n\n### Завдання\nНапишіть порожній тест з назвою 'login test'.",
            code: imp + "// напишіть тест нижче",
            options: [
                "test('login test', async ({ page }) => { })",
                "it('login test', async () => { })",
                "describe('login test', () => { })",
                "test('login test', function(page) { })"
            ],
            correctAnswer: "test('login test', async ({ page }) => { })"
        },
        {
            title: "1.2 Навігація: page.goto()",
            description: "## 🧭 Відкриваємо сайт\n\n**Теорія**: Метод `page.goto(url)` наказує браузеру перейти за вказаною адресою і чекає, поки сторінка завантажиться (спрацює подія `load`). Це завжди перший крок у UI автотестах.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('open google', async ({ page }) => {\n  await page.goto('https://google.com');\n});\n```\n\n### Завдання\nВідкрийте сторінку `https://finmore.netlify.app/` всередині вашого тесту.",
            code: imp + "test('навігація', async ({ page }) => {\n  // Відкрийте finmore\n});",
            options: [
                "await page.goto('https://finmore.netlify.app/')",
                "await page.open('https://finmore.netlify.app/')",
                "await page.navigate('https://finmore.netlify.app/')",
                "await browser.goto('https://finmore.netlify.app/')"
            ],
            correctAnswer: "await page.goto('https://finmore.netlify.app/')"
        },
        {
            title: "1.3 Локатори: page.locator()",
            description: "## 🎯 Пошук елементів\n\n**Теорія**: Локатор — це спосіб знайти елемент на сторінці (кнопку, текст, картинку). `page.locator()` приймає звичайні CSS або XPath селектори. Playwright автоматично буде чекати появи елемента перед тим, як з ним взаємодіяти.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('locators', async ({ page }) => {\n  const btn = page.locator('.submit-btn'); // CSS\n  const input = page.locator('//input[@id=\"email\"]'); // XPath\n});\n```\n\n### Завдання\nЗнайдіть елемент з класом `.login-form` за допомогою CSS селектора.",
            code: imp + "test('locator', async ({ page }) => {\n  // Знайдіть форму\n});",
            options: [
                "page.locator('.login-form')",
                "page.find('.login-form')",
                "page.getElement('.login-form')",
                "page.css('.login-form')"
            ],
            correctAnswer: "page.locator('.login-form')"
        },
        {
            title: "1.4 Налагодження: test.only()",
            description: "## 🐞 Запуск одного тесту\n\n**Теорія**: Коли тестів багато, а ви працюєте лише над одним — можна додати `.only`. Тоді Playwright запустить лише його, ігноруючи всі інші тести у файлі.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest.only('focus this test', async ({ page }) => {\n  // лише цей тест запуститься\n});\n\ntest('this will be skipped', async ({ page }) => {\n  // ...\n});\n```\n\n### Завдання\nЗмініть тест так, щоб він запускався в режимі ONLY.",
            code: imp + "test('my test', async ({ page }) => {\n  // Зробіть так, щоб запускався лише цей тест\n});",
            options: [
                "test.only('my test', ...)",
                "test.focus('my test', ...)",
                "test.run('my test', ...)",
                "test.it('my test', ...)"
            ],
            correctAnswer: "test.only('my test', ...)"
        },
        {
            title: "1.5 Доступність: Перевірка Title",
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
            title: "1.6 getByRole: Пріоритет №1",
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
            title: "1.7 getByPlaceholder",
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
            title: "1.8 getByLabel: Зв'язок з текстом",
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
            title: "1.9 getByText: Повідомлення",
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
            title: "1.10 fill: Введення даних",
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
            title: "1.11 click: Взаємодія",
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
            title: "1.12 Чекбокси: check()",
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
            title: "1.13 clear: Очищення",
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
            title: "1.14 Радіокнопки",
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
            title: "1.15 selectOption: Списки",
            description: "## 📋 HTML Select\n\n**Теорія**: Спеціальний метод для вибору зі стандартних `<select>` дропдаунів.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest('select country', async ({ page }) => {\n  await page.locator('select#country').selectOption('Ukraine');\n});\n```\n\n### Завдання\nВиберіть 'Ukraine' зі списку країн.",
            code: imp + "test('select', async ({ page }) => { });",
            options: [
                "await page.selectOption('Ukraine')",
                "await page.fill('Ukraine')",
                "await page.click('Ukraine')",
                "await page.locator('select').selectOption('Ukraine')"
            ],
            correctAnswer: "await page.locator('select').selectOption('Ukraine')"
        }
    ], "easy");

    console.log("✅ СІД ЗАВЕРШЕНО УСПІШНО!");
}
