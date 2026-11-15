import { db } from "@/db";
import { projectBoards, projectColumns, projectTasks, projectBoardRoles, roles } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const projectTitle = "Premier Online - Спортивні Події та Квитки (TypeScript, Python, C#)";
    const targetUrl = "https://www.premieronline.com";

    // 1. Check if board already exists
    const existing = await db.select().from(projectBoards).where(eq(projectBoards.title, projectTitle));
    let boardId: number;

    if (existing.length > 0) {
        console.log("Board already exists with ID:", existing[0].id);
        boardId = existing[0].id;
    } else {
        // 2. Insert new project board
        await db.insert(projectBoards).values({
            title: projectTitle,
            description: `Комерційний проєкт автоматизації тестування найбільшої платформи спортивних подій та продажу квитків на Близькому Сході (${targetUrl}). Розробка E2E та API автотестів на Playwright (TypeScript, Python, C#): пошук подій, фільтрація, реєстрація учасників, медичні вейвери, промокоди, мокування оплати та мобільна версія.`,
        });

        const [newBoard] = await db.select().from(projectBoards).where(eq(projectBoards.title, projectTitle));
        boardId = newBoard.id;
        console.log("Created Board:", newBoard);

        // 3. Insert default Kanban columns
        const columnsData = [
            { title: "To Do", order: 1, color: "bg-slate-500", boardId },
            { title: "In Progress", order: 2, color: "bg-blue-500", boardId },
            { title: "Review", order: 3, color: "bg-purple-500", boardId },
            { title: "Done", order: 4, color: "bg-emerald-500", boardId },
        ];
        await db.insert(projectColumns).values(columnsData);
    }

    const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, boardId));
    const todoColumn = columns.find(c => c.order === 1) || columns[0];
    const inProgressColumn = columns.find(c => c.order === 2) || columns[0];
    const reviewColumn = columns.find(c => c.order === 3) || columns[0];
    const doneColumn = columns.find(c => c.order === 4) || columns[0];

    // 4. Grant access to all platform roles (Demo, Base, Pro, B2B)
    const allRoles = await db.select().from(roles);
    for (const role of allRoles) {
        const existingRoleAccess = await db.select().from(projectBoardRoles)
            .where(eq(projectBoardRoles.boardId, boardId));
        if (!existingRoleAccess.some(r => r.roleId === role.id)) {
            await db.insert(projectBoardRoles).values({
                boardId,
                roleId: role.id,
            });
        }
    }
    console.log(`Granted access for board ${boardId} to all roles.`);

    // 5. Check if tasks already exist for this board
    const existingTasks = await db.select().from(projectTasks).where(eq(projectTasks.boardId, boardId));
    if (existingTasks.length > 0) {
        console.log(`Board ${boardId} already has ${existingTasks.length} tasks. Skipping task creation.`);
        process.exit(0);
    }

    // 6. Detailed Backlog of 12 Tasks
    const tasksData = [
        {
            boardId,
            columnId: todoColumn.id,
            title: "[TypeScript] E2E: Пошук та фільтрація подій за категоріями та датою",
            description: `**Мета завдання:**
Створити надійний E2E тест на Playwright (TypeScript) для каталогу подій (${targetUrl}/event-calendar).

**Вимоги та сценарій:**
1. Відкрити головну сторінку або сторінку календаря подій.
2. Ввести пошуковий запит (наприклад, "Run", "Marathon" або "Cycling") в поле пошуку.
3. Застосувати фільтр категорії спорту (Running / Cycling / Swimming).
4. Перевірити, що всі відображені картки відповідають вибраній категорії.
5. Застосувати сортування за датою (найближчі події) та перевірити правильність хронологічного порядку.
6. Перевірити роботу кнопки скидання фільтрів ("Clear Filters").

**Критерії прийомки (Acceptance Criteria):**
- Використано семантичні локатори: \`page.getByRole()\`, \`page.getByPlaceholder()\`.
- Відсутні жорсткі очікування (\`waitForTimeout\`).
- Тест стабільний та проходить у headless режимі.`,
            priority: "high" as const,
            order: 1,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[TypeScript] E2E: Валідація форми входу та відновлення пароля (Premier ID)",
            description: `**Мета завдання:**
Автоматизувати автентифікацію користувача в системі Premier Online за допомогою Playwright (TypeScript).

**Вимоги та сценарій:**
1. Перейти на сторінку логіну (\`${targetUrl}/login\` або модальне вікно Sign In).
2. Сценарій 1 (Негативний): Відправка порожньої форми — перевірити появу повідомлень про обов'язкові поля (Email / Password).
3. Сценарій 2 (Негативний): Введення невалідного email (без '@') та завідомо невірного паролю — перевірити повідомлення про помилку від сервера.
4. Сценарій 3: Перехід за посиланням "Forgot Password", введення валідного email та перевірка підтвердження про відправку листа для відновлення.
5. Сценарій 4 (Позитивний): Вхід з тестовими обліковими даними (через змінні середовища \`process.env.PREMIER_USER\`), перевірка появи меню профілю користувача.`,
            priority: "critical" as const,
            order: 2,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[TypeScript] E2E: Детальна сторінка події — вибір дистанції та перевірка матриці цін",
            description: `**Мета завдання:**
Перевірити логіку вибору дистанції/категорії та коректність відображення вартості участі.

**Вимоги та сценарій:**
1. Відкрити сторінку конкретної активної події (наприклад, марафон або тріатлон).
2. Перевірити наявність основних елементів: банер події, місце проведення (Google Maps / адреса), дата та час старту.
3. Знайти блок вибору дистанцій (наприклад: 3K, 5K, 10K, 21K).
4. Почергово обирати різні категорії:
   - Перевірити зміну ціни (AED / USD) та відображення зборів платформи (Service Fee).
   - Перевірити доступність кнопки "Register Now" для відкритих категорій.
   - Перевірити статус "Sold Out" або "Registration Closed", якщо ліміт вичерпано.`,
            priority: "high" as const,
            order: 3,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[Python] E2E: Реєстрація учасника, медичний вейвер та персональні дані",
            description: `**Мета завдання:**
Розробити E2E автотест на Python (\`pytest-playwright\`) для форми реєстрації учасника на спортивну подію.

**Вимоги та сценарій:**
1. Оформити реєстрацію одного учасника:
   - Заповнити ПІБ (First Name, Last Name), дату народження (Date of Birth) та стать.
   - Обрати національність зі спадного списку (Country of Residence / Nationality).
   - Заповнити обов'язковий контакт для екстрених випадків (Emergency Contact Name та Emergency Phone).
   - Обрати розмір футболки (T-Shirt Size).
2. Перевірити чекбокс згоди з правилами та медичним застереженням (Medical Disclaimer & Waiver).
3. Перевірити, що без встановлення чекбоксу вейверу кнопка переходу до оплати є заблокованою або показує попередження.`,
            priority: "critical" as const,
            order: 4,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[Python] E2E: Кошик та перерахунок ціни при застосуванні промокоду",
            description: `**Мета завдання:**
Перевірити на Python логіку застосування промокодів/ваучерів на знижку в кошику замовлення.

**Вимоги та сценарій:**
1. Додати обрану дистанцію до кошика (Cart/Checkout).
2. Зафіксувати початкову суму замовлення (Subtotal) та сервісний збір (Processing Fee).
3. Ввести недійсний промокод (наприклад, \`INVALID_CODE_999\`) — перевірити появу повідомлення "Invalid voucher or promo code".
4. Ввести валідний промокод зі знижкою (або мокнути відповідь API промокоду).
5. Перевірити динамічний перерахунок суми замовлення: \`Total = Subtotal - Discount + Processing Fee\`.
6. Перевірити видалення промокоду та повернення до початкової вартості.`,
            priority: "medium" as const,
            order: 5,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[Python] API: Валідація контракту пошуку подій та фільтрів (/api/events)",
            description: `**Мета завдання:**
Написати швидкі API тести на Python за допомогою Playwright \`api_request_context\`.

**Вимоги та сценарій:**
1. Надіслати GET запит до ендпоінту списку подій: \`GET /api/events\` або \`GET /events/ajax-search\`.
2. Перевірити HTTP Status Code 200 OK.
3. Валідувати структуру відповіді за допомогою Pydantic або jsonschema:
   - Кожен об'єкт події повинен містити поля: \`id\`, \`title\`, \`date_start\`, \`location\`, \`status\`, \`slug\`.
4. Перевірити фільтрацію за параметрами: \`?category=running&limit=10\`:
   - Відповідь повертає не більше 10 записів.
   - Усі повернуті події відповідають категорії running.
5. Перевірити час відповіді (Response Time < 1500ms).`,
            priority: "medium" as const,
            order: 6,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[C# / .NET] E2E: Збереження стану авторизації (StorageState) для тестів кабінету",
            description: `**Мета завдання:**
Створити на C# (.NET Playwright + NUnit) механізм глобальної автентифікації через збереження Cookies та LocalStorage (StorageState).

**Вимоги та сценарій:**
1. Створити Setup-тест, який авторизується в Premier Online один раз перед тестовим прогоном:
   - \`await page.Context.StorageStateAsync(new BrowserContextStorageStateOptions { Path = "auth.json" });\`
2. Налаштувати тестовий клас для кабінету учасника (\`My Events\` / \`Profile\`), який запускається з готовим \`auth.json\`.
3. Перевірити швидкий перехід до кабінету користувача без повторного проходження форми логіну.
4. Переконатися, що у разі простроченого токена система коректно редиректить на сторінку авторизації.`,
            priority: "high" as const,
            order: 7,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[C# / .NET] E2E: Мобільна адаптивність — тестування бургер-меню та тач-навігації",
            description: `**Мета завдання:**
Автоматизувати тестування мобільної версії інтерфейсу Premier Online на C#.

**Вимоги та сценарій:**
1. Налаштувати браузерний контекст з мобільним в'юпортом (iPhone 14 / Pixel 7: \`ViewportSize = new ViewportSize { Width = 390, Height = 844 }, IsMobile = true, HasTouch = true\`).
2. Відкрити головну сторінку: перевірити, що десктопне меню сховане, а кнопка "Гамбургер" видима.
3. Відкрити бічне бургер-меню: перевірити анімацію відкриття та доступність посилань (Events, Results, Calendar, My Premier).
4. Перевірити взаємодію з мобільним фільтром календаря (горизонтальний скрол тегів або випадаючий список дат).
5. Перевірити відсутність горизонтального скролу сторінки (No horizontal overflow).`,
            priority: "medium" as const,
            order: 8,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[TypeScript] API / Network: Мокування платіжного шлюзу та обробка збоїв транзакцій",
            description: `**Мета завдання:**
Використати Playwright Network Interception (\`page.route\`) для перевірки обробки платіжних помилок без реального списання коштів.

**Вимоги та сценарій:**
1. Дійшовши до кроку оплати замовлення, перехопити запит до платіжного шлюзу (наприклад, \`**/payment/process\` або \`**/checkout/confirm\`).
2. Сценарій 1 (Карта відхилена): Змокувати відповідь зі статусом 402 / \`{ status: "declined", reason: "insufficient_funds" }\`.
   - Перевірити показ користувачу зрозумілого алерта: "Платіж відхилено банком. Спробуйте іншу картку".
   - Перевірити, що дані замовлення та кошик не скинулися.
3. Сценарій 2 (Таймаут шлюзу): Змокувати затримку відповіді або статус 504 Gateway Timeout.
   - Перевірити наявність кнопки "Спробувати знову" та відсутність дублювання замовлення.`,
            priority: "high" as const,
            order: 9,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[TypeScript] Visual: Регресійне тестування головної сторінки та карток подій (toHaveScreenshot)",
            description: `**Мета завдання:**
Налаштувати візуальне порівняння скріншотів за допомогою Playwright Test Snapshot Testing.

**Вимоги та сценарій:**
1. Відкрити головну сторінку \`${targetUrl}\`.
2. Перед зняттям скріншоту:
   - Приховати динамічні банери та таймери зворотного відліку за допомогою \`mask: [page.locator('.countdown-timer, .hero-slider')]\`.
   - Дочекатися повного завантаження шрифтів (\`document.fonts.ready\`).
3. Виконати перевірку: \`await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixelRatio: 0.05 });\`.
4. Зняти окремий скріншот картки події у стані hover та порівняти з еталонним зображенням.`,
            priority: "low" as const,
            order: 10,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[Python] E2E: Кабінет учасника — перегляд куплених квитків та завантаження квитанції/QR-коду",
            description: `**Мета завдання:**
Автоматизувати перевірку особистого кабінету (\`My Premier\`) та операції завантаження файлів (Download).

**Вимоги та сценарій:**
1. Авторизуватися в системі та перейти в розділ "My Events / My Registrations".
2. Перевірити наявність купленого квитка в списку майбутніх подій (Upcoming).
3. Перевірити генерацію персонального стартового номера (Bib Number) та QR-коду для чек-іну.
4. Перевірити перехоплення події завантаження PDF квитанції (\`with page.expect_download() as download_info\`).
5. Зберегти завантажений файл та переконатися, що розмір файлу > 0 байт та розширення \`.pdf\`.`,
            priority: "medium" as const,
            order: 11,
        },
        {
            boardId,
            columnId: todoColumn.id,
            title: "[C# / .NET] E2E: Валідація мультивалютності, формату дат та локалізації",
            description: `**Мета завдання:**
Перевірити на C# коректність форматування регіональних параметрів (дати, валюта AED/USD, часові пояси Gulf Standard Time).

**Вимоги та сценарій:**
1. Перевірити відображення цін у національній валюті ОАЕ (AED - Dirhams).
2. Якщо на платформі доступний перемикач валюти (AED -> USD) або регіону:
   - Змінити валюту та перевірити автоматичний перерахунок цін на всіх картках подій.
3. Перевірити формат відображення дат:
   - Дати повинні бути чіткими та однозначними (наприклад: "28 Nov 2026", час старту "06:30 GST").
4. Перевірити відображення арабської та англійської локалей (RTL/LTR підтримка), якщо вибрано відповідну мову.`,
            priority: "low" as const,
            order: 12,
        },
    ];

    await db.insert(projectTasks).values(tasksData);
    console.log(`Successfully added ${tasksData.length} tasks to board "${projectTitle}" (ID: ${boardId})!`);
}

main().then(() => {
    console.log("Seeding finished successfully.");
    process.exit(0);
}).catch((err) => {
    console.error("Error seeding Premier Online project:", err);
    process.exit(1);
});
