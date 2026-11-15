import { db } from "../db";
import { projectBoards, projectColumns, projectTasks } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const boardId = 4;
    const targetUrl = "https://www.premieronline.com";

    // 1. Check board
    const [board] = await db.select().from(projectBoards).where(eq(projectBoards.id, boardId));
    if (!board) {
        console.error("Board 4 not found!");
        process.exit(1);
    }
    console.log("Updating board with bilingual Jira tasks:", board.title);

    // 2. Fetch columns
    const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, boardId));
    const todoCol = columns.find(c => c.order === 1) || columns[0];

    // 3. Delete existing tasks for Board 4
    await db.delete(projectTasks).where(eq(projectTasks.boardId, boardId));
    console.log("Cleared old tasks for board 4.");

    // 4. Detailed Enterprise Bilingual POM Tasks
    const pomTasks = [
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] Архітектура: Створення BasePage та інтеграція Custom Fixtures для Page Objects",
            titleEn: "[TypeScript] Architecture: Implement BasePage & Custom Test Fixtures for Page Objects",
            description: `**Мета завдання:**
Створити фундамент тестового фреймворку для комерційного проєкту \`${targetUrl}\` за патерном **Page Object Model (POM)** з автоматичною ініціалізацією сторінок через **Playwright Custom Fixtures**.

**Вимоги до Page Object Model:**
1. Створити абстрактний або базовий клас \`src/pages/BasePage.ts\`:
   - Конструктор приймає \`protected page: Page\`.
   - Метод \`open(path: string): Promise<void>\` з підтримкою \`baseURL\`.
   - Метод \`waitForPageLoaded(): Promise<void>\` (очікування \`domcontentloaded\` або ключових лейаут-елементів).
   - Глобальний геттер заголовка сторінки та URL.
   - Метод зняття скріншота для звітів \`captureScreenshot(name: string)\`.
2. Створити кастомні фікстури у \`src/fixtures/testFixtures.ts\`:
   - Розширити базовий \`test\` через \`test.extend<{ homePage: HomePage, calendarPage: EventCalendarPage }>\`.
   - Забезпечити передачу інстансів сторінок у тести без ручного створення \`new PageObject(page)\`.

**Критерії прийомки (Acceptance Criteria):**
- Створено \`BasePage.ts\` та \`testFixtures.ts\`.
- Написано smoke-тест у \`tests/smoke/app-init.spec.ts\`, який використовує кастомну фікстуру.
- Відсутній будь-який дубльований код ініціалізації драйвера чи сторінок.`,
            descriptionEn: `**User Story & Goal:**
As an Automation QA Engineer, I want to establish the foundational Page Object Model (POM) architecture for the commercial platform \`${targetUrl}\` using Playwright Custom Test Fixtures, so that all E2E tests maintain strict separation of concerns, zero driver re-initialization duplication, and enterprise-grade maintainability.

**Page Object Model Architecture:**
1. Create \`src/pages/BasePage.ts\`:
   - Constructor accepting \`protected page: Page\`.
   - Method \`open(path: string): Promise<void>\` with \`baseURL\` support.
   - Method \`waitForPageLoaded(): Promise<void>\` (awaiting \`domcontentloaded\` & key layout elements).
   - Global getters for page title and URL.
   - Utility method \`captureScreenshot(name: string): Promise<void>\`.
2. Implement custom fixtures in \`src/fixtures/testFixtures.ts\`:
   - Extend base test with \`test.extend<{ homePage: HomePage, calendarPage: EventCalendarPage }>\`.
   - Automatically inject page instances into test scopes without explicit \`new PageObject(page)\`.

**Acceptance Criteria (Definition of Done):**
- [ ] \`BasePage.ts\` and \`testFixtures.ts\` implemented with strict TypeScript typings.
- [ ] Smoke test in \`tests/smoke/app-init.spec.ts\` executes cleanly via custom fixtures.
- [ ] Zero duplicate browser initialization code across the suite.`,
            priority: "critical" as const,
            order: 1,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Компонент: HeaderComponent — глобальна навігація, пошук та стан кошика",
            titleEn: "[TypeScript] POM Component: HeaderComponent — Global Navigation, Search & Cart Badge State",
            description: `**Мета завдання:**
Реалізувати компонентний Page Object для головного хедера сайту (\`HeaderComponent\`), оскільки він присутній на всіх сторінках платформи.

**Вимоги до Page Object Model:**
1. Створити клас \`src/pages/components/HeaderComponent.ts\`:
   - Локатори (виключно через семантичні методи Playwright):
     - Логотип: \`page.getByRole('link', { name: /premier online/i })\`
     - Меню подій: \`page.getByRole('link', { name: 'Events' })\`
     - Меню результатів: \`page.getByRole('link', { name: 'Results' })\`
     - Кнопка входу: \`page.getByRole('button', { name: /log in|sign in/i })\`
     - Іконка кошика та лічильник товарів: \`page.locator('.header-cart-badge')\`
   - Методи:
     - \`goToEvents(): Promise<EventCalendarPage>\`
     - \`goToResults(): Promise<ResultsPage>\`
     - \`openLoginModal(): Promise<LoginModalComponent>\`
     - \`getCartItemCount(): Promise<number>\`
2. Написати E2E тест \`tests/components/header-navigation.spec.ts\`:
   - Перевірка переходів за всіма основними розділами.
   - Перевірка відображення лічильника товарів при додаванні квитків.

**Критерії прийомки:**
- Використано патерн "Component Object" (композиція всередині інших Page Objects).
- Методи переходу повертають відповідні Page Objects (Chained/Fluent API).
- 100% тестів проходять у headless режимі.`,
            descriptionEn: `**User Story & Goal:**
As an Automation QA, I need a reusable \`HeaderComponent\` Page Object representing the site-wide global navigation bar, ensuring consistent routing validations and cart item count assertions across all pages of \`${targetUrl}\`.

**Technical Requirements (POM):**
1. Implement \`src/pages/components/HeaderComponent.ts\`:
   - Semantic Locators:
     - Brand Logo: \`page.getByRole('link', { name: /premier online/i })\`
     - Events Link: \`page.getByRole('link', { name: 'Events' })\`
     - Results Link: \`page.getByRole('link', { name: 'Results' })\`
     - Auth Trigger: \`page.getByRole('button', { name: /log in|sign in/i })\`
     - Cart Badge: \`page.locator('.header-cart-badge')\`
   - Navigation Methods (Fluent API):
     - \`goToEvents(): Promise<EventCalendarPage>\`
     - \`goToResults(): Promise<ResultsPage>\`
     - \`openLoginModal(): Promise<LoginModalComponent>\`
     - \`getCartItemCount(): Promise<number>\`
2. Author test in \`tests/components/header-navigation.spec.ts\`:
   - Validate routing to each primary section.
   - Assert dynamic cart count indicator incrementing on ticket reservation.

**Acceptance Criteria (Definition of Done):**
- [ ] Component Object Model pattern used via composition inside Page Objects.
- [ ] Fluent API chained page transitions return correct typed Page Objects.
- [ ] Tests pass in headless and cross-browser modes.`,
            priority: "high" as const,
            order: 2,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — динамічний пошук та фільтрація подій за категоріями",
            titleEn: "[TypeScript] POM E2E: EventCalendarPage — Dynamic Sport Category Filtering & Event Catalog",
            description: `**Мета завдання:**
Автоматизувати каталог спортивних подій (\`${targetUrl}/event-calendar\`) з використанням Page Object \`EventCalendarPage\`.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/EventCalendarPage.ts\`:
   - Наслідується від \`BasePage\`.
   - Локатори:
     - Чіпси/кнопки категорій (Running, Cycling, Swimming, Triathlon): \`page.getByRole('button', { name: categoryName })\`
     - Список карток подій: \`page.locator('.event-card, [data-testid="event-card"]')\`
     - Заголовки карток: \`page.locator('.event-title')\`
     - Теги виду спорту на картках: \`page.locator('.event-category-badge')\`
   - Методи:
     - \`filterByCategory(category: 'Running' | 'Cycling' | 'Swimming' | 'Triathlon'): Promise<void>\`
     - \`getVisibleEventCardsCount(): Promise<number>\`
     - \`getVisibleEventTitles(): Promise<string[]>\`
     - \`verifyAllEventsHaveCategory(expectedCategory: string): Promise<void>\`
2. Написати тест у \`tests/events/category-filter.spec.ts\`:
   - Вибрати категорію "Running" -> переконатися, що всі показані картки мають тег бігу.
   - Перемкнути на "Cycling" -> перевірити динамічне оновлення карток без повного релоаду сторінки.

**Критерії прийомки:**
- Локатори не прив'язані до ненадійних CSS-класів із хешами.
- Очікування списку реалізовано через веб-ферст асерти (\`expect(locator).toHaveCount()\`).
- Жодних \`page.waitForTimeout()\`.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete visiting \`${targetUrl}/event-calendar\`, I want to filter the event schedule by sport category (Running, Cycling, Swimming, Triathlon) so that I can discover relevant races without viewing irrelevant activities.

**Technical Requirements (POM):**
1. Implement \`src/pages/EventCalendarPage.ts\` extending \`BasePage\`:
   - Locators:
     - Category chips: \`page.getByRole('button', { name: categoryName })\`
     - Event cards list: \`page.locator('.event-card, [data-testid="event-card"]')\`
     - Event title elements: \`page.locator('.event-title')\`
     - Category tags on cards: \`page.locator('.event-category-badge')\`
   - Methods:
     - \`filterByCategory(category: 'Running' | 'Cycling' | 'Swimming' | 'Triathlon'): Promise<void>\`
     - \`getVisibleEventCardsCount(): Promise<number>\`
     - \`verifyAllEventsHaveCategory(expectedCategory: string): Promise<void>\`
2. Write automated suite \`tests/events/category-filter.spec.ts\`:
   - Filter by "Running" -> verify all rendered cards display the Running category tag.
   - Toggle to "Cycling" -> assert cards update dynamically without full browser reload.

**Acceptance Criteria (Definition of Done):**
- [ ] No flaky static timeouts (\`page.waitForTimeout\`); use Playwright web-first assertions.
- [ ] Robust locators independent of auto-generated CSS hash classes.`,
            priority: "high" as const,
            order: 3,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — фільтрація за локацією (Dubai, Abu Dhabi) та датою",
            titleEn: "[TypeScript] POM E2E: EventCalendarPage — Multi-Filter by Location (Dubai, Abu Dhabi) & Date Range",
            description: `**Мета завдання:**
Покрити E2E тестами фільтри локацій (Емірати/Міста) та селектор періоду проведення подій.

**Вимоги до Page Object Model:**
1. Розширити \`src/pages/EventCalendarPage.ts\`:
   - Локатори:
     - Дропдаун локацій: \`page.getByLabel('Location')\` або \`page.getByRole('combobox', { name: /city|location/i })\`
     - Селектор місяця/діапазону дат: \`page.getByRole('button', { name: /date|month/i })\`
     - Кнопка скидання фільтрів: \`page.getByRole('button', { name: /clear filters|reset/i })\`
   - Методи:
     - \`selectLocation(city: 'Dubai' | 'Abu Dhabi' | 'Sharjah'): Promise<void>\`
     - \`selectMonth(monthYear: string): Promise<void>\`
     - \`resetFilters(): Promise<void>\`
     - \`getEventLocations(): Promise<string[]>\`
2. Написати тест \`tests/events/location-and-date-filter.spec.ts\`:
   - Застосувати фільтр "Dubai" -> перевірити, що всі події відбуваються в Дубаї.
   - Застосувати комбінований фільтр: "Abu Dhabi" + найближчий місяць.
   - Скинути фільтри через кнопку Reset -> перевірити повернення повного списку подій.

**Критерії прийомки:**
- Валідація скидання фільтрів повертає попередню кількість елементів.
- Тест стабільний до можливої затримки відповіді сервера.`,
            descriptionEn: `**User Story & Goal:**
As an Event Participant, I want to filter events by Emirate/City (Dubai, Abu Dhabi, Sharjah) and race month, as well as reset filters, so that I can schedule my travel and competition calendar efficiently.

**Technical Requirements (POM):**
1. Extend \`EventCalendarPage.ts\`:
   - Locators for location dropdowns, date pickers, and filter reset triggers.
   - Methods: \`selectLocation(city)\`, \`selectMonth(monthYear)\`, \`resetFilters()\`, \`getEventLocations()\`.
2. Write automated suite \`tests/events/location-and-date-filter.spec.ts\`:
   - Apply "Dubai" -> assert all visible events are hosted in Dubai.
   - Combine "Abu Dhabi" + Upcoming Month -> verify compound filter accuracy.
   - Click Reset Filters -> assert full original event count is restored.

**Acceptance Criteria (Definition of Done):**
- [ ] Compound filter assertions validated.
- [ ] Reset filter action accurately restores baseline catalogue count.`,
            priority: "medium" as const,
            order: 4,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — пошуковий рядок та Empty State (порожній результат)",
            titleEn: "[TypeScript] POM E2E: EventCalendarPage — Keyword Search, Auto-Suggest & Empty State Handling",
            description: `**Мета завдання:**
Автоматизувати текстовий пошук подій за ключовими словами та валідацію поведінки при відсутності збігів.

**Вимоги до Page Object Model:**
1. Доповнити \`EventCalendarPage.ts\`:
   - Локатори:
     - Поле пошуку: \`page.getByPlaceholder(/search events/i)\`
     - Повідомлення про відсутність результатів (Empty State): \`page.getByText(/no events found/i)\`
     - Кнопка "Скинути пошук" або хрестик очищення.
   - Методи:
     - \`searchEvent(query: string): Promise<void>\`
     - \`clearSearch(): Promise<void>\`
     - \`isEmptyStateVisible(): Promise<boolean>\`
2. Написати тести у \`tests/events/search-scenarios.spec.ts\`:
   - Позитивний сценарій: Ввести популярне ключове слово (наприклад, "Marathon") -> перевірити наявність збігів.
   - Негативний сценарій: Ввести завідомо неіснуючий запит (\`XYZ999NonExistent\`) -> перевірити Empty State.

**Критерії прийомки:**
- Використано \`expect(page.getByText(...)).toBeVisible()\`.
- Тест перевіряє поведінку інтерфейсу на пустий результат.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete, I want to search for events by name or keyword and receive clear Empty State feedback when no matches exist, so that I understand search results accurately.

**Technical Requirements (POM):**
1. Add search input and empty-state locators to \`EventCalendarPage.ts\`.
2. Author \`tests/events/search-scenarios.spec.ts\`:
   - Positive test: Query keyword "Marathon" -> assert all returned cards match the query.
   - Negative test: Query string "XYZ999NonExistent" -> assert empty state banner is displayed.

**Acceptance Criteria (Definition of Done):**
- [ ] Both positive and negative search branches covered.
- [ ] Assertions verify no broken layout during 0-results state.`,
            priority: "medium" as const,
            order: 5,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventDetailsPage — вибір дистанції (3K/5K/10K/21K) та валідація цін",
            titleEn: "[TypeScript] POM E2E: EventDetailsPage — Distance Tier Selection (3K/5K/10K/21K) & Pricing Matrix",
            description: `**Мета завдання:**
Створити Page Object для сторінки деталей події (\`EventDetailsPage\`) та протестувати вибір категорії участі і матрицю цін.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/EventDetailsPage.ts\`:
   - Локатори для дистанцій (3K, 5K, 10K, 21K), блоку цін в AED та кнопки реєстрації.
   - Методи: \`selectDistance(name)\`, \`getSelectedDistancePrice()\`, \`clickRegister()\`.
2. Написати тест у \`tests/events/event-details-pricing.spec.ts\`:
   - Вибрати 5K -> перевірити ціну в AED.
   - Перемкнути на 10K / 21K -> перевірити динамічне оновлення вартості.
   - Натиснути "Register Now" -> перевірити перехід на перший крок реєстрації.

**Критерії прийомки:**
- Коректна обробка числових значень цін (парсинг валюти та суми).
- Перехід на сторінку оформлення повертає відповідний екземпляр Page Object.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete, I want to view event details and choose my competition distance (3K/5K/10K/21K) with real-time price updates in AED, so that I can select the appropriate category before checkout.

**Technical Requirements (POM):**
1. Create \`src/pages/EventDetailsPage.ts\` with distance selectors, price display parser, and registration CTA.
2. Author \`tests/events/event-details-pricing.spec.ts\` validating price calculation across tiers.

**Acceptance Criteria (Definition of Done):**
- [ ] Price string parsed into structured numeric object \`{ amount: number, currency: string }\`.
- [ ] Registration CTA returns initialized next-step Page Object.`,
            priority: "high" as const,
            order: 6,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventDetailsPage — статус 'Sold Out' та закриття реєстрації",
            titleEn: "[TypeScript] POM E2E: EventDetailsPage — 'Sold Out' Status Badges & Disabled Registration State",
            description: `**Мета завдання:**
Автоматизувати перевірку недоступних або розпроданих дистанцій на сторінці події.

**Вимоги до Page Object Model:**
1. Розширити \`EventDetailsPage.ts\` методами \`isDistanceSoldOut(name)\` та \`verifyRegisterButtonDisabled()\`.
2. Написати тест у \`tests/events/sold-out-handling.spec.ts\`:
   - Дистанція зі статусом "Sold Out" не дозволяє вибір.
   - Кнопка "Register Now" вимкнена (\`toBeDisabled()\`).

**Критерії прийомки:**
- Використано асерти Playwright \`expect(locator).toBeDisabled()\`.`,
            descriptionEn: `**User Story & Goal:**
As an Organizer, I need full automated verification that sold-out distances display 'Sold Out' badges and prevent user registration, avoiding overbooking issues.

**Technical Requirements (POM):**
1. Add sold-out status detectors and disabled-state verifiers in \`EventDetailsPage.ts\`.
2. Write test in \`tests/events/sold-out-handling.spec.ts\` asserting CTA is disabled for full categories.

**Acceptance Criteria (Definition of Done):**
- [ ] Uses \`expect(button).toBeDisabled()\` or \`toHaveAttribute('aria-disabled', 'true')\`.`,
            priority: "low" as const,
            order: 7,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: LoginPage — інкапсуляція форми входу Premier ID та валідація помилок",
            titleEn: "[TypeScript] POM E2E: LoginPage — Premier ID Authentication Form & Validation Error Handling",
            description: `**Мета завдання:**
Створити Page Object для форми авторизації \`LoginPage\` та протестувати всі негативні сценарії валідації.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/LoginPage.ts\` з інкапсуляцією полів Email, Password, кнопки входу та повідомлень про помилки.
2. Написати тести у \`tests/auth/login-validation.spec.ts\`:
   - Пуста форма -> перевірка обов'язковості полів.
   - Невалідний email -> валідація формату.
   - Невірний пароль -> отримання помилки сервера "Invalid email or password".

**Критерії прийомки:**
- Паролі та чутливі дані не хардкодяться в тестах (використано змінні оточення).`,
            descriptionEn: `**User Story & Goal:**
As a Registered Athlete, I want to securely log in via Premier ID or receive clear actionable error messages if my credentials or input format are invalid.

**Technical Requirements (POM):**
1. Create \`src/pages/LoginPage.ts\` encapsulating credentials input, error alerts, and submission triggers.
2. Author \`tests/auth/login-validation.spec.ts\` covering empty fields, invalid email regex, and 401 unauthorized errors.

**Acceptance Criteria (Definition of Done):**
- [ ] No hardcoded passwords in test code; sourced via \`process.env\`.
- [ ] All inputs encapsulated in \`LoginPage.ts\`.`,
            priority: "critical" as const,
            order: 8,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Setup: Глобальна сесія через StorageState та флоу відновлення пароля",
            titleEn: "[TypeScript] POM Setup: Global Session Reuse with StorageState & Password Recovery Flow",
            description: `**Мета завдання:**
Налаштувати збереження стану авторизованого користувача через **Playwright StorageState**, щоб не проходити логін у кожному тесті.

**Вимоги до реалізації:**
1. Створити \`tests/auth.setup.ts\`:
   - Зберігає cookies та local storage у \`playwright/.auth/user.json\`.
2. Налаштувати тестові проекти з \`storageState\`.
3. Написати тест відновлення пароля \`tests/auth/password-recovery.spec.ts\`.

**Критерії прийомки:**
- Авторизовані тести стартують вже залогіненими (економія до 80% часу виконання сьюти).
- Файл \`playwright/.auth/user.json\` додано в \`.gitignore\`.`,
            descriptionEn: `**User Story & Goal:**
As an Automation Architect, I want to authenticate once via Playwright \`storageState\` and reuse browser sessions across test suites, reducing execution time by up to 80%.

**Technical Requirements (POM):**
1. Implement \`tests/auth.setup.ts\` generating \`playwright/.auth/user.json\`.
2. Configure \`playwright.config.ts\` project dependencies using \`storageState\`.
3. Author password recovery validation in \`tests/auth/password-recovery.spec.ts\`.

**Acceptance Criteria (Definition of Done):**
- [ ] Authenticated projects execute with preloaded credentials session.
- [ ] \`playwright/.auth/user.json\` tracked in \`.gitignore\`.`,
            priority: "high" as const,
            order: 9,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: ParticipantStepPage — крок 1: персональні дані та екстрений контакт",
            titleEn: "[TypeScript] POM E2E: ParticipantStepPage — Step 1: Personal Details & Emergency Contact",
            description: `**Мета завдання:**
Створити Page Object для першого кроку реєстрації на змагання (\`ParticipantStepPage\`) та протестувати заповнення форми учасника.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/registration/ParticipantStepPage.ts\`:
   - Локатори для ПІБ, статі, дати народження, національності, екстреного контакту.
   - Метод \`fillParticipantDetails(data: ParticipantData)\`.
2. Написати тест у \`tests/registration/participant-step.spec.ts\`:
   - Заповнити крок тестовими даними та перевірити валідацію обов'язковості екстреного зв'язку.

**Критерії прийомки:**
- Дані типізовані за допомогою TypeScript interface \`ParticipantData\`.`,
            descriptionEn: `**User Story & Goal:**
As a Race Entrant, I want to register my full personal details and mandatory emergency contact so that organizers can identify me on the course and ensure safety.

**Technical Requirements (POM):**
1. Implement \`ParticipantStepPage.ts\` with strongly typed \`ParticipantData\` interface.
2. Author \`tests/registration/participant-step.spec.ts\` validating mandatory emergency contact input before proceeding.

**Acceptance Criteria (Definition of Done):**
- [ ] Typed interface for participant information.
- [ ] Mandatory field validation enforced on Next Step transition.`,
            priority: "critical" as const,
            order: 10,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: WaiverStepPage — крок 2: медичний вейвер, згода з правилами та розмір форми",
            titleEn: "[TypeScript] POM E2E: WaiverStepPage — Step 2: Medical Waiver, Terms & Merchandise Sizing",
            description: `**Мета завдання:**
Створити Page Object \`WaiverStepPage\` для перевірки медичного застереження (Waiver), правил безпеки та вибору розміру футболки.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/registration/WaiverStepPage.ts\`.
2. Написати тести у \`tests/registration/waiver-and-merch.spec.ts\`:
   - Негативний: клік "Proceed" без вейверу -> блокування переходу.
   - Позитивний: вибір розміру, підтвердження згоди -> перехід до чекауту.

**Критерії прийомки:**
- Метод \`proceedToCheckout()\` повертає ініціалізований \`CheckoutPage\`.`,
            descriptionEn: `**User Story & Goal:**
As an Event Legal Coordinator, I need to ensure every participant reviews and confirms the medical disclaimer and event terms before proceeding to payment.

**Technical Requirements (POM):**
1. Implement \`WaiverStepPage.ts\` with T-Shirt selector, waiver checkbox, and terms checkbox.
2. Author negative & positive test scenarios in \`tests/registration/waiver-and-merch.spec.ts\`.

**Acceptance Criteria (Definition of Done):**
- [ ] Transition to checkout is strictly blocked until waiver checkbox is checked.
- [ ] Returns typed \`CheckoutPage\` instance upon valid completion.`,
            priority: "high" as const,
            order: 11,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: CheckoutPage — розрахунок підсумку (VAT, збори) та застосування промокоду",
            titleEn: "[TypeScript] POM E2E: CheckoutPage — Order Calculation (Subtotal, VAT, Fees) & Promo Code Validation",
            description: `**Мета завдання:**
Створити Page Object \`CheckoutPage\` для перевірки калькуляції суми замовлення, нарахування ПДВ/зборів та роботи з промокодами.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/CheckoutPage.ts\` з методами отримання сум та застосування промокоду.
2. Написати тести у \`tests/checkout/order-summary.spec.ts\`:
   - Перевірка формули: Total = Subtotal + VAT + ServiceFee.
   - Невалідний промокод -> повідомлення про помилку.
   - Валідний промокод -> перерахунок Total.

**Критерії прийомки:**
- Фінансова точність (округлення до 2 знаків після коми).`,
            descriptionEn: `**User Story & Goal:**
As an Event Participant, I want to see an itemized breakdown of my order (Subtotal, 5% UAE VAT, Service Fee) and apply promotional vouchers with immediate price updates.

**Technical Requirements (POM):**
1. Implement \`CheckoutPage.ts\` with price parsers and promo code application logic.
2. Author mathematical validation test: \`Total = Subtotal + VAT + ServiceFee\` in \`tests/checkout/order-summary.spec.ts\`.

**Acceptance Criteria (Definition of Done):**
- [ ] 2 decimal places financial rounding precision verified.
- [ ] Invalid promo code rejection feedback validated.`,
            priority: "high" as const,
            order: 12,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Network: Мокування платіжного шлюзу через page.route — обробка відмов банку",
            titleEn: "[TypeScript] POM Network: Payment Gateway Mocking via page.route — Declined Card Handling",
            description: `**Мета завдання:**
Забезпечити безпечне та стабільне тестування оплати без реального списання коштів за допомогою перехоплення мережевих запитів (\`page.route\`).

**Вимоги до реалізації:**
1. Створити \`src/utils/PaymentMockHelper.ts\` з методами мокування відмови та таймаутів.
2. Написати E2E тести у \`tests/checkout/payment-mocking.spec.ts\`:
   - Мок статусу 402/відхиленої карти -> перевірка показу червоного алерта для користувача.
   - Збереження даних форми без втрати замовлення.

**Критерії прийомки:**
- Тести ізольовані від реальних платіжних систем.`,
            descriptionEn: `**User Story & Goal:**
As a QA Engineer, I want to safely simulate payment gateway declines and timeouts using \`page.route\` without executing real financial transactions or risking live card charges.

**Technical Requirements (POM):**
1. Create \`PaymentMockHelper.ts\` with \`mockDeclinedCard()\` and \`mockNetworkTimeout()\`.
2. Author \`tests/checkout/payment-mocking.spec.ts\` ensuring user-facing alert is displayed on 402 HTTP response.

**Acceptance Criteria (Definition of Done):**
- [ ] Zero real bank API calls triggered during automation.
- [ ] UI resiliently preserves customer form data upon transaction failure.`,
            priority: "critical" as const,
            order: 13,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Network: Мокування успішної оплати та верифікація сторінки підтвердження",
            titleEn: "[TypeScript] POM Network: Mocking Successful Payment & OrderConfirmationPage Verification",
            description: `**Мета завдання:**
Змокувати успішну відповідь платіжного шлюзу та протестувати генерацію замовлення на сторінці підтвердження \`OrderConfirmationPage\`.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/OrderConfirmationPage.ts\`.
2. Написати тест у \`tests/checkout/successful-order.spec.ts\`:
   - Повний флоу чекауту з моком 200 OK.
   - Валідація відображення Order ID та кнопки переходу до куплених квитків.

**Критерії прийомки:**
- Повний end-to-end флоу від кошика до підтвердження без реальних витрат.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete completing payment, I want to immediately land on an Order Confirmation page with a unique booking reference and direct link to My Events.

**Technical Requirements (POM):**
1. Create \`OrderConfirmationPage.ts\` extracting booking reference and event details.
2. Author end-to-end suite \`tests/checkout/successful-order.spec.ts\` validating receipt details.

**Acceptance Criteria (Definition of Done):**
- [ ] Complete cart-to-receipt flow executed cleanly.
- [ ] Booking reference confirmed in confirmation layout.`,
            priority: "high" as const,
            order: 14,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: MyEventsPage — кабінет учасника, стартовий номер та завантаження PDF квитка",
            titleEn: "[TypeScript] POM E2E: MyEventsPage — Athlete Dashboard, Bib Number & PDF Ticket Download Event",
            description: `**Мета завдання:**
Створити Page Object для особистого кабінету учасника \`MyEventsPage\` та автоматизувати перевірку куплених квитків та завантаження файлів (Download).

**Вимоги до Page Object Model:**
1. Створити \`src/pages/MyEventsPage.ts\`.
2. Написати тест у \`tests/cabinet/tickets-and-downloads.spec.ts\`:
   - Перевірка списку майбутніх змагань, стартового номера (Bib) та QR-коду.
   - Завантаження PDF квитка через \`page.waitForEvent('download')\`.

**Критерії прийомки:**
- Асинхронне перехоплення події завантаження без збоїв.`,
            descriptionEn: `**User Story & Goal:**
As a Registered Participant, I want to view my upcoming races, assigned bib number, check-in QR code, and download my official PDF confirmation ticket.

**Technical Requirements (POM):**
1. Create \`MyEventsPage.ts\` encapsulating registered event cards and ticket download triggers.
2. Author \`tests/cabinet/tickets-and-downloads.spec.ts\` handling \`page.waitForEvent('download')\`.

**Acceptance Criteria (Definition of Done):**
- [ ] Asynchronous download stream verified with \`.pdf\` extension and size > 0 bytes.`,
            priority: "high" as const,
            order: 15,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: ResultsPage — пошук офіційних результатів забігу за номером або атлетом",
            titleEn: "[TypeScript] POM E2E: ResultsPage — Race Protocol Lookup by Bib / Athlete Name & Table Parsing",
            description: `**Мета завдання:**
Створити Page Object для сторінки спортивних результатів (\`ResultsPage\`) та протестувати пошук протоколів забігів.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/ResultsPage.ts\` з методами пошуку атлета та парсингу рядків таблиці.
2. Написати тест у \`tests/results/race-results-search.spec.ts\`:
   - Пошук за Bib номером -> верифікація рангу (Rank), Chip Time та вікової категорії.

**Критерії прийомки:**
- Парсинг HTML-таблиці реалізовано в окремому хелпері або методі POM.`,
            descriptionEn: `**User Story & Goal:**
As a Competitor or Spectator, I want to search official race result protocols by athlete name or bib number to inspect chip times and rank standings.

**Technical Requirements (POM):**
1. Implement \`ResultsPage.ts\` parsing HTML data table rows into typed structured records.
2. Author \`tests/results/race-results-search.spec.ts\` verifying chip time format (\`HH:MM:SS\`).

**Acceptance Criteria (Definition of Done):**
- [ ] Table parsing logic encapsulated in POM method.`,
            priority: "medium" as const,
            order: 16,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM API: ApiEventsClient — валідація REST контрактів подій (/api/events)",
            titleEn: "[TypeScript] POM API: ApiEventsClient — REST Contract & JSON Schema Testing (/api/events)",
            description: `**Мета завдання:**
Створити API Client для валідації бекенд-ендпоінтів платформи за допомогою Playwright \`request\` (APIRequestContext).

**Вимоги до реалізації:**
1. Створити \`src/api/ApiEventsClient.ts\`.
2. Написати тести у \`tests/api/events-contract.spec.ts\`:
   - Статус 200, час відповіді < 1200ms.
   - Валідація схеми JSON та порівняння з UI календаря.

**Критерії прийомки:**
- Використано типізовані DTO інтерфейси TypeScript (\`EventDto\`).`,
            descriptionEn: `**User Story & Goal:**
As an SDET, I want to validate backend REST endpoints directly using Playwright \`APIRequestContext\` to ensure JSON contract consistency without browser rendering overhead.

**Technical Requirements (POM):**
1. Create \`src/api/ApiEventsClient.ts\` accepting \`APIRequestContext\`.
2. Author \`tests/api/events-contract.spec.ts\` validating HTTP 200, latency < 1200ms, and typed \`EventDto\` schema.

**Acceptance Criteria (Definition of Done):**
- [ ] Fast headless API validation completed without opening browser windows.`,
            priority: "medium" as const,
            order: 17,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Mobile & Visual: Адаптивність, бургер-меню та регресійні знімки (toHaveScreenshot)",
            titleEn: "[TypeScript] POM Mobile & Visual: Mobile Drawer Navigation & Snapshot Regression (toHaveScreenshot)",
            description: `**Мета завдання:**
Покрити платформу тестами мобільної адаптивності та візуальними регресійними перевірками за патерном Page Object.

**Вимоги до реалізації:**
1. Створити \`src/pages/mobile/MobileNavigationComponent.ts\`.
2. Написати тести у \`tests/mobile/mobile-layout.spec.ts\` та \`tests/visual/home-visual.spec.ts\`:
   - Перевірка бургер-меню та відсутності горизонтального скролу.
   - Візуальне порівняння \`toHaveScreenshot\` з маскуванням динамічних банерів (\`mask\`).

**Критерії прийомки:**
- Маскування всіх динамічних областей для усунення флаків.`,
            descriptionEn: `**User Story & Goal:**
As a Mobile Athlete, I want seamless mobile navigation without horizontal scrolling, and as an Engineering Lead, I need automated pixel-level visual regression tests via \`toHaveScreenshot\`.

**Technical Requirements (POM):**
1. Implement \`MobileNavigationComponent.ts\` for drawer menu toggling.
2. Author \`tests/mobile/mobile-layout.spec.ts\` and \`tests/visual/home-visual.spec.ts\` utilizing screenshot masking for dynamic promo sliders.

**Acceptance Criteria (Definition of Done):**
- [ ] Zero horizontal page overflow on mobile devices.
- [ ] Visual regression snapshot tests configured with anti-flakiness masking.`,
            priority: "low" as const,
            order: 18,
        },
    ];

    await db.insert(projectTasks).values(pomTasks);
    console.log(`Successfully seeded ${pomTasks.length} bilingual enterprise POM tasks for Premier Online!`);
    process.exit(0);
}

main().catch(err => {
    console.error("Error seeding tasks:", err);
    process.exit(1);
});
