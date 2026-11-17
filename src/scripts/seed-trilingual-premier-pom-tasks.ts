import { db } from "../db";
import { projectBoards, projectColumns, projectTasks } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const boardId = 4;
    const targetUrl = "https://www.premieronline.com";

    const [board] = await db.select().from(projectBoards).where(eq(projectBoards.id, boardId));
    if (!board) {
        console.error("Board 4 not found!");
        process.exit(1);
    }
    console.log("Seeding trilingual tasks for:", board.title);

    const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, boardId));
    const todoCol = columns.find(c => c.order === 1) || columns[0];

    // Clear board 4
    await db.delete(projectTasks).where(eq(projectTasks.boardId, boardId));
    console.log("Cleared old tasks for board 4.");

    const pomTasks = [
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] Архітектура: Створення BasePage та інтеграція Custom Fixtures для Page Objects",
            titleEn: "[TypeScript] Architecture: Implement BasePage & Custom Test Fixtures for Page Objects",
            titleRu: "[TypeScript] Архитектура: Создание BasePage и интеграция Custom Fixtures для Page Objects",
            description: `**Мета завдання:**
Створити фундамент тестового фреймворку для комерційного проєкту \`${targetUrl}\` за патерном **Page Object Model (POM)** з автоматичною ініціалізацією сторінок через **Playwright Custom Fixtures**.

**Вимоги до Page Object Model:**
1. Створити клас \`src/pages/BasePage.ts\`:
   - Конструктор приймає \`protected page: Page\`.
   - Метод \`open(path: string): Promise<void>\` з підтримкою \`baseURL\`.
   - Метод \`waitForPageLoaded(): Promise<void>\` (очікування \`domcontentloaded\` або ключових лейаут-елементів).
   - Глобальний геттер заголовка сторінки та URL.
   - Метод зняття скріншота \`captureScreenshot(name: string)\`.
2. Створити кастомні фікстури у \`src/fixtures/testFixtures.ts\`:
   - Розширити базовий \`test\` через \`test.extend<{ homePage: HomePage, calendarPage: EventCalendarPage }>\`.
   - Автоматична передача інстансів сторінок у тести без ручного створення \`new PageObject(page)\`.

**Критерії прийомки (Acceptance Criteria):**
- Створено \`BasePage.ts\` та \`testFixtures.ts\`.
- Написано smoke-тест у \`tests/smoke/app-init.spec.ts\` через кастомну фікстуру.
- 0 дубльованого коду ініціалізації драйвера чи сторінок.`,
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
            descriptionRu: `**Цель задания:**
Создать фундамент тестового фреймворка для коммерческого проекта \`${targetUrl}\` по паттерну **Page Object Model (POM)** с автоматической инициализацией страниц через **Playwright Custom Fixtures**.

**Требования к Page Object Model:**
1. Создать класс \`src/pages/BasePage.ts\`:
   - Конструктор принимает \`protected page: Page\`.
   - Метод \`open(path: string): Promise<void>\` с поддержкой \`baseURL\`.
   - Метод \`waitForPageLoaded(): Promise<void>\` (ожидание \`domcontentloaded\` или ключевых элементов макета).
   - Глобальный геттер заголовка страницы и URL.
   - Метод снятия скриншота \`captureScreenshot(name: string)\`.
2. Создать кастомные фикстуры в \`src/fixtures/testFixtures.ts\`:
   - Расширить базовый \`test\` через \`test.extend<{ homePage: HomePage, calendarPage: EventCalendarPage }>\`.
   - Автоматическая передача инстансов страниц в тесты без ручного создания \`new PageObject(page)\`.

**Критерии приемки (Acceptance Criteria):**
- Созданы \`BasePage.ts\` и \`testFixtures.ts\`.
- Написан smoke-тест в \`tests/smoke/app-init.spec.ts\` через кастомную фикстуру.
- 0 дублированного кода инициализации драйвера или страниц.`,
            priority: "critical" as const,
            order: 1,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Компонент: HeaderComponent — глобальна навігація, пошук та стан кошика",
            titleEn: "[TypeScript] POM Component: HeaderComponent — Global Navigation, Search & Cart Badge State",
            titleRu: "[TypeScript] POM Компонент: HeaderComponent — глобальная навигация, поиск и счетчик корзины",
            description: `**Мета завдання:**
Реалізувати компонентний Page Object для головного хедера сайту (\`HeaderComponent\`), оскільки він присутній на всіх сторінках платформи.

**Вимоги до Page Object Model:**
1. Створити клас \`src/pages/components/HeaderComponent.ts\`:
   - Семантичні локатори: Логотип, Events, Results, Sign In, Cart Badge.
   - Chained API методи: \`goToEvents()\`, \`goToResults()\`, \`openLoginModal()\`, \`getCartItemCount()\`.
2. Написати E2E тест \`tests/components/header-navigation.spec.ts\`.

**Критерії прийомки:**
- Використано патерн "Component Object".
- Методи повертають відповідні Page Objects.`,
            descriptionEn: `**User Story & Goal:**
As an Automation QA, I need a reusable \`HeaderComponent\` Page Object representing the site-wide global navigation bar, ensuring consistent routing validations and cart item count assertions across all pages of \`${targetUrl}\`.

**Technical Requirements (POM):**
1. Implement \`src/pages/components/HeaderComponent.ts\` with semantic locators and fluent transition methods.
2. Author test in \`tests/components/header-navigation.spec.ts\` verifying navigation and dynamic cart indicator.

**Acceptance Criteria (Definition of Done):**
- [ ] Component Object Model pattern used via composition inside Page Objects.
- [ ] Fluent API chained page transitions return correct typed Page Objects.`,
            descriptionRu: `**Цель задания:**
Реализовать компонентный Page Object для главного хедера сайта (\`HeaderComponent\`), так как он присутствует на всех страницах платформы.

**Требования к Page Object Model:**
1. Создать класс \`src/pages/components/HeaderComponent.ts\`:
   - Семантические локаторы: Логотип, Events, Results, Sign In, Cart Badge.
   - Chained API методы: \`goToEvents()\`, \`goToResults()\`, \`openLoginModal()\`, \`getCartItemCount()\`.
2. Написать E2E тест \`tests/components/header-navigation.spec.ts\`.

**Критерии приемки:**
- Использован паттерн "Component Object".
- Методы возвращают соответствующие Page Objects.`,
            priority: "high" as const,
            order: 2,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — динамічний пошук та фільтрація подій за категоріями",
            titleEn: "[TypeScript] POM E2E: EventCalendarPage — Dynamic Sport Category Filtering & Event Catalog",
            titleRu: "[TypeScript] POM E2E: EventCalendarPage — динамическая фильтрация событий по категориям спорта",
            description: `**Мета завдання:**
Автоматизувати каталог спортивних подій (\`${targetUrl}/event-calendar\`) з використанням Page Object \`EventCalendarPage\`.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/EventCalendarPage.ts\` наслідуючись від \`BasePage\`.
2. Локатори категорій (Running, Cycling, Swimming, Triathlon) та карток.
3. Написати тести у \`tests/events/category-filter.spec.ts\`.

**Критерії прийомки:**
- Жодних \`page.waitForTimeout()\`, тільки веб-ферст асерти.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete visiting \`${targetUrl}/event-calendar\`, I want to filter the event schedule by sport category (Running, Cycling, Swimming, Triathlon) so that I can discover relevant races without viewing irrelevant activities.

**Technical Requirements (POM):**
1. Implement \`src/pages/EventCalendarPage.ts\` extending \`BasePage\`.
2. Write automated suite \`tests/events/category-filter.spec.ts\`.

**Acceptance Criteria (Definition of Done):**
- [ ] No flaky static timeouts (\`page.waitForTimeout\`); use Playwright web-first assertions.`,
            descriptionRu: `**Цель задания:**
Автоматизировать каталог спортивных событий (\`${targetUrl}/event-calendar\`) с использованием Page Object \`EventCalendarPage\`.

**Требования к Page Object Model:**
1. Создать \`src/pages/EventCalendarPage.ts\` наследуясь от \`BasePage\`.
2. Локаторы категорий (Running, Cycling, Swimming, Triathlon) и карточек событий.
3. Написать тесты в \`tests/events/category-filter.spec.ts\`.

**Критерии приемки:**
- Никаких \`page.waitForTimeout()\`, только веб-ферст ассерты Playwright.`,
            priority: "high" as const,
            order: 3,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — фільтрація за локацією (Dubai, Abu Dhabi) та датою",
            titleEn: "[TypeScript] POM E2E: EventCalendarPage — Multi-Filter by Location (Dubai, Abu Dhabi) & Date Range",
            titleRu: "[TypeScript] POM E2E: EventCalendarPage — фильтрация по локации (Dubai, Abu Dhabi) и диапазону дат",
            description: `**Мета завдання:**
Покрити E2E тестами фільтри локацій (Емірати/Міста) та селектор періоду проведення подій.

**Вимоги до Page Object Model:**
1. Розширити \`EventCalendarPage.ts\` методами \`selectLocation\`, \`selectMonth\`, \`resetFilters\`.
2. Написати тест \`tests/events/location-and-date-filter.spec.ts\`.

**Критерії прийомки:**
- Валідація скидання фільтрів повертає повний список.`,
            descriptionEn: `**User Story & Goal:**
As an Event Participant, I want to filter events by Emirate/City (Dubai, Abu Dhabi, Sharjah) and race month, as well as reset filters, so that I can schedule my travel and competition calendar efficiently.

**Technical Requirements (POM):**
1. Extend \`EventCalendarPage.ts\` with location dropdowns, date pickers, and filter reset triggers.
2. Write automated suite \`tests/events/location-and-date-filter.spec.ts\`.

**Acceptance Criteria (Definition of Done):**
- [ ] Compound filter assertions validated.
- [ ] Reset filter action accurately restores baseline catalogue count.`,
            descriptionRu: `**Цель задания:**
Покрыть E2E тестами фильтры локаций (Эмираты/Города) и селектор периода проведения событий.

**Требования к Page Object Model:**
1. Расширить \`EventCalendarPage.ts\` методами \`selectLocation\`, \`selectMonth\`, \`resetFilters\`.
2. Написать тест \`tests/events/location-and-date-filter.spec.ts\`.

**Критерии приемки:**
- Валидация сброса фильтров возвращает полный список.`,
            priority: "medium" as const,
            order: 4,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — пошуковий рядок та Empty State (порожній результат)",
            titleEn: "[TypeScript] POM E2E: EventCalendarPage — Keyword Search, Auto-Suggest & Empty State Handling",
            titleRu: "[TypeScript] POM E2E: EventCalendarPage — поисковая строка и обработка пустого результата (Empty State)",
            description: `**Мета завдання:**
Автоматизувати текстовий пошук подій за ключовими словами та валідацію поведінки при відсутності збігів.

**Вимоги до Page Object Model:**
1. Доповнити \`EventCalendarPage.ts\` полем пошуку та перевіркою Empty State.
2. Написати тести у \`tests/events/search-scenarios.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete, I want to search for events by name or keyword and receive clear Empty State feedback when no matches exist.

**Technical Requirements (POM):**
1. Add search input and empty-state locators to \`EventCalendarPage.ts\`.
2. Author \`tests/events/search-scenarios.spec.ts\` covering positive and negative query branches.`,
            descriptionRu: `**Цель задания:**
Автоматизировать текстовый поиск событий по ключевым словам и валидацию поведения при отсутствии совпадений.

**Требования к Page Object Model:**
1. Дополнить \`EventCalendarPage.ts\` полем поиска и проверкой Empty State.
2. Написать тесты в \`tests/events/search-scenarios.spec.ts\`.`,
            priority: "medium" as const,
            order: 5,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventDetailsPage — вибір дистанції (3K/5K/10K/21K) та валідація цін",
            titleEn: "[TypeScript] POM E2E: EventDetailsPage — Distance Tier Selection (3K/5K/10K/21K) & Pricing Matrix",
            titleRu: "[TypeScript] POM E2E: EventDetailsPage — выбор дистанции (3K/5K/10K/21K) и валидация цен",
            description: `**Мета завдання:**
Створити Page Object для сторінки деталей події (\`EventDetailsPage\`) та протестувати вибір категорії участі і матрицю цін.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/EventDetailsPage.ts\`.
2. Написати тест у \`tests/events/event-details-pricing.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete, I want to view event details and choose my competition distance (3K/5K/10K/21K) with real-time price updates in AED.

**Technical Requirements (POM):**
1. Create \`src/pages/EventDetailsPage.ts\` with distance selectors, price display parser, and registration CTA.
2. Author \`tests/events/event-details-pricing.spec.ts\` validating price calculation across tiers.`,
            descriptionRu: `**Цель задания:**
Создать Page Object для страницы деталей события (\`EventDetailsPage\`) и протестировать выбор категории участия и матрицу цен.

**Требования к Page Object Model:**
1. Создать \`src/pages/EventDetailsPage.ts\`.
2. Написать тест в \`tests/events/event-details-pricing.spec.ts\`.`,
            priority: "high" as const,
            order: 6,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventDetailsPage — статус 'Sold Out' та закриття реєстрації",
            titleEn: "[TypeScript] POM E2E: EventDetailsPage — 'Sold Out' Status Badges & Disabled Registration State",
            titleRu: "[TypeScript] POM E2E: EventDetailsPage — статус 'Sold Out' и блокировка закрытой регистрации",
            description: `**Мета завдання:**
Автоматизувати перевірку недоступних або розпроданих дистанцій на сторінці події.

**Вимоги до Page Object Model:**
1. Розширити \`EventDetailsPage.ts\` методами перевірки розпроданих дистанцій та вимкненої кнопки.
2. Написати тест у \`tests/events/sold-out-handling.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Organizer, I need automated verification that sold-out distances display 'Sold Out' badges and prevent user registration.

**Technical Requirements (POM):**
1. Add sold-out status detectors and disabled-state verifiers in \`EventDetailsPage.ts\`.
2. Write test in \`tests/events/sold-out-handling.spec.ts\`.`,
            descriptionRu: `**Цель задания:**
Автоматизировать проверку недоступных или распроданных дистанций на странице события.

**Требования к Page Object Model:**
1. Расширить \`EventDetailsPage.ts\` методами проверки распроданных дистанций и отключенной кнопки.
2. Написать тест в \`tests/events/sold-out-handling.spec.ts\`.`,
            priority: "low" as const,
            order: 7,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: LoginPage — інкапсуляція форми входу Premier ID та валідація помилок",
            titleEn: "[TypeScript] POM E2E: LoginPage — Premier ID Authentication Form & Validation Error Handling",
            titleRu: "[TypeScript] POM E2E: LoginPage — инкапсуляция формы входа Premier ID и валидация ошибок",
            description: `**Мета завдання:**
Створити Page Object для форми авторизації \`LoginPage\` та протестувати всі негативні сценарії валідації.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/LoginPage.ts\`.
2. Написати тести у \`tests/auth/login-validation.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As a Registered Athlete, I want to securely log in via Premier ID or receive clear actionable error messages if my credentials are invalid.

**Technical Requirements (POM):**
1. Create \`src/pages/LoginPage.ts\` encapsulating credentials input, error alerts, and submission triggers.
2. Author \`tests/auth/login-validation.spec.ts\`.`,
            descriptionRu: `**Цель задания:**
Создать Page Object для формы авторизации \`LoginPage\` и протестировать все негативные сценарии валидации.

**Требования к Page Object Model:**
1. Создать \`src/pages/LoginPage.ts\`.
2. Написать тесты в \`tests/auth/login-validation.spec.ts\`.`,
            priority: "critical" as const,
            order: 8,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Setup: Глобальна сесія через StorageState та флоу відновлення пароля",
            titleEn: "[TypeScript] POM Setup: Global Session Reuse with StorageState & Password Recovery Flow",
            titleRu: "[TypeScript] POM Setup: Повторное использование сессии через StorageState и сброс пароля",
            description: `**Мета завдання:**
Налаштувати збереження стану авторизованого користувача через **Playwright StorageState**, щоб не проходити логін у кожному тесті.

**Вимоги до реалізації:**
1. Створити \`tests/auth.setup.ts\` з генерацією \`playwright/.auth/user.json\`.
2. Налаштувати тестові проекти з \`storageState\`.
3. Написати тест відновлення пароля \`tests/auth/password-recovery.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Automation Architect, I want to authenticate once via Playwright \`storageState\` and reuse browser sessions across test suites.

**Technical Requirements (POM):**
1. Implement \`tests/auth.setup.ts\` generating \`playwright/.auth/user.json\`.
2. Configure \`playwright.config.ts\` project dependencies using \`storageState\`.
3. Author password recovery validation in \`tests/auth/password-recovery.spec.ts\`.`,
            descriptionRu: `**Цель задания:**
Настроить сохранение состояния авторизованного пользователя через **Playwright StorageState**, чтобы не проходить логин в каждом тесте.

**Требования к реализации:**
1. Создать \`tests/auth.setup.ts\` с генерацией \`playwright/.auth/user.json\`.
2. Настроить тестовые проекты с \`storageState\`.
3. Написать тест восстановления пароля \`tests/auth/password-recovery.spec.ts\`.`,
            priority: "high" as const,
            order: 9,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: ParticipantStepPage — крок 1: персональні дані та екстрений контакт",
            titleEn: "[TypeScript] POM E2E: ParticipantStepPage — Step 1: Personal Details & Emergency Contact",
            titleRu: "[TypeScript] POM E2E: ParticipantStepPage — шаг 1: личные данные и экстренный контакт",
            description: `**Мета завдання:**
Створити Page Object для першого кроку реєстрації на змагання (\`ParticipantStepPage\`) та протестувати заповнення форми учасника.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/registration/ParticipantStepPage.ts\` з інтерфейсом \`ParticipantData\`.
2. Написати тест у \`tests/registration/participant-step.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As a Race Entrant, I want to register my full personal details and mandatory emergency contact before advancing in registration.

**Technical Requirements (POM):**
1. Implement \`ParticipantStepPage.ts\` with strongly typed \`ParticipantData\` interface.
2. Author \`tests/registration/participant-step.spec.ts\`.`,
            descriptionRu: `**Цель задания:**
Создать Page Object для первого шага регистрации на соревнования (\`ParticipantStepPage\`) и протестировать заполнение формы участника.

**Требования к Page Object Model:**
1. Создать \`src/pages/registration/ParticipantStepPage.ts\` с интерфейсом \`ParticipantData\`.
2. Написать тест в \`tests/registration/participant-step.spec.ts\`.`,
            priority: "critical" as const,
            order: 10,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: WaiverStepPage — крок 2: медичний вейвер, згода з правилами та розмір форми",
            titleEn: "[TypeScript] POM E2E: WaiverStepPage — Step 2: Medical Waiver, Terms & Merchandise Sizing",
            titleRu: "[TypeScript] POM E2E: WaiverStepPage — шаг 2: медицинский вейвер, согласие с правилами и мерч",
            description: `**Мета завдання:**
Створити Page Object \`WaiverStepPage\` для перевірки медичного застереження (Waiver), правил безпеки та вибору розміру футболки.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/registration/WaiverStepPage.ts\`.
2. Написати тести у \`tests/registration/waiver-and-merch.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Event Legal Coordinator, I need to ensure every participant reviews and confirms the medical disclaimer and event terms before proceeding to payment.

**Technical Requirements (POM):**
1. Implement \`WaiverStepPage.ts\` with T-Shirt selector, waiver checkbox, and terms checkbox.
2. Author negative & positive test scenarios in \`tests/registration/waiver-and-merch.spec.ts\`.`,
            descriptionRu: `**Цель задания:**
Создать Page Object \`WaiverStepPage\` для проверки медицинского предупреждения (Waiver), правил безопасности и выбора размера футболки.

**Требования к Page Object Model:**
1. Создать \`src/pages/registration/WaiverStepPage.ts\`.
2. Написать тесты в \`tests/registration/waiver-and-merch.spec.ts\`.`,
            priority: "high" as const,
            order: 11,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: CheckoutPage — розрахунок підсумку (VAT, збори) та застосування промокоду",
            titleEn: "[TypeScript] POM E2E: CheckoutPage — Order Calculation (Subtotal, VAT, Fees) & Promo Code Validation",
            titleRu: "[TypeScript] POM E2E: CheckoutPage — расчет итога (VAT, сборы) и применение промокода",
            description: `**Мета завдання:**
Створити Page Object \`CheckoutPage\` для перевірки калькуляції суми замовлення, нарахування ПДВ/зборів та роботи з промокодами.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/CheckoutPage.ts\`.
2. Написати тести у \`tests/checkout/order-summary.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Event Participant, I want to see an itemized breakdown of my order (Subtotal, 5% UAE VAT, Service Fee) and apply promotional vouchers.

**Technical Requirements (POM):**
1. Implement \`CheckoutPage.ts\` with price parsers and promo code application logic.
2. Author mathematical validation test: \`Total = Subtotal + VAT + ServiceFee\` in \`tests/checkout/order-summary.spec.ts\`.`,
            descriptionRu: `**Цель задания:**
Создать Page Object \`CheckoutPage\` для проверки калькуляции суммы заказа, начисления НДС/сборов и работы с промокодами.

**Требования к Page Object Model:**
1. Создать \`src/pages/CheckoutPage.ts\`.
2. Написать тесты в \`tests/checkout/order-summary.spec.ts\`.`,
            priority: "high" as const,
            order: 12,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Network: Мокування платіжного шлюзу через page.route — обробка відмов банку",
            titleEn: "[TypeScript] POM Network: Payment Gateway Mocking via page.route — Declined Card Handling",
            titleRu: "[TypeScript] POM Network: Мокирование платежного шлюза через page.route — обработка отказов банка",
            description: `**Мета завдання:**
Забезпечити безпечне та стабільне тестування оплати без реального списання коштів за допомогою перехоплення мережевих запитів (\`page.route\`).

**Вимоги до реалізації:**
1. Створити \`src/utils/PaymentMockHelper.ts\` з методами мокування відмови та таймаутів.
2. Написати E2E тести у \`tests/checkout/payment-mocking.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As a QA Engineer, I want to safely simulate payment gateway declines and timeouts using \`page.route\` without executing real financial transactions.

**Technical Requirements (POM):**
1. Create \`PaymentMockHelper.ts\` with \`mockDeclinedCard()\` and \`mockNetworkTimeout()\`.
2. Author \`tests/checkout/payment-mocking.spec.ts\` ensuring user-facing alert is displayed on 402 HTTP response.`,
            descriptionRu: `**Цель задания:**
Обеспечить безопасное и стабильное тестирование оплаты без реального списания средств с помощью перехвата сетевых запросов (\`page.route\`).

**Требования к реализации:**
1. Создать \`src/utils/PaymentMockHelper.ts\` с методами мокирования отказа и таймаутов.
2. Написать E2E тесты в \`tests/checkout/payment-mocking.spec.ts\`.`,
            priority: "critical" as const,
            order: 13,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Network: Мокування успішної оплати та верифікація сторінки підтвердження",
            titleEn: "[TypeScript] POM Network: Mocking Successful Payment & OrderConfirmationPage Verification",
            titleRu: "[TypeScript] POM Network: Мокирование успешной оплаты и верификация страницы подтверждения",
            description: `**Мета завдання:**
Змокувати успішну відповідь платіжного шлюзу та протестувати генерацію замовлення на сторінці підтвердження \`OrderConfirmationPage\`.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/OrderConfirmationPage.ts\`.
2. Написати тест у \`tests/checkout/successful-order.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an Athlete completing payment, I want to immediately land on an Order Confirmation page with a unique booking reference and direct link to My Events.

**Technical Requirements (POM):**
1. Create \`OrderConfirmationPage.ts\` extracting booking reference and event details.
2. Author end-to-end suite \`tests/checkout/successful-order.spec.ts\` validating receipt details.`,
            descriptionRu: `**Цель задания:**
Смокировать успешный ответ платежного шлюза и протестировать генерацию заказа на странице подтверждения \`OrderConfirmationPage\`.

**Требования к Page Object Model:**
1. Создать \`src/pages/OrderConfirmationPage.ts\`.
2. Написать тест в \`tests/checkout/successful-order.spec.ts\`.`,
            priority: "high" as const,
            order: 14,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: MyEventsPage — кабінет учасника, стартовий номер та завантаження PDF квитка",
            titleEn: "[TypeScript] POM E2E: MyEventsPage — Athlete Dashboard, Bib Number & PDF Ticket Download Event",
            titleRu: "[TypeScript] POM E2E: MyEventsPage — кабинет участника, стартовый номер и скачивание PDF билета",
            description: `**Мета завдання:**
Створити Page Object для особистого кабінету учасника \`MyEventsPage\` та автоматизувати перевірку куплених квитків та завантаження файлів (Download).

**Вимоги до Page Object Model:**
1. Створити \`src/pages/MyEventsPage.ts\`.
2. Написати тест у \`tests/cabinet/tickets-and-downloads.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As a Registered Participant, I want to view my upcoming races, assigned bib number, check-in QR code, and download my official PDF confirmation ticket.

**Technical Requirements (POM):**
1. Create \`MyEventsPage.ts\` encapsulating registered event cards and ticket download triggers.
2. Author \`tests/cabinet/tickets-and-downloads.spec.ts\` handling \`page.waitForEvent('download')\`.`,
            descriptionRu: `**Цель задания:**
Создать Page Object для личного кабинета участника \`MyEventsPage\` и автоматизировать проверку купленных билетов и скачивание файлов (Download).

**Требования к Page Object Model:**
1. Создать \`src/pages/MyEventsPage.ts\`.
2. Написать тест в \`tests/cabinet/tickets-and-downloads.spec.ts\`.`,
            priority: "high" as const,
            order: 15,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: ResultsPage — пошук офіційних результатів забігу за номером або атлетом",
            titleEn: "[TypeScript] POM E2E: ResultsPage — Race Protocol Lookup by Bib / Athlete Name & Table Parsing",
            titleRu: "[TypeScript] POM E2E: ResultsPage — поиск официальных результатов забега по номеру или атлету",
            description: `**Мета завдання:**
Створити Page Object для сторінки спортивних результатів (\`ResultsPage\`) та протестувати пошук протоколів забігів.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/ResultsPage.ts\`.
2. Написати тест у \`tests/results/race-results-search.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As a Competitor or Spectator, I want to search official race result protocols by athlete name or bib number to inspect chip times and rank standings.

**Technical Requirements (POM):**
1. Implement \`ResultsPage.ts\` parsing HTML data table rows into typed structured records.
2. Author \`tests/results/race-results-search.spec.ts\` verifying chip time format (\`HH:MM:SS\`).`,
            descriptionRu: `**Цель задания:**
Создать Page Object для страницы спортивных результатов (\`ResultsPage\`) и протестировать поиск протоколов забегов.

**Требования к Page Object Model:**
1. Создать \`src/pages/ResultsPage.ts\`.
2. Написать тест в \`tests/results/race-results-search.spec.ts\`.`,
            priority: "medium" as const,
            order: 16,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM API: ApiEventsClient — валідація REST контрактів подій (/api/events)",
            titleEn: "[TypeScript] POM API: ApiEventsClient — REST Contract & JSON Schema Testing (/api/events)",
            titleRu: "[TypeScript] POM API: ApiEventsClient — валидация REST контрактов событий (/api/events)",
            description: `**Мета завдання:**
Створити API Client для валідації бекенд-ендпоінтів платформи за допомогою Playwright \`request\` (APIRequestContext).

**Вимоги до реалізації:**
1. Створити \`src/api/ApiEventsClient.ts\`.
2. Написати тести у \`tests/api/events-contract.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As an SDET, I want to validate backend REST endpoints directly using Playwright \`APIRequestContext\` to ensure JSON contract consistency without browser rendering overhead.

**Technical Requirements (POM):**
1. Create \`src/api/ApiEventsClient.ts\` accepting \`APIRequestContext\`.
2. Author \`tests/api/events-contract.spec.ts\` validating HTTP 200, latency < 1200ms, and typed \`EventDto\` schema.`,
            descriptionRu: `**Цель задания:**
Создать API Client для валидации бэкенд-эндпоинтов платформы с помощью Playwright \`request\` (APIRequestContext).

**Требования к реализации:**
1. Создать \`src/api/ApiEventsClient.ts\`.
2. Написать тесты в \`tests/api/events-contract.spec.ts\`.`,
            priority: "medium" as const,
            order: 17,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Mobile & Visual: Адаптивність, бургер-меню та регресійні знімки (toHaveScreenshot)",
            titleEn: "[TypeScript] POM Mobile & Visual: Mobile Drawer Navigation & Snapshot Regression (toHaveScreenshot)",
            titleRu: "[TypeScript] POM Mobile & Visual: Адаптивность, бургер-меню и регрессионные снимки (toHaveScreenshot)",
            description: `**Мета завдання:**
Покрити платформу тестами мобільної адаптивності та візуальними регресійними перевірками за патерном Page Object.

**Вимоги до реалізації:**
1. Створити \`src/pages/mobile/MobileNavigationComponent.ts\`.
2. Написати тести у \`tests/mobile/mobile-layout.spec.ts\` та \`tests/visual/home-visual.spec.ts\`.`,
            descriptionEn: `**User Story & Goal:**
As a Mobile Athlete, I want seamless mobile navigation without horizontal scrolling, and as an Engineering Lead, I need automated pixel-level visual regression tests via \`toHaveScreenshot\`.

**Technical Requirements (POM):**
1. Implement \`MobileNavigationComponent.ts\` for drawer menu toggling.
2. Author \`tests/mobile/mobile-layout.spec.ts\` and \`tests/visual/home-visual.spec.ts\` utilizing screenshot masking for dynamic promo sliders.`,
            descriptionRu: `**Цель задания:**
Покрыть платформу тестами мобильной адаптивности и визуальными регрессионными проверками по паттерну Page Object.

**Требования к реализации:**
1. Создать \`src/pages/mobile/MobileNavigationComponent.ts\`.
2. Написать тесты в \`tests/mobile/mobile-layout.spec.ts\` и \`tests/visual/home-visual.spec.ts\`.`,
            priority: "low" as const,
            order: 18,
        },
    ];

    await db.insert(projectTasks).values(pomTasks);
    console.log(`Successfully seeded ${pomTasks.length} trilingual enterprise POM tasks for Premier Online!`);
    process.exit(0);
}

main().catch(err => {
    console.error("Error seeding tasks:", err);
    process.exit(1);
});
