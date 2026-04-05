import { db } from "./index";
import { tasks, tracks } from "./schema";
import { eq, and } from "drizzle-orm";

export async function seedDatabase() {
    console.log("💎 ЗАПУСК ПРЕМІУМ-ОНОВЛЕННЯ З ІМПОРТАМИ (50 УРОКІВ)...");

    const imp = "import { test, expect } from '@playwright/test';\n\n";
    const impPage = "import { test, expect, Page } from '@playwright/test';\n\n";

    // ==========================================
    // Рівень 0 — Основи TypeScript
    // ==========================================
    const level0Data = {
        title: "Рівень 0 — Основи TypeScript",
        description: "Базові концепції мови, необхідні для швидкого старту з автотестами.",
        order: 1
    };

    await db.insert(tracks).values(level0Data)
        .onDuplicateKeyUpdate({
            set: {
                description: level0Data.description,
                order: level0Data.order
            }
        });
    
    const [level0] = await db.select().from(tracks).where(eq(tracks.title, level0Data.title));

    // ==========================================
    // Рівень 1 — Base (15 завдань)
    // ==========================================
    const level1Data = {
        title: "Рівень 1 — Base (Основи майстерності)",
        description: "Фундамент автоматизації: від першого кліку до мобільної емуляції.",
        order: 2
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
                    description: t.description,
                    initialCode: t.code,
                    difficulty,
                    type: t.type || "code",
                    options: t.options || null,
                    correctAnswer: t.correctAnswer || null,
                    order: currentOrder - 1
                }
            });
        }
    }

    // Level 0 Tasks
    await addTasks(level0.id, [
        {
            title: "0.1 Змінні: const та let",
            description: "## 📦 Контейнери для даних\n\n**Теорія**: В TypeScript (як і в JavaScript) значення зберігаються у змінних. Уявіть змінну як коробку з наклейкою (назвою).\n\n- `const` (від *constant*): використовується для значень, які **не будуть змінюватись**. Це ваш основний інструмент. Наприклад, посилання на сайт, селектор кнопки або назва тесту.\n- `let`: використовується, коли ви точно знаєте, що значення **буде перезаписане** пізніше (наприклад, лічильник спроб).\n\n**Приклад**:\n```typescript\nconst baseUrl = 'https://it-playwright.com'; // Завжди одне й те саме\nlet loginAttempts = 0;\nloginAttempts = 1; // ОК\n```\n\n### Завдання\nЯке ключове слово слід використовувати для створення змінної, яку ми НЕ плануємо змінювати в майбутньому?",
            code: "const answer = \"\"; // Впишіть const або let",
            options: ["const", "let", "var", "fixed"],
            correctAnswer: "const"
        },
        {
            title: "0.2 Типи даних: String & Number",
            description: "## 🧩 Рядки та Числа\n\n**Теорія**: TypeScript допомагає уникати помилок, розрізняючи типи даних.\n\n- `string` (рядок): будь-який текст у лапках (`'текст'`, `\"текст\"` або `` `текст` ``). Використовується для адрес сайтів, імен користувачів та паролів.\n- `number` (число): цілі числа або дроби (`42`, `3.14`). Використовується для таймаутів, кількості елементів або координат.\n\n**Приклад**:\n```typescript\nconst email: string = \"user@test.com\";\nconst timeout: number = 5000;\n```\n\n### Завдання\nЯким типом даних є значення `\"12345\"` (у лапках)?",
            code: "const value = \"12345\"; // Який це тип?",
            options: ["string", "number", "boolean", "object"],
            correctAnswer: "string"
        },
        {
            title: "0.3 Логічний тип: Boolean",
            description: "## 💡 Так чи Ні?\n\n**Теорія**: Тип `boolean` має лише два значення: `true` (істина) та `false` (хиба). \n\nВ автотестах це критично важливо для перевірок (Assertions). Наприклад: \"Чи кнопка видима?\" — відповідь буде `true` або `false`.\n\n**Приклад**:\n```typescript\nconst isVisible = true;\nconst isError = false;\n```\n\n### Завдання\nВиберіть значення, яке відповідає логічному типу Boolean:",
            code: "// Виберіть правильний варіант",
            options: ["true", "\"true\"", "1", "null"],
            correctAnswer: "true"
        },
        {
            title: "0.4 Асинхронність: await",
            description: "## ⏳ Чекаємо на результат\n\n**Теорія**: Більшість дій у Playwright (перехід на сторінку, клік, пошук елемента) є **асинхронними**. Це означає, що вони потребують часу на виконання (інтернет завантажується, браузер малює кнопку).\n\nЗавдяки слову `await` ми кажемо коду: \"Зупинись тут і почекай, поки ця дія завершиться, перш ніж йти до наступного рядка\".\n\n**Приклад**:\n```typescript\nawait page.goto('https://test.com');\nawait page.click('.login-button');\n```\n\n### Завдання\nЩо трапиться, якщо забути написати `await` перед важливою дією у Playwright?",
            code: "// Поміркуйте над відповіддю",
            options: [
                "Тест піде далі, не дочекавшись завершення дії, що призведе до помилки",
                "Браузер автоматично зупиниться сам",
                "Код взагалі не запуститься",
                "Нічого, це просто необов'язкове слово"
            ],
            correctAnswer: "Тест піде далі, не дочекавшись завершення дії, що призведе до помилки"
        },
        {
            title: "0.5 Функції та async",
            description: "## ⚙️ Асинхронні функції\n\n**Теорія**: Якщо ми хочемо використовувати `await` всередині функції, ми **обов'язково** маємо позначити саму функцію словом `async`.\n\nУ Playwright кожен тест — це асинхронна функція.\n\n**Приклад**:\n```typescript\ntest('мій тест', async ({ page }) => {\n  // тепер тут можна використовувати await\n});\n```\n\n### Завдання\nЯке ключове слово робить функцію асинхронною?",
            code: "const myFunc = () => { }; // Напишіть слово зліва від дужок",
            options: ["async", "await", "sync", "promise"],
            correctAnswer: "async"
        },
        {
            title: "0.6 Об'єкти: Основи",
            description: "## 📦 Зберігання складних даних\n\n**Теорія**: Об'єкт (`Object`) дозволяє групувати пов'язані дані в одну структуру \"ключ: значення\". Об'єкти оточені фігурними дужками `{ }`.\n\nВ тестах ми постійно використовуємо об'єкти для конфігурації (налаштувань).\n\n**Приклад**:\n```typescript\nconst user = {\n  name: 'Ivan',\n  email: 'ivan@test.com',\n  age: 25\n};\n\nconsole.log(user.name); // Виведе 'Ivan'\n```\n\n### Завдання\nЯк отримати доступ до властивості `email` об'єкта `user`?",
            code: "const user = { email: 'test@test.com' };\n// Ваша відповідь:",
            options: ["user.email", "user['email']", "Обидва варіанти правильні", "user->email"],
            correctAnswer: "Обидва варіанти правильні"
        },
        {
            title: "0.7 Деструктуризація",
            description: "## 🎁 Розпаковка об'єктів\n\n**Теорія**: Деструктуризація — це зручний спосіб витягнути конкретні значення з об'єкта одразу в змінні.\n\nЦе саме те, що ми робимо в кожному тесті Playwright: `test('назва', async ({ page }) => ...)` — ми витягуємо `page` з об'єкта налаштувань тесту.\n\n**Приклад**:\n```typescript\nconst config = { url: 'website.com', browser: 'chromium' };\nconst { url } = config; // Створює зміну url зі значенням 'website.com'\n```\n\n### Завдання\nЯка конструкція витягне властивість `page` з об'єкта?",
            code: "const options = { page: 'tab', user: 'admin' };\n// Виберіть правильну деструктуризацію:",
            options: ["const { page } = options;", "const [ page ] = options;", "const page = options{page};", "extract page from options;"],
            correctAnswer: "const { page } = options;"
        },
        {
            title: "0.8 Масиви: Списки даних",
            description: "## 📜 Списки (Arrays)\n\n**Теорія**: Масив — це впорядкований список елементів. Масиви записуються у квадратних дужках `[ ]`. Елементи розділяються комами.\n\nМасиви корисні, коли вам треба протестувати відразу багато значень (наприклад, список товарів або назви категорій).\n\n**Приклад**:\n```typescript\nconst fruits = ['apple', 'banana', 'orange'];\nconsole.log(fruits[0]); // Перший елемент (рахуємо з НУЛЯ!)\n```\n\n### Завдання\nЯкий індекс (номер) має **перший** елемент у будь-якому масиві?",
            code: "const list = ['A', 'B', 'C'];\n// Який номер у елемента 'A'?",
            options: ["0", "1", "-1", "A"],
            correctAnswer: "0"
        },
        {
            title: "0.9 Шаблонні рядки (Template Literals)",
            description: "## 🔗 Збирання рядків\n\n**Теорія**: Замість того, щоб склеювати текст плюсиками (`'Hello ' + name`), краще використовувати зворотні лапки (бек-тіки) `` ` `` та конструкцію `${...}`.\n\nЦе незамінно, коли ви будуєте динамічні селектори або URL (наприклад, посилання на конкретний товар).\n\n**Приклад**:\n```typescript\nconst id = 123;\nconst url = `https://shop.com/product/${id}`;\n// Отримаємо: https://shop.com/product/123\n```\n\n### Завдання\nЯкий символ використовується для створення шаблонного рядка (Template Literal)?",
            code: "// Оберіть символ",
            options: ["Зворотна лапка `", "Звичайна лапка '", "Подвійна лапка \"", "Дужки ( )"],
            correctAnswer: "Зворотна лапка `"
        },
        {
            title: "0.10 Порівняння: === та !==",
            description: "## ⚖️ Оператори порівняння\n\n**Теорія**: В TypeScript для перевірки на рівність ми майже завжди використовуємо **суворе порівняння** `===` (три дорівнює). Воно перевіряє і значення, і тип.\n\n- `===`: чи дорівнює?\n- `!==`: чи не дорівнює?\n\n**Приклад**:\n```typescript\nconst count = 5;\nconsole.log(count === 5); // true\nconsole.log(count === '5'); // false (бо типи різні)\n```\n\n### Завдання\nЯкий оператор використовується для перевірки, що два значення НЕ дорівнюють одне одному?",
            code: "// Виберіть оператор:",
            options: ["!==", "!=", "=", "=="],
            correctAnswer: "!=="
        },
        {
            title: "0.11 Умови: if / else",
            description: "## 🛣️ Вибір шляху\n\n**Теорія**: Конструкція `if` дозволяє виконувати код лише тоді, коли умова істинна (`true`). Якщо умова хибна, можна використати `else` (інакше).\n\nВ тестах це допомагає обробляти різні стани (наприклад, чи закритий банер).\n\n**Приклад**:\n```typescript\nconst balance = 100;\n\nif (balance > 0) {\n  console.log('Купуємо!');\n} else {\n  console.log('Грошей немає');\n}\n```\n\n### Завдання\nЯкий блок коду виконається, якщо умова в `if` буде **false**?",
            code: "// Оберіть відповідь",
            options: ["Блок else", "Блок if", "Весь код зупиниться з помилкою", "Обидва блоки одночасно"],
            correctAnswer: "Блок else"
        },
        {
           title: "0.12 Стрілочні функції (Arrow Functions)",
           description: "## 🏹 Сучасний синтаксис\n\n**Теорія**: Це скорочений і найсучасніший спосіб написання функцій. Виглядає як `() => { ... }`.\n\nМайже всі функції, які ви побачите в документації Playwright — це саме \"стрілочні\" функції.\n\n**Приклад**:\n```typescript\nconst sayHi = () => {\n  console.log('Привіт!');\n};\n```\n\n### Завдання\nЗнайдіть приклад правильної стрілочної функції:",
           code: "// Виберіть варіант",
           options: ["(arg) => { }", "function => { }", "arg -> { }", "=> (arg) { }"],
           correctAnswer: "(arg) => { }"
        },
        {
            title: "0.13 Опційне ланцюгування (?.)",
            description: "## 🛡️ Захист від помилок\n\n**Теорія**: Оператор `?.` — це ваш супергерой. Він зупиняє виконання і повертає `undefined`, якщо якась частина шляху не існує, замість того, щоб \"вбити\" тест помилкою \"cannot read property of undefined\".\n\n**Приклад**:\n```typescript\nconst user = { profile: null };\nconsole.log(user.profile?.name); \n// Просто поверне undefined, тест НЕ впаде!\n```\n\n### Завдання\nЯк безпечно звернутися до властивості `title` об'єкта `post`, якщо `post` може бути порожнім?",
            code: "// Ваша відповідь:",
            options: ["post?.title", "post.title", "post!!!title", "post?title"],
            correctAnswer: "post?.title"
        },
        {
            title: "0.14 Обробка помилок: try / catch",
            description: "## 🚑 План Б\n\n**Теорія**: Блок `try` містить код, який може спричинити помилку. Якщо помилка стається, виконання перестрибує в блок `catch`, де її можна обробити, не зупиняючи всю програму.\n\n**Приклад**:\n```typescript\ntry {\n  // Пробуємо щось складне\n  await page.click('.hidden-btn');\n} catch (error) {\n  console.log('Кнопку не знайшли, але тест іде далі');\n}\n```\n\n### Завдання\nЯкий блок коду спрацює тільки у разі виникнення помилки?",
            code: "// Оберіть блок",
            options: ["catch", "try", "finally", "error"],
            correctAnswer: "catch"
        },
        {
            title: "0.15 Імпорт: import",
            description: "## 📦 Підключення інструментів\n\n**Теорія**: Щоб використовувати функції з інших бібліотек (наприклад, сам `test` з Playwright), нам треба їх імпортувати.\n\nЦе завжди стоїть на першому рядку файлу.\n\n**Приклад**:\n```typescript\nimport { test, expect } from '@playwright/test';\n```\n\n### Завдання\nДе зазвичай розташовуються інструкції `import` у файлі з кодом?",
            code: "// Виберіть місце",
            options: ["На самому початку файлу", "В кінці тесту", "Всередині блоку async", "Після кожного кліку"],
            correctAnswer: "На самому початку файлу"
        }
    ], "easy");

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
