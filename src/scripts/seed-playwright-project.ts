import { db } from "@/db";
import { projectBoards, projectColumns, projectTasks, projectBoardRoles, roles } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    // 1. Check if board already exists
    const existing = await db.select().from(projectBoards).where(eq(projectBoards.title, "Playwright Платформа - TypeScript, Python, C#"));
    if (existing.length > 0) {
        console.log("Board already exists with ID:", existing[0].id);
        process.exit(0);
    }

    // 2. Insert the new project board
    const [result] = await db.insert(projectBoards).values({
        title: "Playwright Платформа - TypeScript, Python, C#",
        description: "Комплексний практичний проєкт автоматизації тестування EdTech платформи Playwright (itplatform-three.vercel.app). Завдання з E2E та API тестування трьома мовами (TypeScript, Python, C#): автентифікація, кабінет, сертифікація, мокування та візуальні регресії.",
    });

    // Fetch inserted board
    const [newBoard] = await db.select().from(projectBoards).where(eq(projectBoards.title, "Playwright Платформа - TypeScript, Python, C#"));
    console.log("Created Board:", newBoard);

    // 3. Insert default Kanban columns
    const columnsData = [
        { title: "To Do", order: 1, color: "bg-slate-500", boardId: newBoard.id },
        { title: "In Progress", order: 2, color: "bg-blue-500", boardId: newBoard.id },
        { title: "Review", order: 3, color: "bg-purple-500", boardId: newBoard.id },
        { title: "Done", order: 4, color: "bg-emerald-500", boardId: newBoard.id },
    ];
    await db.insert(projectColumns).values(columnsData);

    const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, newBoard.id));
    const todoColumn = columns.find(c => c.order === 1) || columns[0];

    // 4. Grant access to all platform roles (Demo, Base, Pro, B2B)
    const allRoles = await db.select().from(roles);
    for (const role of allRoles) {
        await db.insert(projectBoardRoles).values({
            boardId: newBoard.id,
            roleId: role.id,
        });
    }
    console.log(`Granted access to ${allRoles.length} roles`);

    // 5. Insert 10 high-quality realistic tasks
    const tasksData = [
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[TypeScript] E2E: Автентифікація та валідація форми входу",
            description: "Автоматизувати сценарій авторизації на Playwright (TypeScript):\n1. Відкрити сторінку `/login`\n2. Перевірити валідацію обов'язкових полів (порожній email та пароль)\n3. Ввести невірні креденшели та перевірити текст помилки\n4. Авторизуватися з валідними даними та перевірити успішний редирект на `/dashboard` з токеном у сесії.",
            priority: "critical" as const,
            status: "todo" as const,
            order: 1,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[TypeScript] POM: Page Object Model для Особистого Кабінету",
            description: "Спроєктувати клас `CabinetPage` згідно з патерном Page Object Model:\n1. Описати локатори для вкладок: Огляд, Сертифікати, Налаштування, Прогрес\n2. Реалізувати метод `selectTab(tabName)`\n3. Перевірити, що перехід за прямим посиланням `/cabinet?tab=certificates` автоматично відкриває розділ сертифікатів та шкалу кваліфікацій.",
            priority: "high" as const,
            status: "todo" as const,
            order: 2,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[TypeScript] E2E: Публічна верифікація сертифіката та LinkedIn лінк",
            description: "Написати E2E тест перевірки публічної сторінки сертифіката `/verify/sample`:\n1. Перевірити статус 'Офіційно підтверджено' / 'Зразок сертифіката'\n2. Перевірити правильність кваліфікаційного ступеня (Associate / Specialist / Architect)\n3. Перевірити кнопку копіювання лінка та атрибут `href` кнопки додавання в LinkedIn (перевірити query параметри: `name`, `certUrl`, `certId`).",
            priority: "high" as const,
            status: "todo" as const,
            order: 3,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[Python] API: Тестування ендпоінту сертифікатів та авторизації",
            description: "Використовуючи Python (`pytest` + `playwright.sync_api.APIRequestContext`):\n1. Виконати GET-запит до `/api/user/certificates` без cookie сесії -> очікувати статус 401 Unauthorized\n2. Виконати авторизований запит -> перевірити статус 200 OK\n3. Валідувати JSON-схему відповіді: масив `certificates`, поля `tier.id`, `completedTasks`, `percentage`, `isUnlocked`.",
            priority: "high" as const,
            status: "todo" as const,
            order: 4,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[Python] API: Валідація збереження контактних даних профілю",
            description: "Написати API тест для ендпоінту `POST /api/profile` на Python:\n1. Надіслати оновлені поля `firstName`, `lastName`, `phone`, `whatsapp`\n2. Перевірити збереження даних у БД та повернення оновленого об'єкта профілю\n3. Перевірити валідацію некоректного формату номеру телефону.",
            priority: "medium" as const,
            status: "todo" as const,
            order: 5,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[C# / .NET] E2E: Взаємодія з тренажером коду та симулятором",
            description: "Створити автотест на C# (.NET Playwright + NUnit / MSTest):\n1. Перейти до практичного завдання тренажера `/tasks/1`\n2. Знайти редактор коду Monaco/CodeMirror та заповнити тестовий код `await page.click('button');`\n3. Викликати комбінацію клавіш `Control+Enter` або натиснути кнопку 'Запустити тест'\n4. Перевірити появу консольного виводу в терміналі симулятора.",
            priority: "high" as const,
            status: "todo" as const,
            order: 6,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[TypeScript] Network Interception: Мокування оцінки та фідбеку ментора",
            description: "Використовуючи метод `page.route()` у Playwright:\n1. Перехопити запит `GET /api/user/notifications`\n2. Змокувати відповідь з новим сповіщенням від ментора: `{ id: 101, status: 'reviewed', mentorComment: 'Відмінна робота! Тест прийнято.' }`\n3. Перевірити появу спливаючого глобального банера сповіщення про схвалення ментором на дашборді.",
            priority: "critical" as const,
            status: "todo" as const,
            order: 7,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[Cross-Browser] Mobile: Адаптивність та тестування на смартфонах",
            description: "Налаштувати кросбраузерне тестування для мобільних девайсів:\n1. Запустити емуляцію `devices['iPhone 14 Pro']` та `devices['Pixel 7']`\n2. Перевірити, що верхня навігація ховається за бургер-меню\n3. Відкрити бургер-меню, перевірити перемикання мов (Укр / Eng / Рус) та переходи між сторінками.",
            priority: "medium" as const,
            status: "todo" as const,
            order: 8,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[TypeScript] Visual Testing: Snapshot-порівняння дашборду та шкали",
            description: "Налаштувати візуальне тестування знімками екрана (Snapshot Testing):\n1. Відкрити дашборд студента з фіксованим viewport 1280x800\n2. Заблокувати CSS анімації та курсор через `{ animations: 'disabled' }`\n3. Зняти скріншот картки 'Шкала кваліфікації та сертифікації' через `expect(page.locator('.milestone-card')).toHaveScreenshot('milestone.png')`.",
            priority: "medium" as const,
            status: "todo" as const,
            order: 9,
        },
        {
            boardId: newBoard.id,
            columnId: todoColumn.id,
            title: "[CI/CD] GitHub Actions: Пайплайн крос-мовної автоматизації",
            description: "Створити конфігурацію `.github/workflows/e2e-matrix.yml`:\n1. Матриця операційних систем (ubuntu-latest) та мовних стеків (Node 20, Python 3.11, .NET 8)\n2. Інсталяція браузерів через `npx playwright install --with-deps`\n3. Запуск E2E тестів у headless режимі та публікація HTML-звіту у GitHub Pages / Artifacts.",
            priority: "high" as const,
            status: "todo" as const,
            order: 10,
        },
    ];

    await db.insert(projectTasks).values(tasksData);
    console.log(`Inserted ${tasksData.length} tasks successfully!`);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
