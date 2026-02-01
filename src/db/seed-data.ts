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

    async function addTasks(trackId: number, data: any[], difficulty: "easy" | "medium" | "hard") {
        await db.insert(tasks).values(data.map((t, i) => ({
            trackId, title: t.title, description: t.description,
            difficulty, order: i + 1, initialCode: t.code, expectedResult: "Passed"
        })))
    }

    await addTasks(level1.id, [
        { title: "1.1 Доступність: Перевірка Title", description: "## Чому це важливо? 🏗️\nПерший крок будь-якого тесту — перевірка того, що ми успішно завантажили сайт. Заголовок (`title`) — це найшвидший спосіб підтвердити успішний навігатор.\n\n### Завдання\nПерейдіть на сторінку та перевірте title.", code: imp + "test('перевірка title', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Додайте перевірку title\n});" },
        { title: "1.2 getByRole: Пріоритет №1", description: "## Ролі елементів 🏆\n`getByRole` — найбільш надійний спосіб пошуку кнопок, заголовків та посилань.", code: imp + "test('role', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Знайдіть кнопку реєстрації\n});" },
        { title: "1.3 getByPlaceholder", description: "## Підказки в інпутах ✍️\nЗнайдіть поле за текстом-підказкою всередині.", code: imp + "test('placeholder', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Заповніть поле email\n});" },
        { title: "1.4 getByLabel: Зв'язок з текстом", description: "## Label-локатори 🏷️\nНайкращий спосіб для форм, де поля мають підписи.", code: imp + "test('label', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Знайдіть поле по підпису 'Email'\n});" },
        { title: "1.5 getByText: Повідомлення", description: "## Пошук по тексту 💬\nІдеально для перевірки текстів помилок.", code: imp + "test('text', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть вхід і перевірте текст помилки\n});" },
        { title: "1.6 fill: Введення даних", description: "## Метод fill() ⌨️\nСимулює введення тексту користувачем.", code: imp + "test('fill', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Введіть дані\n});" },
        { title: "1.7 click: Взаємодія", description: "## Кліки 🖱️\nБазовий метод для кнопок та посилань.", code: imp + "test('click', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Натисніть 'Увійти'\n});" },
        { title: "1.8 Чекбокси: check()", description: "## check() ✅\nВстановлює прапорець (навіть якщо він уже стоїть).", code: imp + "test('check', async ({ page }) => { });" },
        { title: "1.9 clear: Очищення", description: "## Навіщо clear()? 🧹\nВидалення старих даних перед новим вводом.", code: imp + "test('clear', async ({ page }) => { });" },
        { title: "1.10 Радіокнопки", description: "## Радіо-групи 📻\nВибір одного з багатьох.", code: imp + "test('radio', async ({ page }) => { });" },
        { title: "1.11 selectOption: Списки", description: "## HTML Select 📋\nВибір зі стандартних дропдаунів.", code: imp + "test('select', async ({ page }) => { });" },
        { title: "1.12 Hover: Наведення", description: "## Hover 🖱️\nДля випадаючих меню.", code: imp + "test('hover', async ({ page }) => { });" },
        { title: "1.13 Focus: Активність", description: "## focus() 🎯\nПеревірка активного елемента.", code: imp + "test('focus', async ({ page }) => { });" },
        { title: "1.14 Keyboard: Клавіші", description: "## Keyboard API ⌨️\nНатискання Enter, Escape тощо.", code: imp + "test('keyboard', async ({ page }) => { });" },
        { title: "1.15 Viewport: Mobile", description: "## Мобільна версія 📱\nЕмуляція пристроїв.", code: imp + "test('mobile', async ({ page }) => {\n  await page.setViewportSize({ width: 375, height: 667 });\n});" },
        { title: "1.16 Asserts: Visibility", description: "## Видимість 👀\nПеревірка того, що елемент видимий.", code: imp + "test('visible', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Перевірте видимість логотипу\n});" },
        { title: "1.17 Asserts: Text", description: "## Точний текст 📝\nПеревірка тексту елемента.", code: imp + "test('text', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Перевірте заголовок сторінки\n});" },
        { title: "1.18 Navigation: Reload", description: "## Навігація 🧭\nПерезавантаження сторінки.", code: imp + "test('reload', async ({ page }) => {\n  await page.goto('https://finmore.netlify.app/');\n  // Перезавантажте сторінку\n});" }
    ], "easy")

    // Рівень 2 (12 завдань)
    const [level2] = await db.insert(tracks).values({ title: "Рівень 2 — Structure (Архітектор)", description: "Створення масштабованих систем.", order: 2 }).returning()
    await addTasks(level2.id, [
        { title: "2.1 POM: Оголошення властивостей", description: "## TypeScript у POM 🏗️\nДодайте типи властивостей.", code: impPage + "class LoginPage {\n  readonly page: Page;\n  constructor(page: Page) { this.page = page; }\n}" },
        { title: "2.2 POM: Логічні методи", description: "## Дії класу 🧩\nМетод login() замість набору кліків.", code: impPage + "test('pom', async ({ page }) => {\n  // Використайте клас LoginPage\n});" },
        { title: "2.3 Організація: CONFIG", description: "## Константи 🚫\nВинесіть URL та пошти.", code: imp + "const URL = 'https://finmore.netlify.app/';" },
        { title: "2.4 Унікалізація даних", description: "## Динамічні дані 🌈\nСтворення унікальних email.", code: imp + "test('unique', async () => {\n  const email = `test_${Date.now()}@mail.com`;\n});" },
        { title: "2.5 Force: Форсований клік", description: "## Force click 🧱\nКоли елемент перекрито.", code: imp + "test('force', async ({ page }) => {\n  await page.click('button', { force: true });\n});" },
        { title: "2.6 waitForSelector", description: "## Очікування ⏳\nКоли auto-waiting не вистачає.", code: imp + "test('wait', async ({ page }) => { });" },
        { title: "2.7 beforeEach: Чистота", description: "## Хуки 🧹\nСпільна підготовка.", code: imp + "test.beforeEach(async ({ page }) => { });" },
        { title: "2.8 Trial: Пробна дія", description: "## Trial click 🧪\nПеревірка доступності.", code: imp + "test('trial', async ({ page }) => {\n  await page.click('button', { trial: true });\n});" },
        { title: "2.9 test.step: Звіти", description: "## Кроки 🪜\nДля зручного дебагу.", code: imp + "test('steps', async ({ page }) => {\n  await test.step('крок 1', async () => { });\n});" },
        { title: "2.10 Screenshots: Докази", description: "## Скріншоти 📸", code: imp + "test('screenshot', async ({ page }) => { });" },
        { title: "2.11 Multi-page:Tabs", description: "## Tabs 🗂️\nНові вікна.", code: imp + "test('tabs', async ({ context }) => { });" },
        { title: "2.12 console: Логи", description: "## Консоль ⚠️\nПерехоплення помилок JS.", code: imp + "test('console', async ({ page }) => { });" },
        { title: "2.13 Annotations: Skip", description: "## Пропуск тестів ⏭️\nКоли тест ще не готовий.", code: imp + "test('skip', async ({ page }) => {\n  test.skip(true, 'Work in progress');\n});" },
        { title: "2.14 Grouping: Describe", description: "## Групування 📦\nОб'єднання схожих тестів.", code: imp + "test.describe('group', () => {\n  test('test 1', async ({ page }) => { });\n});" },
        { title: "2.15 Soft Assertions", description: "## Soft Assertions 🧽\nНе зупиняти тест при помилці.", code: imp + "test('soft', async ({ page }) => {\n  expect.soft(1).toBe(2);\n});" }
    ], "medium")

    // Рівень 3 (13 завдань)
    const [level3] = await db.insert(tracks).values({ title: "Рівень 3 — Advanced (Senior)", description: "Інтеграції та мокінг.", order: 3 }).returning()
    await addTasks(level3.id, [
        { title: "3.1 API: request.get()", description: "## API Тести ⚡", code: imp + "test('api', async ({ request }) => { });" },
        { title: "3.2 API: POST запит", description: "## Створення даних 📨", code: imp + "test('api post', async ({ request }) => { });" },
        { title: "3.3 StorageState: Кукі", description: "## Сесії 🍪", code: imp + "test('storage', async ({ context }) => { });" },
        { title: "3.4 Mocking: Перехоплення", description: "## page.route() 🕸️\nСимулюйте 500 помилку.", code: imp + "test('mock', async ({ page }) => { });" },
        { title: "3.5 Mocking: JSON Body", description: "## fulfill 🛠️\nПідміна даних.", code: imp + "test('mock body', async ({ page }) => { });" },
        { title: "3.6 Custom Assertions", description: "## Розширення ⚖️", code: imp + "expect.extend({ ... });" },
        { title: "3.7 Iframes", description: "## iFrames 🖼️", code: imp + "test('iframe', async ({ page }) => { });" },
        { title: "3.8 Dialogs", description: "## Alerts 🗨️", code: imp + "page.on('dialog', d => d.accept());" },
        { title: "3.9 expect.poll", description: "## Polling 🔄", code: imp + "await expect.poll(() => ...)" },
        { title: "3.10 Download", description: "## Скачування 📥", code: imp + "test('download', async ({ page }) => { });" },
        { title: "3.11 Upload", description: "## Вивантаження 📤", code: imp + "test('upload', async ({ page }) => { });" },
        { title: "3.12 Блокування мережі", description: "## abort() ❌", code: imp + "test('abort', async ({ page }) => { });" },
        { title: "3.13 Trace Viewer", description: "## Трейси 🕵️", code: imp + "test('trace', async ({ page }) => { });" },
        { title: "3.14 Clock: Час", description: "## Керування часом ⏰\nПрискорення таймерів.", code: imp + "test('clock', async ({ page }) => {\n  await page.clock.install();\n});" },
        { title: "3.15 Permissions", description: "## Дозволи 🔒\nГеолокація та сповіщення.", code: imp + "test('geo', async ({ context }) => {\n  await context.grantPermissions(['geolocation']);\n});" },
        { title: "3.16 Visual Comparisons", description: "## Скріншоти 📸\nПорівняння пікселів.", code: imp + "test('visual', async ({ page }) => {\n  await expect(page).toHaveScreenshot();\n});" }
    ], "hard")

    // Рівень 4 (10 завдань)
    const [level4] = await db.insert(tracks).values({ title: "Рівень 4 — Best Practices (Lead)", description: "Інфраструктура та CI/CD.", order: 4 }).returning()
    await addTasks(level4.id, [
        { title: "4.1 Parallel Mode", description: "## Паралелізація 🚀", code: imp + "test.describe.configure({ mode: 'parallel' });" },
        { title: "4.2 Data-driven", description: "## Цикли 📊", code: imp + "for (const c of cases) { test(`Case ${c}`, ...); }" },
        { title: "4.3 Tags: @smoke", description: "## Теги 🏷️", code: imp + "test('login @smoke', ...);" },
        { title: "4.4 CI: YAML", description: "## CI/CD ☁️", code: "# YAML code" },
        { title: "4.5 .env: Секрети", description: "## .env 🔐", code: imp + "test('env', async () => { console.log(process.env.PASS); });" },
        { title: "4.6 Custom Fixtures", description: "## Power 🛠️", code: "import { test as base } from '@playwright/test';\n\nconst test = base.extend({ ... });" },
        { title: "4.7 Reporters", description: "## Звіти 📊", code: "// reporter config" },
        { title: "4.8 Retries", description: "## Flaky tests 🧪", code: "// retries config" },
        { title: "4.9 Global Setup", description: "## Setup 🌏", code: "async function globalSetup() { ... }" },
        { title: "4.10 Projects", description: "## Projects 🌐", code: "// projects config" },
        { title: "4.11 Serial Mode", description: "## Послідовний запуск ⛓️", code: imp + "test.describe.configure({ mode: 'serial' });" },
        { title: "4.12 Sharding", description: "## Шардінг 🧩\nРозподіл тестів на машини.", code: "// npx playwright test --shard=1/3" }
    ], "hard")

    console.log("🏁✅ ОНОВЛЕННЯ ЗАВЕРШЕНЕ! 50 завдань з імпортами завантажені.")
}
